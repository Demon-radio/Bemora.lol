import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();

/**
 * Predict the likely gender for a name.
 * @param {Object} params
 * @param {string} params.name
 */
export async function gender({ name }) {
  const cacheKey = `demographics:gender:${name}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get('https://api.genderize.io/', { params: { name } });
    const result = {
      name,
      gender: data.gender,
      probability: data.probability,
      count: data.count,
      _cached: false,
    };
    cache.set(cacheKey, result, 86400);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'demographics');
  }
}

/**
 * Predict the likely age for a name.
 * @param {Object} params
 * @param {string} params.name
 */
export async function age({ name }) {
  const cacheKey = `demographics:age:${name}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get('https://api.agify.io/', { params: { name } });
    const result = {
      name,
      age: data.age,
      count: data.count,
      _cached: false,
    };
    cache.set(cacheKey, result, 86400);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'demographics');
  }
}

/**
 * Predict the likely nationality for a name.
 * @param {Object} params
 * @param {string} params.name
 */
export async function nationality({ name }) {
  const cacheKey = `demographics:nationality:${name}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get('https://api.nationalize.io/', { params: { name } });
    const result = {
      name,
      count: data.count,
      countries: (data.country || []).map((c) => ({
        country_id: c.country_id,
        probability: c.probability,
      })),
      _cached: false,
    };
    cache.set(cacheKey, result, 86400);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'demographics');
  }
}
