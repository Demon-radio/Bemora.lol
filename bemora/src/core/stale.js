import * as cache from './cache.js';

/**
 * Stale-While-Revalidate pattern.
 * Returns cached data INSTANTLY, then refreshes in background.
 * On next call, fresh data is already ready.
 *
 * @param {string} key - cache key
 * @param {Function} fetcher - async function that returns fresh data
 * @param {number} ttl - cache TTL in seconds (default 300)
 * @returns {Promise<{ data: any, stale: boolean }>}
 */
export async function staleWhileRevalidate(key, fetcher, ttl = 300) {
  const cached = cache.get(key);

  if (cached) {
    // Return stale data immediately, revalidate in background
    setImmediate(async () => {
      try {
        const fresh = await fetcher();
        cache.set(key, fresh, ttl);
      } catch (_) {}
    });
    return { data: cached, stale: true };
  }

  // No cache — fetch now
  const fresh = await fetcher();
  cache.set(key, fresh, ttl);
  return { data: fresh, stale: false };
}
