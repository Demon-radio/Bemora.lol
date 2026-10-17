import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();

const BASE = 'https://geocoding.geo.census.gov/geocoder';

/**
 * Geocode a US address via the Census geocoder.
 * @param {Object} params
 * @param {string} params.address - address to geocode
 * @returns {Promise<Object>} address matches
 */
export async function geocode({ address } = {}) {
  const cacheKey = `census-gov:geocode:${address}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/locations/onelineaddress`, {
      params: { address, benchmark: 'Public_AR_Current', format: 'json' },
    });
    const result = {
      address,
      matches: (data.result?.addressMatches || []).map((m) => ({
        matchedAddress: m.matchedAddress,
        lat: m.coordinates?.y,
        lon: m.coordinates?.x,
        city: m.addressComponents?.city,
        state: m.addressComponents?.state,
        zip: m.addressComponents?.zip,
      })),
      _cached: false,
    };
    cache.set(cacheKey, result, 86400);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'census-gov');
  }
}

/**
 * Reverse geocode coordinates via the Census geocoder.
 * @param {Object} params
 * @param {number} params.lat - latitude
 * @param {number} params.lon - longitude
 * @returns {Promise<Object>} census geographies
 */
export async function reverse({ lat, lon } = {}) {
  const cacheKey = `census-gov:reverse:${lat}:${lon}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/geographies/coordinates`, {
      params: { x: lon, y: lat, benchmark: 'Public_AR_Current', vintage: 'Census2020_Current', format: 'json' },
    });
    const result = { lat, lon, geographies: data.result?.geographies, _cached: false };
    cache.set(cacheKey, result, 86400);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'census-gov');
  }
}
