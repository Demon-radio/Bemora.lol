import axios from 'axios';
import * as cache from '../core/cache.js';

const GEO = 'https://nominatim.openstreetmap.org';
const HEADERS = { 'User-Agent': 'bemora/1.0' };

/**
 * Geocode an address → coordinates (Free, no key needed)
 * @param {{ address: string, limit?: number }} params
 */
export async function geocode({ address, limit = 1 }) {
  const cacheKey = `location:geocode:${address}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data } = await axios.get(`${GEO}/search`, {
    params: { q: address, format: 'json', limit, addressdetails: 1 },
    headers: HEADERS,
  });

  const result = {
    results: data.map((r) => ({
      display_name: r.display_name,
      lat: parseFloat(r.lat),
      lon: parseFloat(r.lon),
      type: r.type,
      address: r.address,
    })),
    _cached: false,
  };

  cache.set(cacheKey, result, 86400);
  return result;
}

/**
 * Reverse geocode: coordinates → address (Free, no key)
 * @param {{ lat: number, lon: number }} params
 */
export async function reverseGeocode({ lat, lon }) {
  const cacheKey = `location:reverse:${lat}:${lon}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data } = await axios.get(`${GEO}/reverse`, {
    params: { lat, lon, format: 'json', addressdetails: 1 },
    headers: HEADERS,
  });

  const result = {
    display_name: data.display_name,
    lat: parseFloat(data.lat),
    lon: parseFloat(data.lon),
    address: data.address,
    _cached: false,
  };

  cache.set(cacheKey, result, 86400);
  return result;
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 * No API needed — pure math.
 * @param {{ from: { lat, lon }, to: { lat, lon }, unit?: 'km'|'mi' }} params
 */
export function distance({ from, to, unit = 'km' }) {
  const R = unit === 'km' ? 6371 : 3958.8;
  const dLat = ((to.lat - from.lat) * Math.PI) / 180;
  const dLon = ((to.lon - from.lon) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((from.lat * Math.PI) / 180) *
      Math.cos((to.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return { distance: parseFloat((R * c).toFixed(2)), unit };
}
