import { describe, it, expect, beforeEach, vi } from 'vitest';
import { staleWhileRevalidate } from '../../src/core/stale.js';
import * as cache from '../../src/core/cache.js';

beforeEach(() => {
  cache.flush();
});

describe('staleWhileRevalidate', () => {
  it('fetches fresh data when cache is empty', async () => {
    const fetcher = vi.fn().mockResolvedValue({ temp: 25 });
    const result = await staleWhileRevalidate('swr:fresh', fetcher, 60);

    expect(result.stale).toBe(false);
    expect(result.data).toEqual({ temp: 25 });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('caches the fetched result for subsequent calls', async () => {
    const fetcher = vi.fn().mockResolvedValue({ temp: 25 });
    await staleWhileRevalidate('swr:cache', fetcher, 60);
    expect(cache.get('swr:cache')).toEqual({ temp: 25 });
  });

  it('returns stale cached data immediately when cache is populated', async () => {
    cache.set('swr:stale', { temp: 20 }, 300);
    const fetcher = vi.fn().mockResolvedValue({ temp: 25 });

    const result = await staleWhileRevalidate('swr:stale', fetcher, 60);
    expect(result.stale).toBe(true);
    expect(result.data).toEqual({ temp: 20 }); // returns the OLD value
  });

  it('triggers background revalidation when returning stale data', async () => {
    cache.set('swr:bg', { temp: 20 }, 300);
    const fetcher = vi.fn().mockResolvedValue({ temp: 99 });

    await staleWhileRevalidate('swr:bg', fetcher, 60);

    // Wait for setImmediate to fire
    await new Promise((r) => setImmediate(r));
    await new Promise((r) => setImmediate(r)); // extra tick for the async fetcher

    expect(fetcher).toHaveBeenCalledTimes(1);
    // Cache should now have the fresh value
    expect(cache.get('swr:bg')).toEqual({ temp: 99 });
  });

  it('does not throw when background revalidation fails', async () => {
    cache.set('swr:err', { temp: 20 }, 300);
    const fetcher = vi.fn().mockRejectedValue(new Error('network down'));

    // Should not throw — returns stale immediately
    await expect(staleWhileRevalidate('swr:err', fetcher, 60)).resolves.toMatchObject({
      stale: true,
      data: { temp: 20 },
    });
  });

  it('propagates fetcher errors when cache is empty', async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error('fetch failed'));
    await expect(staleWhileRevalidate('swr:no-cache-err', fetcher, 60)).rejects.toThrow('fetch failed');
  });

  it('each unique key is cached independently', async () => {
    const fetchA = vi.fn().mockResolvedValue({ city: 'Cairo' });
    const fetchB = vi.fn().mockResolvedValue({ city: 'London' });

    const a = await staleWhileRevalidate('swr:city:cairo', fetchA);
    const b = await staleWhileRevalidate('swr:city:london', fetchB);

    expect(a.data.city).toBe('Cairo');
    expect(b.data.city).toBe('London');
  });
});
