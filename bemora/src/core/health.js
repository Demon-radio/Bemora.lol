import axios from 'axios';

const PROVIDERS = {
  openweathermap: 'https://api.openweathermap.org/data/2.5/weather?q=London&appid=test',
  exchangerate: 'https://v6.exchangerate-api.com/v6/test/latest/USD',
  newsapi: 'https://newsapi.org/v2/top-headlines?country=us&apiKey=test',
  unsplash: 'https://api.unsplash.com/photos/random',
  pexels: 'https://api.pexels.com/v1/search?query=test',
  apifootball: 'https://v3.football.api-sports.io/status',
  coingecko: 'https://api.coingecko.com/api/v3/ping',
  goldapi: 'https://www.goldapi.io/api/XAU/USD',
  wikipedia: 'https://en.wikipedia.org/api/rest_v1/page/summary/Test',
  openlibrary: 'https://openlibrary.org/search.json?q=test&limit=1',
};

/**
 * Check health of all providers
 * @returns {Promise<Object[]>}
 */
export async function checkAllHealth() {
  const results = await Promise.allSettled(
    Object.entries(PROVIDERS).map(async ([name, url]) => {
      const start = Date.now();
      try {
        await axios.get(url, { timeout: 5000, validateStatus: () => true });
        return { provider: name, status: 'online', responseTime: `${Date.now() - start}ms` };
      } catch {
        return { provider: name, status: 'offline', responseTime: null };
      }
    })
  );
  return results.map((r) => r.value || r.reason);
}

/**
 * Check health of a single provider
 * @param {string} name
 * @returns {Promise<Object>}
 */
export async function checkHealth(name) {
  const url = PROVIDERS[name];
  if (!url) throw new Error(`Unknown provider: ${name}`);
  const start = Date.now();
  try {
    await axios.get(url, { timeout: 5000, validateStatus: () => true });
    return { provider: name, status: 'online', responseTime: `${Date.now() - start}ms` };
  } catch {
    return { provider: name, status: 'offline', responseTime: null };
  }
}
