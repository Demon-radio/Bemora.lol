import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();

const BASE = 'https://api.macvendors.com';

/**
 * Look up the vendor for a MAC address.
 * @param {Object} params
 * @param {string} params.mac - MAC address
 * @returns {Promise<Object>} vendor name
 */
export async function lookup({ mac } = {}) {
  const cacheKey = `macvendors:lookup:${mac}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/${encodeURIComponent(mac)}`, { responseType: 'text' });
    const result = { mac, vendor: String(data), _cached: false };
    cache.set(cacheKey, result, 86400);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'macvendors');
  }
}
