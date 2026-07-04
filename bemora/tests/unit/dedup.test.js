import { describe, it, expect, vi } from 'vitest';
import { dedup } from '../../src/core/dedup.js';

describe('dedup', () => {
  it('returns the result of the factory function', async () => {
    const result = await dedup('key:1', async () => ({ data: 42 }));
    expect(result).toEqual({ data: 42 });
  });

  it('shares a single in-flight promise for the same key', async () => {
    const factory = vi.fn().mockResolvedValue('shared-result');

    // Fire two concurrent requests with the same key
    const [r1, r2] = await Promise.all([
      dedup('key:shared', factory),
      dedup('key:shared', factory),
    ]);

    expect(r1).toBe('shared-result');
    expect(r2).toBe('shared-result');
    // Factory should only be called once — second call reused the promise
    expect(factory).toHaveBeenCalledTimes(1);
  });

  it('allows a new call for the same key after the first resolves', async () => {
    const factory = vi.fn()
      .mockResolvedValueOnce('first')
      .mockResolvedValueOnce('second');

    const first = await dedup('key:sequential', factory);
    const second = await dedup('key:sequential', factory);

    expect(first).toBe('first');
    expect(second).toBe('second');
    expect(factory).toHaveBeenCalledTimes(2);
  });

  it('different keys call their factories independently', async () => {
    const factoryA = vi.fn().mockResolvedValue('a');
    const factoryB = vi.fn().mockResolvedValue('b');

    const [a, b] = await Promise.all([
      dedup('key:a', factoryA),
      dedup('key:b', factoryB),
    ]);

    expect(a).toBe('a');
    expect(b).toBe('b');
    expect(factoryA).toHaveBeenCalledTimes(1);
    expect(factoryB).toHaveBeenCalledTimes(1);
  });

  it('cleans up the in-flight map entry after rejection', async () => {
    const factory = vi.fn()
      .mockRejectedValueOnce(new Error('failed'))
      .mockResolvedValueOnce('recovered');

    await expect(dedup('key:fail', factory)).rejects.toThrow('failed');
    // After rejection the key should be gone, so the second call succeeds independently
    const result = await dedup('key:fail', factory);
    expect(result).toBe('recovered');
    expect(factory).toHaveBeenCalledTimes(2);
  });
});
