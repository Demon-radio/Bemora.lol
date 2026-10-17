import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();

const BASE = 'https://www.imf.org/external/datamapper/api/v1';

/**
 * Fetch all values for an IMF indicator.
 * @param {Object} params
 * @param {string} params.indicator - IMF indicator code
 * @returns {Promise<Object>} indicator plus values
 */
export async function data({ indicator } = {}) {
  const cacheKey = `imf:data:${indicator}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/${encodeURIComponent(indicator)}`);
    const result = {
      indicator,
      values: data.values?.[indicator] ?? data.values,
      _cached: false,
    };
    cache.set(cacheKey, result, 3600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'imf');
  }
}

/**
 * Fetch an IMF indicator's values for a single country.
 * @param {Object} params
 * @param {string} params.indicator - IMF indicator code
 * @param {string} params.country - country code
 * @returns {Promise<Object>} indicator, country, and values
 */
export async function country({ indicator, country } = {}) {
  const cacheKey = `imf:country:${indicator}:${country}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(
      `${BASE}/${encodeURIComponent(indicator)}/${encodeURIComponent(country)}`
    );
    const result = {
      indicator,
      country,
      values: data.values?.[indicator]?.[country] ?? data.values,
      _cached: false,
    };
    cache.set(cacheKey, result, 3600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'imf');
  }
}

/**
 * Fetch the list of available IMF indicators.
 * @returns {Promise<Object>} indicators map
 */
export async function indicators() {
  const cacheKey = 'imf:indicators';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/indicators`);
    const result = { indicators: data.indicators, _cached: false };
    cache.set(cacheKey, result, 86400);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'imf');
  }
}
