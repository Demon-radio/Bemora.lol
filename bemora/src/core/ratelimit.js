/**
 * Simple in-memory rate limit tracker.
 * Tracks usage per provider and warns before hitting limits.
 */
const usage = new Map();

const FREE_LIMITS = {
  openweathermap: { limit: 1000, window: 'day' },
  exchangerate: { limit: 1500, window: 'month' },
  newsapi: { limit: 100, window: 'day' },
  unsplash: { limit: 50, window: 'hour' },
  pexels: { limit: 200, window: 'hour' },
  apifootball: { limit: 100, window: 'day' },
  goldapi: { limit: 100, window: 'month' },
  coingecko: { limit: 30, window: 'minute' },
};

/**
 * Record a request for a provider
 * @param {string} provider
 */
export function recordRequest(provider) {
  const now = Date.now();
  if (!usage.has(provider)) usage.set(provider, []);
  const calls = usage.get(provider);
  calls.push(now);
  usage.set(provider, calls.filter((t) => now - t < 60 * 60 * 1000)); // keep last hour
}

/**
 * Get rate limit status for a provider
 * @param {string} provider
 * @returns {{ used: number, limit: number, window: string, warning: boolean }}
 */
export function getStatus(provider) {
  const calls = usage.get(provider) || [];
  const meta = FREE_LIMITS[provider] || { limit: Infinity, window: 'unknown' };
  const warning = calls.length > meta.limit * 0.8;
  return { provider, used: calls.length, limit: meta.limit, window: meta.window, warning };
}

/**
 * Get status for all tracked providers
 * @returns {Object[]}
 */
export function getAllStatus() {
  return Object.keys(FREE_LIMITS).map(getStatus);
}
