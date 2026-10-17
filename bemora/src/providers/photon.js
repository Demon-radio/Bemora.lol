import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();

const BASE = 'https://photon.komoot.io';

/**
 * Forward geocode a free-text query via Photon.
 * @param {Object} params
 * @param {string} params.query - location query
 * @param {number} [params.limit=5] - max number of results
 * @returns {Promise<Object>} geocoding results
 */
export async function search({ query, limit = 5 } = {}) {
  const cacheKey = `photon:search:${query}:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/api`, { params: { q: query, limit } });
    const result = {
      query,
      results: (data.features || []).map((f) => ({
        name: f.properties?.name,
        houseNumber: f.properties?.housenumber,
        street: f.properties?.street,
        city: f.properties?.city,
        state: f.properties?.state,
        country: f.properties?.country,
        osmType: f.properties?.osm_type,
        osmId: f.properties?.osm_id,
        lat: f.geometry?.coordinates?.[1],
        lon: f.geometry?.coordinates?.[0],
      })),
      _cached: false,
    };
    cache.set(cacheKey, result, 86400);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'photon');
  }
}

/**
 * Reverse geocode coordinates via Photon.
 * @param {Object} params
 * @param {number} params.lat - latitude
 * @param {number} params.lon - longitude
 * @returns {Promise<Object>} reverse geocoding results
 */
export async function reverse({ lat, lon } = {}) {
  const cacheKey = `photon:reverse:${lat}:${lon}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/reverse`, { params: { lat, lon } });
    const result = {
      lat,
      lon,
      results: (data.features || []).map((f) => ({
        name: f.properties?.name,
        city: f.properties?.city,
        state: f.properties?.state,
        country: f.properties?.country,
      })),
      _cached: false,
    };
    cache.set(cacheKey, result, 86400);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'photon');
  }
}
