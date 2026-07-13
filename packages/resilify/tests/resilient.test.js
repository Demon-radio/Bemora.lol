import { describe, it, expect, beforeEach, vi } from 'vitest';
import { resilient, resilientFailover, resetAllBreakers, getBreaker, TimeoutError, CircuitOpenError } from '../src/index.js';

beforeEach(() => {
  resetAllBreakers();
});

describe('resilient()', () => {
  it('returns the result on success', async () => {
    const result = await resilient(async () => 'ok', { key: 'test-a' });
    expect(result).toBe('ok');
  });

  it('retries a failing call up to `retries` times then succeeds', async () => {
    let calls = 0;
    const fn = vi.fn(async () => {
      calls++;
      if (calls < 3) throw new Error('network blip');
      return 'recovered';
    });
    const result = await resilient(fn, { key: 'test-b', retries: 3, baseDelay: 1 });
    expect(result).toBe('recovered');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('gives up after exhausting retries and throws the last error', async () => {
    const fn = vi.fn(async () => { throw new Error('always fails'); });
    await expect(resilient(fn, { key: 'test-c', retries: 2, baseDelay: 1 })).rejects.toThrow('always fails');
    expect(fn).toHaveBeenCalledTimes(3); // initial + 2 retries
  });

  it('does not retry non-retryable HTTP status codes (e.g. 404)', async () => {
    const fn = vi.fn(async () => { const e = new Error('not found'); e.status = 404; throw e; });
    await expect(resilient(fn, { key: 'test-d', retries: 3, baseDelay: 1 })).rejects.toThrow('not found');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('times out a call that never resolves', async () => {
    const fn = () => new Promise((resolve) => setTimeout(resolve, 500));
    await expect(resilient(fn, { key: 'test-e', timeout: 20, retries: 0 })).rejects.toThrow(TimeoutError);
  });

  it('opens the circuit after failureThreshold consecutive failures, then fails fast', async () => {
    const fn = vi.fn(async () => { throw new Error('down'); });
    for (let i = 0; i < 5; i++) {
      await expect(
        resilient(fn, { key: 'test-f', retries: 0, circuitOptions: { failureThreshold: 5, openDuration: 10_000 } })
      ).rejects.toThrow();
    }
    expect(getBreaker('test-f').state).toBe('OPEN');

    const callsBeforeOpen = fn.mock.calls.length;
    await expect(resilient(fn, { key: 'test-f', retries: 0 })).rejects.toThrow(CircuitOpenError);
    expect(fn).toHaveBeenCalledTimes(callsBeforeOpen); // fn was NOT called again — rejected by the breaker
  });

  it('can disable the circuit breaker per call', async () => {
    const fn = vi.fn(async () => 'ok');
    const result = await resilient(fn, { key: 'test-g', circuitBreaker: false });
    expect(result).toBe('ok');
  });
});

describe('resilientFailover()', () => {
  it('falls through to the next source when the first fails', async () => {
    const primary = vi.fn(async () => { throw new Error('primary down'); });
    const backup = vi.fn(async () => ({ value: 42 }));

    const result = await resilientFailover([
      { name: 'primary', fn: primary },
      { name: 'backup', fn: backup },
    ], { retries: 0 });

    expect(result.value).toBe(42);
    expect(result._source).toBe('backup');
    expect(primary).toHaveBeenCalled();
    expect(backup).toHaveBeenCalled();
  });

  it('throws with a combined error message when every source fails', async () => {
    await expect(
      resilientFailover([
        { name: 'a', fn: async () => { throw new Error('a down'); } },
        { name: 'b', fn: async () => { throw new Error('b down'); } },
      ], { retries: 0 })
    ).rejects.toThrow(/a down/);
  });

  it('falls back to a stale cached value when every source fails and a cache is provided', async () => {
    const store = new Map();
    const cache = { get: (k) => store.get(k), set: (k, v) => store.set(k, v) };

    const first = await resilientFailover([{ name: 'primary', fn: async () => ({ price: 100 }) }], {
      cache, cacheKey: 'btc', retries: 0,
    });
    expect(first.price).toBe(100);

    const second = await resilientFailover([{ name: 'primary', fn: async () => { throw new Error('down'); } }], {
      cache, cacheKey: 'btc', retries: 0,
    });
    expect(second.price).toBe(100);
    expect(second._stale).toBe(true);
  });
});
