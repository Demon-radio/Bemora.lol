import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();

const BASE = 'http://api.citybik.es/v2';

/**
 * List bike-share networks.
 * @param {Object} params
 * @param {number} [params.limit=20] - max number of networks to return
 * @returns {Promise<Object>} networks array
 */
export async function networks({ limit = 20 } = {}) {
  const cacheKey = `citybikes:networks:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/networks`);
    const result = {
      networks: (data.networks || []).slice(0, limit).map(n => ({
        id: n.id,
        name: n.name,
        city: n.location?.city,
        country: n.location?.country,
        lat: n.location?.latitude,
        lon: n.location?.longitude,
      })),
      _cached: false,
    };
    cache.set(cacheKey, result, 3600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'citybikes');
  }
}

/**
 * Fetch a bike-share network with its stations.
 * @param {Object} params
 * @param {string} params.id - network id
 * @returns {Promise<Object>} network details plus stations
 */
export async function network({ id } = {}) {
  const cacheKey = `citybikes:network:${id}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/networks/${encodeURIComponent(id)}`);
    const n = data.network || {};
    const result = {
      id: n.id,
      name: n.name,
      city: n.location?.city,
      country: n.location?.country,
      stations: (n.stations || []).map(s => ({
        id: s.id,
        name: s.name,
        freeBikes: s.free_bikes,
        emptySlots: s.empty_slots,
        lat: s.latitude,
        lon: s.longitude,
      })),
      _cached: false,
    };
    cache.set(cacheKey, result, 600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'citybikes');
  }
}
