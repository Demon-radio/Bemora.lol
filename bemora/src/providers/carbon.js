import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();

const BASE = 'https://api.carbonintensity.org.uk';

/**
 * Fetch the current UK carbon intensity.
 * @returns {Promise<Object>} current intensity window
 */
export async function current() {
  const cacheKey = 'carbon-intensity:current';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/intensity`);
    const d = (data.data || [])[0] || {};
    const result = {
      from: d.from,
      to: d.to,
      forecast: d.intensity?.forecast,
      actual: d.intensity?.actual,
      index: d.intensity?.index,
      _cached: false,
    };
    cache.set(cacheKey, result, 300);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'carbon-intensity');
  }
}

/**
 * Fetch the forecasted carbon intensity for the day.
 * @returns {Promise<Object>} forecast periods
 */
export async function forecast() {
  const cacheKey = 'carbon-intensity:forecast';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/intensity/date`);
    const result = {
      periods: (data.data || []).map(p => ({
        from: p.from,
        to: p.to,
        forecast: p.intensity?.forecast,
        index: p.intensity?.index,
      })),
      _cached: false,
    };
    cache.set(cacheKey, result, 600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'carbon-intensity');
  }
}

/**
 * Fetch regional carbon intensity breakdown.
 * @returns {Promise<Object>} regions array
 */
export async function regional() {
  const cacheKey = 'carbon-intensity:regional';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/regional`);
    const result = {
      regions: (data.data || [])
        .flatMap(d => d.regions || [])
        .map(r => ({
          id: r.regionid,
          region: r.dnoregion,
          forecast: r.intensity?.forecast,
          index: r.intensity?.index,
        })),
      _cached: false,
    };
    cache.set(cacheKey, result, 600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'carbon-intensity');
  }
}

/**
 * Fetch the current generation mix.
 * @returns {Promise<Object>} generation mix for the current window
 */
export async function generationMix() {
  const cacheKey = 'carbon-intensity:generationMix';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/generation`);
    const d = (data.data || [])[0] || {};
    const result = {
      from: d.from,
      to: d.to,
      mix: d.generationmix,
      _cached: false,
    };
    cache.set(cacheKey, result, 1800);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'carbon-intensity');
  }
}
