import axios from 'axios';

/**
 * Health-check endpoints. `keyParam` names the query param that carries the API key
 * (when the provider needs one). `unauthedIsOk` marks providers where the endpoint
 * itself doesn't require a key to be reachable/healthy (public data endpoints).
 */
const PROVIDERS = {
  openweathermap: { url: 'https://api.openweathermap.org/data/2.5/weather', params: { q: 'London' }, keyParam: 'appid', keyName: 'weather' },
  exchangerate: { url: (key) => `https://v6.exchangerate-api.com/v6/${key || 'test'}/latest/USD`, keyName: 'currency' },
  newsapi: { url: 'https://newsapi.org/v2/top-headlines', params: { country: 'us' }, keyParam: 'apiKey', keyName: 'news' },
  unsplash: { url: 'https://api.unsplash.com/photos/random', authHeader: (key) => ({ Authorization: `Client-ID ${key}` }), keyName: 'unsplash' },
  pexels: { url: 'https://api.pexels.com/v1/search', params: { query: 'test' }, authHeader: (key) => ({ Authorization: key }), keyName: 'pexels' },
  apifootball: { url: 'https://v3.football.api-sports.io/status', authHeader: (key) => ({ 'x-apisports-key': key }), keyName: 'football' },
  coingecko: { url: 'https://api.coingecko.com/api/v3/ping' },
  goldapi: { url: 'https://www.goldapi.io/api/XAU/USD', authHeader: (key) => ({ 'x-access-token': key }), keyName: 'gold' },
  wikipedia: { url: 'https://en.wikipedia.org/api/rest_v1/page/summary/Test', headers: { 'User-Agent': 'bemora-npm-library (+https://github.com/Demon-radio/Bemora.lol)' } },
  openlibrary: { url: 'https://openlibrary.org/search.json', params: { q: 'test', limit: 1 } },
};

/**
 * Run one provider's health check.
 * Distinguishes: "offline" (network/timeout failure), "unauthorized" (401/403 — key
 * missing or invalid), and "online" (2xx/expected response).
 * @param {string} name
 * @param {Object} keys - the caller's configured API keys (Bemora._keys), used to run
 *                         a *real* authenticated check instead of a fake "test" key.
 */
export async function checkHealth(name, keys = {}) {
  const cfg = PROVIDERS[name];
  if (!cfg) throw new Error(`Unknown provider: ${name}`);

  const apiKey = cfg.keyName ? keys[cfg.keyName] : undefined;
  const url = typeof cfg.url === 'function' ? cfg.url(apiKey) : cfg.url;
  const params = { ...(cfg.params || {}) };
  if (cfg.keyParam) params[cfg.keyParam] = apiKey || 'test';
  const headers = { ...(cfg.headers || {}), ...(cfg.authHeader ? cfg.authHeader(apiKey || 'test') : {}) };

  const start = Date.now();
  try {
    const res = await axios.get(url, { params, headers, timeout: 5000, validateStatus: () => true });
    const responseTime = `${Date.now() - start}ms`;

    if (res.status === 401 || res.status === 403) {
      return {
        provider: name,
        status: 'unauthorized',
        keyConfigured: Boolean(apiKey),
        httpStatus: res.status,
        responseTime,
        note: apiKey ? 'Endpoint reachable but the configured key was rejected.' : 'Endpoint reachable but no key is configured (or a placeholder was used).',
      };
    }
    if (res.status >= 500) {
      return { provider: name, status: 'degraded', httpStatus: res.status, responseTime };
    }
    return {
      provider: name,
      status: 'online',
      keyConfigured: cfg.keyName ? Boolean(apiKey) : undefined,
      httpStatus: res.status,
      responseTime,
    };
  } catch (err) {
    return { provider: name, status: 'offline', error: err.code || err.message, responseTime: null };
  }
}

/**
 * Check health of all providers
 * @param {Object} keys - the caller's configured API keys (Bemora._keys)
 * @returns {Promise<Object[]>}
 */
export async function checkAllHealth(keys = {}) {
  const results = await Promise.allSettled(Object.keys(PROVIDERS).map((name) => checkHealth(name, keys)));
  return results.map((r) => (r.status === 'fulfilled' ? r.value : { status: 'offline', error: r.reason?.message }));
}
