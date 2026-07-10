import * as cache from '../core/cache.js';
import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';

const http = httpClient();

/**
 * Get NASA Astronomy Picture of the Day
 */
export async function getAPOD({ date, apiKey = 'DEMO_KEY' }) {
  const cacheKey = `space:nasa:apod:${date || 'today'}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  try {
    const { data } = await http.get('https://api.nasa.gov/planetary/apod', {
      params: { api_key: apiKey, date }
    });
    const result = { apod: data, _cached: false };
    cache.set(cacheKey, result, 86400);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'space-extended');
  }
}

/**
 * Get NASA Mars Rover Photos
 */
export async function getMarsPhotos({ rover = 'curiosity', sol = 1000, apiKey = 'DEMO_KEY' }) {
  const cacheKey = `space:nasa:mars:${rover}:${sol}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  try {
    const { data } = await http.get('https://api.nasa.gov/mars-photos/api/v1/rovers/' + rover + '/photos', {
      params: { sol, api_key: apiKey }
    });
    const result = { photos: data.photos, _cached: false };
    cache.set(cacheKey, result, 86400);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'space-extended');
  }
}

/**
 * Get Near Earth Objects
 */
export async function getNearEarthObjects({ startDate, endDate, apiKey = 'DEMO_KEY' }) {
  const cacheKey = `space:nasa:neo:${startDate}:${endDate}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  try {
    const { data } = await http.get('https://api.nasa.gov/neo/rest/v1/feed', {
      params: { start_date: startDate, end_date: endDate, api_key: apiKey }
    });
    const result = { nearEarthObjects: data.near_earth_objects, _cached: false };
    cache.set(cacheKey, result, 86400);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'space-extended');
  }
}

/**
 * Get ISS current position
 */
export async function getISSPosition() {
  const cacheKey = 'space:iss:position';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  try {
    const { data } = await http.get('http://api.open-notify.org/iss-now.json');
    const result = { position: data.iss_position, timestamp: data.timestamp, _cached: false };
    cache.set(cacheKey, result, 10);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'space-extended');
  }
}
