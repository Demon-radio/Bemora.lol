import axios from 'axios';
import * as cache from '../core/cache.js';

/**
 * NASA Astronomy Picture of the Day (Free — free key at api.nasa.gov)
 * @param {{ date?: string }} params — YYYY-MM-DD, default today
 * @param {string} apiKey
 */
export async function getAPOD({ date } = {}, apiKey) {
  const cacheKey = `space:apod:${date || 'today'}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data } = await axios.get('https://api.nasa.gov/planetary/apod', {
    params: { api_key: apiKey, date },
  });

  const result = {
    title: data.title,
    date: data.date,
    explanation: data.explanation,
    url: data.url,
    hdurl: data.hdurl,
    media_type: data.media_type,
    copyright: data.copyright,
    _cached: false,
  };

  cache.set(cacheKey, result, 3600);
  return result;
}

/**
 * NASA Mars Rover Photos
 * @param {{ rover?: string, sol?: number, camera?: string }} params
 * @param {string} apiKey
 */
export async function getMarsPhotos({ rover = 'curiosity', sol = 1000, camera } = {}, apiKey) {
  const cacheKey = `space:mars:${rover}:${sol}:${camera}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const params = { api_key: apiKey, sol };
  if (camera) params.camera = camera;

  const { data } = await axios.get(
    `https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/photos`,
    { params }
  );

  const result = {
    rover,
    sol,
    photos: data.photos.slice(0, 20).map((p) => ({
      id: p.id,
      img_src: p.img_src,
      earth_date: p.earth_date,
      camera: p.camera.full_name,
      rover: p.rover.name,
    })),
    _cached: false,
  };

  cache.set(cacheKey, result, 86400);
  return result;
}

/**
 * Near-Earth Objects (asteroids) approaching Earth (Free key)
 * @param {{ start_date?: string, end_date?: string }} params
 * @param {string} apiKey
 */
export async function getNearEarthObjects({ start_date, end_date } = {}, apiKey) {
  const today = new Date().toISOString().split('T')[0];
  const start = start_date || today;
  const end = end_date || today;

  const cacheKey = `space:neo:${start}:${end}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data } = await axios.get('https://api.nasa.gov/neo/rest/v1/feed', {
    params: { start_date: start, end_date: end, api_key: apiKey },
  });

  const allObjects = Object.values(data.near_earth_objects).flat();
  const result = {
    count: data.element_count,
    objects: allObjects.slice(0, 10).map((o) => ({
      name: o.name,
      id: o.id,
      hazardous: o.is_potentially_hazardous_asteroid,
      diameter_km: {
        min: parseFloat(o.estimated_diameter.kilometers.estimated_diameter_min.toFixed(3)),
        max: parseFloat(o.estimated_diameter.kilometers.estimated_diameter_max.toFixed(3)),
      },
      close_approach: o.close_approach_data[0]?.close_approach_date,
      miss_distance_km: parseFloat(o.close_approach_data[0]?.miss_distance.kilometers).toFixed(0),
      velocity_kmh: parseFloat(o.close_approach_data[0]?.relative_velocity.kilometers_per_hour).toFixed(0),
    })),
    _cached: false,
  };

  cache.set(cacheKey, result, 3600);
  return result;
}

/**
 * ISS current position (Free, no key)
 */
export async function getISSPosition() {
  const { data } = await axios.get('http://api.open-notify.org/iss-now.json');
  return {
    lat: parseFloat(data.iss_position.latitude),
    lon: parseFloat(data.iss_position.longitude),
    timestamp: data.timestamp,
    _cached: false,
  };
}
