import { describe, it, expect, vi } from 'vitest';
import { withRetry } from '../../src/core/retry.js';

describe('withRetry', () => {
  it('returns result on first success', async () => {
    const fn = vi.fn().mockResolvedValue({ ok: true });
    const result = await withRetry(fn, { retries: 3 });
    expect(result).toEqual({ ok: true });
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries on network error (no status code) and eventually succeeds', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('ECONNRESET'))
      .mockRejectedValueOnce(new Error('ETIMEDOUT'))
      .mockResolvedValue({ ok: true });

    const result = await withRetry(fn, { retries: 3, baseDelay: 0 });
    expect(result).toEqual({ ok: true });
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('retries on 500 status code', async () => {
    const err = Object.assign(new Error('Server Error'), { response: { status: 500 } });
    const fn = vi.fn()
      .mockRejectedValueOnce(err)
      .mockResolvedValue({ ok: true });

    const result = await withRetry(fn, { retries: 2, baseDelay: 0 });
    expect(result).toEqual({ ok: true });
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('retries on 429 Too Many Requests', async () => {
    const err = Object.assign(new Error('Rate limited'), { response: { status: 429 } });
    const fn = vi.fn()
      .mockRejectedValueOnce(err)
      .mockResolvedValue({ data: 'ok' });

    const result = await withRetry(fn, { retries: 2, baseDelay: 0 });
    expect(result).toEqual({ data: 'ok' });
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('does NOT retry on 400 Bad Request', async () => {
    const err = Object.assign(new Error('Bad Request'), { response: { status: 400 } });
    const fn = vi.fn().mockRejectedValue(err);

    await expect(withRetry(fn, { retries: 3, baseDelay: 0 })).rejects.toThrow('Bad Request');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('does NOT retry on 401 Unauthorized', async () => {
    const err = Object.assign(new Error('Unauthorized'), { response: { status: 401 } });
    const fn = vi.fn().mockRejectedValue(err);

    await expect(withRetry(fn, { retries: 3, baseDelay: 0 })).rejects.toThrow('Unauthorized');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('does NOT retry on 404 Not Found', async () => {
    const err = Object.assign(new Error('Not Found'), { response: { status: 404 } });
    const fn = vi.fn().mockRejectedValue(err);

    await expect(withRetry(fn, { retries: 3, baseDelay: 0 })).rejects.toThrow('Not Found');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('throws after exhausting all retries', async () => {
    const err = Object.assign(new Error('Service Unavailable'), { response: { status: 503 } });
    const fn = vi.fn().mockRejectedValue(err);

    await expect(withRetry(fn, { retries: 2, baseDelay: 0 })).rejects.toThrow('Service Unavailable');
    expect(fn).toHaveBeenCalledTimes(3); // 1 initial + 2 retries
  });

  it('stops immediately if AbortSignal is already aborted', async () => {
    const controller = new AbortController();
    controller.abort(new Error('Cancelled'));
    const fn = vi.fn().mockResolvedValue('ok');

    await expect(withRetry(fn, { retries: 3, baseDelay: 0, signal: controller.signal }))
      .rejects.toThrow('Cancelled');
    expect(fn).not.toHaveBeenCalled();
  });

  it('respects custom retryOn list', async () => {
    const err = Object.assign(new Error('Custom Error'), { response: { status: 422 } });
    const fn = vi.fn()
      .mockRejectedValueOnce(err)
      .mockResolvedValue('ok');

    // 422 is not in default list but we add it
    const result = await withRetry(fn, { retries: 2, baseDelay: 0, retryOn: [422] });
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('retries up to the exact retries count', async () => {
    const err = Object.assign(new Error('fail'), { response: { status: 500 } });
    const fn = vi.fn().mockRejectedValue(err);

    await expect(withRetry(fn, { retries: 1, baseDelay: 0 })).rejects.toThrow('fail');
    expect(fn).toHaveBeenCalledTimes(2); // 1 + 1 retry
  });
});
