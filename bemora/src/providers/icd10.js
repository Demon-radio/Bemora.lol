import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();

const BASE = 'https://clinicaltables.nlm.nih.gov/api';

/**
 * Search ICD-10-CM codes by terms.
 * @param {Object} params
 * @param {string} params.terms - search terms
 * @param {number} [params.max=10] - max number of results
 * @returns {Promise<Object>} terms, total, codes plus results array
 */
export async function search({ terms, max = 10 } = {}) {
  const cacheKey = `clinicaltables:search:${terms}:${max}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/icd10cm/v3/search`, {
      params: { terms, maxList: max, sf: 'code,name', df: 'code,name' },
    });
    const result = {
      terms,
      total: data[0],
      codes: data[1] || [],
      results: (data[3] || []).map(([code, name]) => ({ code, name })),
      _cached: false,
    };
    cache.set(cacheKey, result, 86400);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'clinicaltables');
  }
}

/**
 * Look up an ICD-10-CM code.
 * @param {Object} params
 * @param {string} params.code - ICD-10-CM code
 * @returns {Promise<Object>} code plus results array
 */
export async function lookup({ code } = {}) {
  const cacheKey = `clinicaltables:lookup:${code}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/icd10cm/v3/search`, {
      params: { terms: code, maxList: 5, sf: 'code,name', df: 'code,name' },
    });
    const result = {
      code,
      results: (data[3] || []).map(([c, name]) => ({ code: c, name })),
      _cached: false,
    };
    cache.set(cacheKey, result, 86400);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'clinicaltables');
  }
}
