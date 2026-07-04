import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fallbackChain, aggregate } from '../../src/core/fallback.js';
import * as cache from '../../src/core/cache.js';

beforeEach(() => cache.flush());

describe('fallbackChain', () => {
  it('returns result from the first successful provider', async () => {
    const result = await fallbackChain('test:a', [
      { name: 'p1', fn: async () => ({ city: 'Cairo', temp: 25 }) },
      { name: 'p2', fn: async () => ({ city: 'Cairo', temp: 26 }) },
    ]);
    expect(result._provider).toBe('p1');
    expect(result.city).toBe('Cairo');
  });

  it('falls back to the second provider when the first fails', async () => {
    const result = await fallbackChain('test:b', [
      { name: 'p1', fn: async () => { throw new Error('timeout'); } },
      { name: 'p2', fn: async () => ({ price: 100 }) },
    ]);
    expect(result._provider).toBe('p2');
    expect(result.price).toBe(100);
    expect(result._fallback_errors).toHaveLength(1);
    expect(result._fallback_errors[0].provider).toBe('p1');
  });

  it('returns stale cache when all providers fail', async () => {
    // Pre-populate cache
    cache.set('test:stale', { staleData: true }, 600);

    const result = await fallbackChain('test:stale', [
      { name: 'p1', fn: async () => { throw new Error('down'); } },
      { name: 'p2', fn: async () => { throw new Error('down'); } },
    ]);
    expect(result._stale).toBe(true);
    expect(result._provider).toBe('cache');
    expect(result.staleData).toBe(true);
  });

  it('throws when all providers fail and no cache exists', async () => {
    await expect(fallbackChain('test:no-cache', [
      { name: 'p1', fn: async () => { throw new Error('err1'); } },
      { name: 'p2', fn: async () => { throw new Error('err2'); } },
    ])).rejects.toThrow('All providers failed');
  });

  it('caches the successful result', async () => {
    await fallbackChain('test:cache-result', [
      { name: 'p1', fn: async () => ({ data: 'fresh' }) },
    ]);
    expect(cache.get('test:cache-result')).toEqual({ data: 'fresh' });
  });
});

describe('aggregate', () => {
  it('returns all results with strategy "all"', async () => {
    const result = await aggregate([
      { name: 'src1', fn: async () => ({ price: 100 }) },
      { name: 'src2', fn: async () => ({ price: 102 }) },
    ], { strategy: 'all' });
    expect(result.results).toHaveLength(2);
    expect(result.strategy).toBe('all');
  });

  it('returns first result with strategy "first"', async () => {
    const result = await aggregate([
      { name: 'src1', fn: async () => ({ price: 100 }) },
      { name: 'src2', fn: async () => ({ price: 102 }) },
    ], { strategy: 'first' });
    expect(result.price).toBe(100);
    expect(result._provider).toBe('src1');
  });

  it('averages a field with strategy "average"', async () => {
    const result = await aggregate([
      { name: 'src1', fn: async () => ({ temp: 20 }) },
      { name: 'src2', fn: async () => ({ temp: 24 }) },
      { name: 'src3', fn: async () => ({ temp: 22 }) },
    ], { strategy: 'average', field: 'temp' });
    expect(result.temp).toBe(22);
    expect(result.strategy).toBe('average');
  });

  it('picks median with strategy "majority"', async () => {
    const result = await aggregate([
      { name: 'src1', fn: async () => ({ val: 10 }) },
      { name: 'src2', fn: async () => ({ val: 20 }) },
      { name: 'src3', fn: async () => ({ val: 30 }) },
    ], { strategy: 'majority', field: 'val' });
    expect([10, 20, 30]).toContain(result.val);
  });

  it('reports failures but succeeds if at least one source works', async () => {
    const result = await aggregate([
      { name: 'src1', fn: async () => { throw new Error('down'); } },
      { name: 'src2', fn: async () => ({ price: 55 }) },
    ], { strategy: 'first' });
    expect(result.failures).toHaveLength(1);
    expect(result.price).toBe(55);
  });

  it('throws when all sources fail', async () => {
    await expect(aggregate([
      { name: 's1', fn: async () => { throw new Error('e1'); } },
      { name: 's2', fn: async () => { throw new Error('e2'); } },
    ], { strategy: 'all' })).rejects.toThrow('All sources failed');
  });
});
