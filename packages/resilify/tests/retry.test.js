import { describe, it, expect, vi } from 'vitest';
import { withRetry } from '../src/retry.js';

describe('withRetry()', () => {
  it('returns the result immediately when the first attempt succeeds', async () => {
    const fn = vi.fn(async () => 'hello');
    const result = await withRetry(fn);
    expect(result).toBe('hello');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries up to `retries` times and returns on eventual success', async () => {
    let calls = 0;
    const fn = vi.fn(async () => {
      if (++calls < 3) throw new Error('transient');
      return 'ok';
    });
    const result = await withRetry(fn, { retries: 3, baseDelay: 1 });
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('throws the last error after exhausting all retries', async () => {
    const fn = vi.fn(async () => { throw new Error('permanent'); });
    await expect(withRetry(fn, { retries: 2, baseDelay: 1 })).rejects.toThrow('permanent');
    expect(fn).toHaveBeenCalledTimes(3); // 1 initial + 2 retries
  });

  it('does NOT retry non-retryable HTTP status codes (404)', async () => {
    const fn = vi.fn(async () => {
      const e = new Error('not found'); e.status = 404; throw e;
    });
    await expect(withRetry(fn, { retries: 5, baseDelay: 1 })).rejects.toThrow('not found');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('DOES retry retryable HTTP status codes (503)', async () => {
    let calls = 0;
    const fn = vi.fn(async () => {
      if (++calls < 3) { const e = new Error('unavailable'); e.status = 503; throw e; }
      return 'back up';
    });
    const result = await withRetry(fn, { retries: 3, baseDelay: 1 });
    expect(result).toBe('back up');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('respects a custom retryOn list', async () => {
    const fn = vi.fn(async () => {
      const e = new Error('conflict'); e.status = 409; throw e;
    });
    // 409 is not in the default list, so it should NOT be retried by default
    await expect(withRetry(fn, { retries: 3, baseDelay: 1 })).rejects.toThrow('conflict');
    expect(fn).toHaveBeenCalledTimes(1);

    // But it should be retried when we include 409
    fn.mockClear();
    fn.mockImplementationOnce(async () => { const e = new Error('conflict'); e.status = 409; throw e; })
      .mockImplementationOnce(async () => 'resolved');
    const result = await withRetry(fn, { retries: 2, baseDelay: 1, retryOn: [409] });
    expect(result).toBe('resolved');
  });

  it('respects err.response.status as well as err.status', async () => {
    const fn = vi.fn(async () => {
      const e = new Error('server error');
      e.response = { status: 500 };
      throw e;
    });
    let calls = 0;
    fn.mockImplementation(async () => {
      if (++calls < 2) { const e = new Error('server error'); e.response = { status: 500 }; throw e; }
      return 'recovered';
    });
    const result = await withRetry(fn, { retries: 2, baseDelay: 1 });
    expect(result).toBe('recovered');
  });

  it('stops immediately when the AbortSignal is already aborted', async () => {
    const controller = new AbortController();
    controller.abort();
    const fn = vi.fn(async () => { throw new Error('would retry'); });
    await expect(withRetry(fn, { retries: 5, baseDelay: 1, signal: controller.signal })).rejects.toThrow();
    // fn may or may not be called once; the key invariant is it is NOT retried
    expect(fn.mock.calls.length).toBeLessThanOrEqual(1);
  });

  it('aborts mid-sleep without waiting the full delay', async () => {
    const controller = new AbortController();
    const fn = vi.fn(async () => { throw new Error('fail'); });

    const start = Date.now();
    // Start retrying with a long delay, then abort almost immediately
    const promise = withRetry(fn, { retries: 5, baseDelay: 5000, signal: controller.signal });
    setTimeout(() => controller.abort(), 30);

    await expect(promise).rejects.toThrow();
    // Should resolve well under the 5000ms delay
    expect(Date.now() - start).toBeLessThan(2000);
  });
});
