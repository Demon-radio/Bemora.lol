/**
 * Simple in-memory rate limit tracker.
 * Tracks usage per provider and warns before hitting limits.
 */
const usage = new Map();

const WINDOW_MS = {
  minute: 60 * 1000,
  hour: 60 * 60 * 1000,
  day: 24 * 60 * 60 * 1000,
  month: 30 * 24 * 60 * 60 * 1000,
};

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

function getWindowStart(now, windowKey) {
  const ms = WINDOW_MS[windowKey] || WINDOW_MS.hour;
  return Math.floor(now / ms) * ms;
}

/**
 * Check if provider is rate limited
 * @param {string} provider
 * @returns {boolean}
 */
export function isRateLimited(provider) {
  const now = Date.now();
  const meta = FREE_LIMITS[provider];
  if (!meta) return false;
  
  const providerUsage = usage.get(provider) || [];
  const windowStart = getWindowStart(now, meta.window);
  const callsInWindow = providerUsage.filter(t => t >= windowStart).length;
  return callsInWindow >= meta.limit;
}

/**
 * Record a request for a provider and check limit
 * @param {string} provider
 * @throws {Error} if rate limit exceeded
 */
export function recordRequest(provider) {
  const now = Date.now();
  if (!usage.has(provider)) usage.set(provider, []);
  
  const meta = FREE_LIMITS[provider];
  if (meta) {
    const windowStart = getWindowStart(now, meta.window);
    // Clean up old entries
    const providerUsage = usage.get(provider).filter(t => t >= windowStart);
    if (providerUsage.length >= meta.limit) {
      throw new Error(`Rate limit exceeded for ${provider}: ${meta.limit} requests per ${meta.window}`);
    }
    providerUsage.push(now);
    usage.set(provider, providerUsage);
  } else {
    const calls = usage.get(provider);
    calls.push(now);
    usage.set(provider, calls.filter((t) => now - t < WINDOW_MS.hour)); // keep last hour
  }
}

/**
 * Get rate limit status for a provider
 * @param {string} provider
 * @returns {{ used: number, limit: number, window: string, warning: boolean }}
 */
export function getStatus(provider) {
  const now = Date.now();
  const providerUsage = usage.get(provider) || [];
  const meta = FREE_LIMITS[provider] || { limit: Infinity, window: 'unknown' };
  let used = providerUsage.length;
  if (meta.limit !== Infinity) {
    const windowStart = getWindowStart(now, meta.window);
    used = providerUsage.filter(t => t >= windowStart).length;
  }
  const warning = used > meta.limit * 0.8;
  return { provider, used, limit: meta.limit, window: meta.window, warning };
}

/**
 * Get status for all tracked providers
 * @returns {Object[]}
 */
export function getAllStatus() {
  return Object.keys(FREE_LIMITS).map(getStatus);
}
