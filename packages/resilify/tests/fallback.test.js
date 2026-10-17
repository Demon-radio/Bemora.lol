import { describe, it, expect, vi } from 'vitest';
import { failover, aggregate } from '../src/fallback.js';

// ── failover() ──────────────────────────────────────────────────────────────

describe('failover()', () => {
  it('returns the first source result and attaches _source metadata', async () => {
    const result = await failover([
      { name: 'a', fn: async () => ({ price: 100 }) },
      { name: 'b', fn: async () => ({ price: 200 }) },
    ]);
    expect(result.price).toBe(100);
    expect(result._source).toBe('a');
    expect(result._failedSources).toEqual([]);
  });

  it('skips failed sources and succeeds on the next one', async () => {
    const result = await failover([
      { name: 'bad', fn: async () => { throw new Error('down'); } },
      { name: 'good', fn: async () => ({ value: 42 }) },
    ]);
    expect(result.value).toBe(42);
    expect(result._source).toBe('good');
    expect(result._failedSources[0].source).toBe('bad');
  });

  it('throws an aggregated error when every source fails', async () => {
    await expect(
      failover([
        { name: 'x', fn: async () => { throw new Error('x down'); } },
        { name: 'y', fn: async () => { throw new Error('y down'); } },
      ]),
    ).rejects.toThrow(/x down/);
  });

  it('calls onProviderError for each failing source', async () => {
    const onErr = vi.fn();
    await failover([
      { name: 'bad', fn: async () => { throw new Error('oops'); } },
      { name: 'ok', fn: async () => ({ ok: true }) },
    ], { onProviderError: onErr });
    expect(onErr).toHaveBeenCalledWith('bad', expect.any(Error));
  });

  it('caches the successful result and serves it stale when all sources later fail', async () => {
    const store = new Map();
    const cache = { get: (k) => store.get(k), set: (k, v) => store.set(k, v) };

    await failover([{ name: 'src', fn: async () => ({ rate: 1.5 }) }], { cache, cacheKey: 'fx' });
    const stale = await failover([
      { name: 'src', fn: async () => { throw new Error('down'); } },
    ], { cache, cacheKey: 'fx' });

    expect(stale.rate).toBe(1.5);
    expect(stale._stale).toBe(true);
    expect(stale._source).toBe('cache');
  });

  it('wraps non-object results in { value }', async () => {
    const result = await failover([{ name: 'num', fn: async () => 99 }]);
    expect(result.value).toBe(99);
    expect(result._source).toBe('num');
  });

  it('handles array results without spreading metadata onto them', async () => {
    const result = await failover([{ name: 'arr', fn: async () => [1, 2, 3] }]);
    expect(result.value).toEqual([1, 2, 3]);
  });
});

// ── aggregate() ─────────────────────────────────────────────────────────────

describe('aggregate() — strategy: first', () => {
  it('returns the data from the first source to resolve', async () => {
    const result = await aggregate([
      { name: 'fast', fn: async () => ({ price: 1 }) },
      { name: 'slow', fn: async () => ({ price: 2 }) },
    ], { strategy: 'first' });
    expect(result.price).toBe(1);
    expect(result._source).toBe('fast');
  });

  it('falls through to the next when the first rejects', async () => {
    const result = await aggregate([
      { name: 'bad', fn: async () => { throw new Error('bad'); } },
      { name: 'ok', fn: async () => ({ price: 9 }) },
    ], { strategy: 'first' });
    expect(result.price).toBe(9);
    expect(result.failures[0].name).toBe('bad');
  });

  it('throws when every source fails', async () => {
    await expect(aggregate([
      { name: 'a', fn: async () => { throw new Error('a'); } },
    ], { strategy: 'first' })).rejects.toThrow(/All sources failed/);
  });
});

describe('aggregate() — strategy: all', () => {
  it('returns all results regardless of partial failures', async () => {
    const result = await aggregate([
      { name: 'a', fn: async () => ({ v: 1 }) },
      { name: 'b', fn: async () => { throw new Error('b down'); } },
      { name: 'c', fn: async () => ({ v: 3 }) },
    ], { strategy: 'all' });
    expect(result.results).toHaveLength(2);
    expect(result.failures).toHaveLength(1);
  });
});

describe('aggregate() — strategy: average', () => {
  it('averages the specified numeric field', async () => {
    const result = await aggregate([
      { name: 'a', fn: async () => ({ price: 100 }) },
      { name: 'b', fn: async () => ({ price: 200 }) },
      { name: 'c', fn: async () => ({ price: 300 }) },
    ], { strategy: 'average', field: 'price' });
    expect(result.price).toBe(200);
    expect(result.strategy).toBe('average');
  });
});

describe('aggregate() — strategy: majority (mode)', () => {
  it('returns the most frequently occurring value', async () => {
    const result = await aggregate([
      { name: 'a', fn: async () => ({ status: 'UP' }) },
      { name: 'b', fn: async () => ({ status: 'UP' }) },
      { name: 'c', fn: async () => ({ status: 'DOWN' }) },
    ], { strategy: 'majority', field: 'status' });
    expect(result.status).toBe('UP');
    expect(result.strategy).toBe('majority');
  });

  it('handles numeric majority (mode)', async () => {
    const result = await aggregate([
      { name: 'a', fn: async () => ({ code: 200 }) },
      { name: 'b', fn: async () => ({ code: 200 }) },
      { name: 'c', fn: async () => ({ code: 503 }) },
    ], { strategy: 'majority', field: 'code' });
    expect(result.code).toBe(200);
  });
});

describe('aggregate() — strategy: median', () => {
  it('returns the median of an odd-count array', async () => {
    const result = await aggregate([
      { name: 'a', fn: async () => ({ price: 100 }) },
      { name: 'b', fn: async () => ({ price: 300 }) },
      { name: 'c', fn: async () => ({ price: 200 }) },
    ], { strategy: 'median', field: 'price' });
    expect(result.price).toBe(200);
    expect(result.strategy).toBe('median');
  });

  it('returns the average of the two middle values for even-count arrays', async () => {
    const result = await aggregate([
      { name: 'a', fn: async () => ({ price: 100 }) },
      { name: 'b', fn: async () => ({ price: 200 }) },
      { name: 'c', fn: async () => ({ price: 300 }) },
      { name: 'd', fn: async () => ({ price: 400 }) },
    ], { strategy: 'median', field: 'price' });
    expect(result.price).toBe(250);
  });
});
