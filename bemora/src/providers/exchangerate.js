import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();

const BASE = 'https://open.er-api.com/v6';

/**
 * Fetch the latest exchange rates for a base currency.
 * @param {Object} params
 * @param {string} [params.base=USD] - base currency code
 * @returns {Promise<Object>} normalized exchange rates
 */
export async function latest({ base = 'USD' } = {}) {
  const cacheKey = `exchangerate:latest:${base}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/latest/${encodeURIComponent(base)}`);
    const result = {
      result: data.result,
      base: data.base_code,
      updated: data.time_last_update_utc,
      rates: data.rates,
      _cached: false,
    };
    cache.set(cacheKey, result, 3600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'exchangerate');
  }
}
