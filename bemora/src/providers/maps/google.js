/**
 * Google Maps provider — geocode(), reverseGeocode(), directions(), distanceMatrix(), staticMap().
 */

import { httpClient } from '../../core/http.js';
import { wrapProviderError, ConfigurationError } from '../../core/errors.js';

const BASE = 'https://maps.googleapis.com/maps/api';

function client() { return httpClient({ timeout: 15_000 }); }

/**
 * Geocode an address to coordinates.
 * @param {{ address: string, signal?: AbortSignal }} params
 * @param {string} apiKey
 */
export async function geocode({ address, region, signal } = {}, apiKey) {
  if (!apiKey) throw new ConfigurationError('[maps/google] Missing apiKey', { provider: 'maps-google' });
  try {
    const { data } = await client().get(`${BASE}/geocode/json`, {
      params: { address, region, key: apiKey },
      signal,
    });
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Google Maps geocode error: ${data.status} — ${data.error_message || ''}`);
    }
    return {
      results: (data.results || []).map((r) => ({
        formattedAddress: r.formatted_address,
        lat: r.geometry.location.lat,
        lng: r.geometry.location.lng,
        placeId: r.place_id,
        types: r.types,
      })),
      status: data.status,
    };
  } catch (err) {
    throw wrapProviderError(err, 'maps-google');
  }
}

/**
 * Reverse geocode coordinates to an address.
 */
export async function reverseGeocode({ lat, lng, signal } = {}, apiKey) {
  if (!apiKey) throw new ConfigurationError('[maps/google] Missing apiKey', { provider: 'maps-google' });
  try {
    const { data } = await client().get(`${BASE}/geocode/json`, {
      params: { latlng: `${lat},${lng}`, key: apiKey },
      signal,
    });
    return {
      results: (data.results || []).map((r) => ({
        formattedAddress: r.formatted_address,
        placeId: r.place_id,
        types: r.types,
      })),
      status: data.status,
    };
  } catch (err) {
    throw wrapProviderError(err, 'maps-google');
  }
}

/**
 * Get directions between two points.
 * @param {{ origin: string, destination: string, mode?: 'driving'|'walking'|'bicycling'|'transit', waypoints?: string[], signal?: AbortSignal }} params
 */
export async function directions({ origin, destination, mode = 'driving', waypoints, alternatives = false, signal } = {}, apiKey) {
  if (!apiKey) throw new ConfigurationError('[maps/google] Missing apiKey', { provider: 'maps-google' });
  try {
    const { data } = await client().get(`${BASE}/directions/json`, {
      params: {
        origin, destination, mode, key: apiKey,
        alternatives,
        ...(waypoints?.length && { waypoints: waypoints.join('|') }),
      },
      signal,
    });
    return {
      routes: (data.routes || []).map((r) => ({
        summary: r.summary,
        distance: r.legs?.[0]?.distance,
        duration: r.legs?.[0]?.duration,
        steps: r.legs?.[0]?.steps?.map((s) => ({
          instruction: s.html_instructions?.replace(/<[^>]+>/g, ''),
          distance: s.distance,
          duration: s.duration,
        })),
      })),
      status: data.status,
    };
  } catch (err) {
    throw wrapProviderError(err, 'maps-google');
  }
}

/**
 * Distance matrix between origins and destinations.
 * @param {{ origins: string[], destinations: string[], mode?: string, signal?: AbortSignal }} params
 */
export async function distanceMatrix({ origins, destinations, mode = 'driving', signal } = {}, apiKey) {
  if (!apiKey) throw new ConfigurationError('[maps/google] Missing apiKey', { provider: 'maps-google' });
  try {
    const { data } = await client().get(`${BASE}/distancematrix/json`, {
      params: {
        origins: origins.join('|'),
        destinations: destinations.join('|'),
        mode, key: apiKey,
      },
      signal,
    });
    return data;
  } catch (err) {
    throw wrapProviderError(err, 'maps-google');
  }
}

/**
 * Generate a static map image URL.
 * @param {{ center: string, zoom?: number, size?: string, markers?: string[], signal?: AbortSignal }} params
 */
export function staticMap({ center, zoom = 12, size = '600x400', markers = [], mapType = 'roadmap' } = {}, apiKey) {
  if (!apiKey) throw new ConfigurationError('[maps/google] Missing apiKey', { provider: 'maps-google' });
  const params = new URLSearchParams({
    center, zoom: String(zoom), size, maptype: mapType, key: apiKey,
  });
  markers.forEach((m) => params.append('markers', m));
  return `${BASE}/staticmap?${params.toString()}`;
}

/**
 * Place search (text search).
 */
export async function searchPlaces({ query, location, radius = 50000, type, signal } = {}, apiKey) {
  if (!apiKey) throw new ConfigurationError('[maps/google] Missing apiKey', { provider: 'maps-google' });
  try {
    const { data } = await client().get(`${BASE}/place/textsearch/json`, {
      params: { query, location, radius, type, key: apiKey },
      signal,
    });
    return data;
  } catch (err) {
    throw wrapProviderError(err, 'maps-google');
  }
}
