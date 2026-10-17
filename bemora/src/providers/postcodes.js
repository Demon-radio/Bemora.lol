import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();

const BASE = 'https://api.postcodes.io';

/**
 * Look up a UK postcode.
 * @param {Object} params
 * @param {string} params.postcode - postcode to look up
 * @returns {Promise<Object>} postcode details
 */
export async function lookup({ postcode } = {}) {
  const cacheKey = `postcodes-io:lookup:${postcode}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/postcodes/${encodeURIComponent(postcode)}`);
    const r = data.result || {};
    const result = {
      postcode: r.postcode,
      quality: r.quality,
      country: r.country,
      region: r.region,
      district: r.admin_district,
      lat: r.latitude,
      lon: r.longitude,
      _cached: false,
    };
    cache.set(cacheKey, result, 86400);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'postcodes-io');
  }
}

/**
 * Reverse geocode coordinates to a UK postcode.
 * @param {Object} params
 * @param {number} params.lat - latitude
 * @param {number} params.lon - longitude
 * @returns {Promise<Object>} nearest postcode details
 */
export async function reverse({ lat, lon } = {}) {
  const cacheKey = `postcodes-io:reverse:${lat}:${lon}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/postcodes`, { params: { lat, lon } });
    const r = (data.result || [])[0] || {};
    const result = {
      postcode: r.postcode,
      country: r.country,
      region: r.region,
      district: r.admin_district,
      lat: r.latitude,
      lon: r.longitude,
      _cached: false,
    };
    cache.set(cacheKey, result, 86400);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'postcodes-io');
  }
}

/**
 * Validate a UK postcode.
 * @param {Object} params
 * @param {string} params.postcode - postcode to validate
 * @returns {Promise<Object>} validation result
 */
export async function validate({ postcode } = {}) {
  const cacheKey = `postcodes-io:validate:${postcode}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/postcodes/${encodeURIComponent(postcode)}/validate`);
    const result = { postcode, valid: data.result, _cached: false };
    cache.set(cacheKey, result, 86400);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'postcodes-io');
  }
}

/**
 * Fetch a random UK postcode.
 * @returns {Promise<Object>} random postcode details
 */
export async function random() {
  try {
    const { data } = await http.get(`${BASE}/random/postcodes`);
    const r = data.result || {};
    return {
      postcode: r.postcode,
      country: r.country,
      region: r.region,
      lat: r.latitude,
      lon: r.longitude,
      _cached: false,
    };
  } catch (err) {
    throw wrapProviderError(err, 'postcodes-io');
  }
}
