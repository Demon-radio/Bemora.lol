import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();
const BASE = 'https://earthquake.usgs.gov/fdsnws/event/1/query';

export async function getRecent({ minMagnitude = 2.5, limit = 20 } = {}) {
  const cacheKey = `quake:recent:${minMagnitude}:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(BASE, {
      params: { format: 'geojson', minmagnitude: minMagnitude, orderby: 'time', limit },
    });
    const result = {
      count: data.features.length,
      earthquakes: data.features.map((f) => ({
        place: f.properties.place,
        magnitude: f.properties.mag,
        time: new Date(f.properties.time).toISOString(),
        url: f.properties.url,
        coordinates: f.geometry?.coordinates,
      })),
      _cached: false,
    };
    cache.set(cacheKey, result, 300);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'earthquake');
  }
}

export async function getByLocation({ lat, lon, radiusKm = 500, minMagnitude = 2.5 }) {
  try {
    const { data } = await http.get(BASE, {
      params: { format: 'geojson', latitude: lat, longitude: lon, maxradiuskm: radiusKm, minmagnitude: minMagnitude, orderby: 'time', limit: 20 },
    });
    return {
      count: data.features.length,
      earthquakes: data.features.map((f) => ({ place: f.properties.place, magnitude: f.properties.mag, time: new Date(f.properties.time).toISOString() })),
    };
  } catch (err) {
    throw wrapProviderError(err, 'earthquake');
  }
}

export async function getBiggestToday() {
  try {
    const { data } = await http.get('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_day.geojson');
    const top = data.features?.[0];
    if (!top) return { found: false };
    return { found: true, place: top.properties.place, magnitude: top.properties.mag, time: new Date(top.properties.time).toISOString(), url: top.properties.url };
  } catch (err) {
    throw wrapProviderError(err, 'earthquake');
  }
}
