import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();

const BASE = 'https://ghoapi.azureedge.net/api';

/**
 * List WHO GHO indicators.
 * @returns {Promise<Object>} indicators array
 */
export async function indicators() {
  const cacheKey = 'who-gho:indicators';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/Indicator`);
    const result = {
      indicators: (data.value || []).map((i) => ({
        code: i.IndicatorCode,
        name: i.IndicatorName,
      })),
      _cached: false,
    };
    cache.set(cacheKey, result, 86400);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'who-gho');
  }
}

/**
 * Fetch data rows for an indicator.
 * @param {Object} params
 * @param {string} params.indicator - indicator code
 * @returns {Promise<Object>} indicator plus rows array
 */
export async function data({ indicator } = {}) {
  const cacheKey = `who-gho:data:${indicator}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/${encodeURIComponent(indicator)}`, {
      params: { $top: 100 },
    });
    const result = {
      indicator,
      rows: (data.value || []).map((r) => ({
        country: r.SpatialDim,
        year: r.TimeDim,
        value: r.NumericValue,
        dimension: r.Dim1,
      })),
      _cached: false,
    };
    cache.set(cacheKey, result, 3600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'who-gho');
  }
}

/**
 * Fetch data rows for an indicator filtered by country.
 * @param {Object} params
 * @param {string} params.indicator - indicator code
 * @param {string} params.country - country code
 * @returns {Promise<Object>} indicator, country plus rows array
 */
export async function country({ indicator, country } = {}) {
  const cacheKey = `who-gho:country:${indicator}:${country}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/${encodeURIComponent(indicator)}`, {
      params: { $filter: `SpatialDim eq '${country}'` },
    });
    const result = {
      indicator,
      country,
      rows: (data.value || []).map((r) => ({
        year: r.TimeDim,
        value: r.NumericValue,
        dimension: r.Dim1,
      })),
      _cached: false,
    };
    cache.set(cacheKey, result, 3600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'who-gho');
  }
}
