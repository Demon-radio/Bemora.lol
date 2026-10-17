import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();
const BASE = 'https://geocoding-api.open-meteo.com/v1/search';

/**
 * Search for places by name using the Open-Meteo geocoding API.
 * @param {Object} params
 * @param {string} params.name
 * @param {number} [params.count]
 * @param {string} [params.language]
 * @returns {Promise<Object>}
 */
export async function search({ name, count = 5, language = 'en' }) {
  const cacheKey = `geocoding:search:${name}:${count}:${language}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(BASE, { params: { name, count, language } });
    const results = (data.results || []).map((r) => ({
      name: r.name,
      country: r.country,
      country_code: r.country_code,
      admin1: r.admin1,
      latitude: r.latitude,
      longitude: r.longitude,
      elevation: r.elevation,
      timezone: r.timezone,
      population: r.population,
    }));
    const result = { query: name, count: results.length, results, _cached: false };
    cache.set(cacheKey, result, 86400);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'geocoding');
  }
}
