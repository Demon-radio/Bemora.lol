/**
 * Mapbox provider — geocode(), reverseGeocode(), directions(), staticMap().
 */

import { httpClient } from '../../core/http.js';
import { wrapProviderError, ConfigurationError } from '../../core/errors.js';

const BASE = 'https://api.mapbox.com';

function client() { return httpClient({ timeout: 15_000 }); }

/**
 * Forward geocode an address.
 */
export async function geocode({ address, country, proximity, limit = 5, signal } = {}, apiKey) {
  if (!apiKey) throw new ConfigurationError('[maps/mapbox] Missing apiKey', { provider: 'maps-mapbox' });
  try {
    const query = encodeURIComponent(address);
    const { data } = await client().get(`${BASE}/geocoding/v5/mapbox.places/${query}.json`, {
      params: { access_token: apiKey, country, proximity, limit },
      signal,
    });
    return {
      features: (data.features || []).map((f) => ({
        placeName: f.place_name,
        lng: f.center?.[0],
        lat: f.center?.[1],
        placeType: f.place_type,
        relevance: f.relevance,
        id: f.id,
      })),
    };
  } catch (err) {
    throw wrapProviderError(err, 'maps-mapbox');
  }
}

/**
 * Reverse geocode coordinates.
 */
export async function reverseGeocode({ lng, lat, types, signal } = {}, apiKey) {
  if (!apiKey) throw new ConfigurationError('[maps/mapbox] Missing apiKey', { provider: 'maps-mapbox' });
  try {
    const { data } = await client().get(`${BASE}/geocoding/v5/mapbox.places/${lng},${lat}.json`, {
      params: { access_token: apiKey, types },
      signal,
    });
    return {
      features: (data.features || []).map((f) => ({
        placeName: f.place_name,
        placeType: f.place_type,
        id: f.id,
      })),
    };
  } catch (err) {
    throw wrapProviderError(err, 'maps-mapbox');
  }
}

/**
 * Get turn-by-turn directions.
 * @param {{ coordinates: Array<[lng, lat]>, profile?: 'driving'|'walking'|'cycling', signal?: AbortSignal }} params
 */
export async function directions({ coordinates, profile = 'driving', steps = true, alternatives = false, signal } = {}, apiKey) {
  if (!apiKey) throw new ConfigurationError('[maps/mapbox] Missing apiKey', { provider: 'maps-mapbox' });
  try {
    const coords = coordinates.map((c) => c.join(',')).join(';');
    const { data } = await client().get(`${BASE}/directions/v5/mapbox/${profile}/${coords}`, {
      params: { access_token: apiKey, steps, alternatives, geometries: 'geojson' },
      signal,
    });
    return {
      routes: (data.routes || []).map((r) => ({
        distance: r.distance,
        duration: r.duration,
        geometry: r.geometry,
        legs: r.legs?.map((l) => ({
          distance: l.distance,
          duration: l.duration,
          steps: l.steps?.map((s) => ({ instruction: s.maneuver?.instruction, distance: s.distance, duration: s.duration })),
        })),
      })),
    };
  } catch (err) {
    throw wrapProviderError(err, 'maps-mapbox');
  }
}

/**
 * Generate a static map image URL.
 */
export function staticMap({ lng, lat, zoom = 12, width = 600, height = 400, style = 'streets-v12' } = {}, apiKey) {
  if (!apiKey) throw new ConfigurationError('[maps/mapbox] Missing apiKey', { provider: 'maps-mapbox' });
  return `${BASE}/styles/v1/mapbox/${style}/static/${lng},${lat},${zoom}/${width}x${height}?access_token=${apiKey}`;
}

/**
 * Isochrone (reachability) analysis.
 */
export async function isochrone({ lng, lat, profile = 'driving', contours_minutes = [5, 15, 30], signal } = {}, apiKey) {
  if (!apiKey) throw new ConfigurationError('[maps/mapbox] Missing apiKey', { provider: 'maps-mapbox' });
  try {
    const { data } = await client().get(`${BASE}/isochrone/v1/mapbox/${profile}/${lng},${lat}`, {
      params: { access_token: apiKey, contours_minutes: contours_minutes.join(','), polygons: true },
      signal,
    });
    return data;
  } catch (err) {
    throw wrapProviderError(err, 'maps-mapbox');
  }
}
