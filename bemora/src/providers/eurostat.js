import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();

const BASE = 'https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data';

/**
 * Fetch an arbitrary Eurostat dataset.
 * @param {Object} params
 * @param {string} params.dataset - Eurostat dataset code
 * @param {string} [params.geo] - geographic filter
 * @param {string} [params.time] - time filter
 * @returns {Promise<Object>} normalized dataset payload
 */
export async function dataset({ dataset, geo, time } = {}) {
  const cacheKey = `eurostat:dataset:${dataset}:${geo}:${time}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const params = { format: 'JSON' };
    if (geo !== undefined) params.geo = geo;
    if (time !== undefined) params.time = time;
    const { data } = await http.get(`${BASE}/${encodeURIComponent(dataset)}`, { params });
    const result = {
      dataset,
      label: data.label,
      updated: data.updated,
      value: data.value,
      _cached: false,
    };
    cache.set(cacheKey, result, 3600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'eurostat');
  }
}

/**
 * Fetch a slice of the Eurostat GDP dataset.
 * @param {Object} params
 * @param {string} [params.geo=DE] - geographic filter
 * @param {string} [params.time=2022] - time filter
 * @returns {Promise<Object>} normalized GDP dataset payload
 */
export async function gdp({ geo = 'DE', time = '2022' } = {}) {
  const cacheKey = `eurostat:gdp:${geo}:${time}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/nama_10_gdp`, {
      params: { format: 'JSON', geo, time },
    });
    const result = {
      dataset: 'nama_10_gdp',
      geo,
      time,
      label: data.label,
      value: data.value,
      _cached: false,
    };
    cache.set(cacheKey, result, 3600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'eurostat');
  }
}
