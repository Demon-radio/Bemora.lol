import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();

const ELEVATION_URL = 'https://api.open-meteo.com/v1/elevation';
const MARINE_URL = 'https://marine-api.open-meteo.com/v1/marine';
const FLOOD_URL = 'https://flood-api.open-meteo.com/v1/flood';
const CLIMATE_URL = 'https://climate-api.open-meteo.com/v1/climate';
const ARCHIVE_URL = 'https://archive-api.open-meteo.com/v1/archive';

/**
 * Get terrain elevation for a coordinate.
 * @param {Object} params
 * @param {number} params.lat
 * @param {number} params.lon
 * @returns {Promise<Object>}
 */
export async function elevation({ lat, lon }) {
  const cacheKey = `earth:elevation:${lat}:${lon}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(ELEVATION_URL, {
      params: { latitude: lat, longitude: lon },
    });
    const result = { lat, lon, elevation_m: data.elevation[0], _cached: false };
    cache.set(cacheKey, result, 86400);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'earth');
  }
}

/**
 * Get current marine conditions for a coordinate.
 * @param {Object} params
 * @param {number} params.lat
 * @param {number} params.lon
 * @returns {Promise<Object>}
 */
export async function marine({ lat, lon }) {
  const cacheKey = `earth:marine:${lat}:${lon}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(MARINE_URL, {
      params: {
        latitude: lat,
        longitude: lon,
        current: 'wave_height,wave_direction,wave_period,sea_surface_temperature',
      },
    });
    const c = data.current || {};
    const result = {
      lat,
      lon,
      time: c.time,
      wave_height: c.wave_height,
      wave_direction: c.wave_direction,
      wave_period: c.wave_period,
      sea_surface_temperature: c.sea_surface_temperature,
      _cached: false,
    };
    cache.set(cacheKey, result, 1800);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'earth');
  }
}

/**
 * Get river discharge forecast for a coordinate.
 * @param {Object} params
 * @param {number} params.lat
 * @param {number} params.lon
 * @param {number} [params.days]
 * @returns {Promise<Object>}
 */
export async function flood({ lat, lon, days = 7 }) {
  const cacheKey = `earth:flood:${lat}:${lon}:${days}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(FLOOD_URL, {
      params: {
        latitude: lat,
        longitude: lon,
        daily: 'river_discharge',
        forecast_days: days,
      },
    });
    const d = data.daily || {};
    const result = {
      lat,
      lon,
      days,
      time: d.time,
      river_discharge: d.river_discharge,
      _cached: false,
    };
    cache.set(cacheKey, result, 3600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'earth');
  }
}

/**
 * Get climate model projections for a coordinate and date range.
 * @param {Object} params
 * @param {number} params.lat
 * @param {number} params.lon
 * @param {string} params.startDate
 * @param {string} params.endDate
 * @returns {Promise<Object>}
 */
export async function climate({ lat, lon, startDate, endDate }) {
  const cacheKey = `earth:climate:${lat}:${lon}:${startDate}:${endDate}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(CLIMATE_URL, {
      params: {
        latitude: lat,
        longitude: lon,
        start_date: startDate,
        end_date: endDate,
        daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum',
      },
    });
    const d = data.daily || {};
    const result = {
      lat,
      lon,
      start_date: startDate,
      end_date: endDate,
      time: d.time,
      temperature_2m_max: d.temperature_2m_max,
      temperature_2m_min: d.temperature_2m_min,
      precipitation_sum: d.precipitation_sum,
      _cached: false,
    };
    cache.set(cacheKey, result, 86400);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'earth');
  }
}

/**
 * Get historical weather observations for a coordinate and date range.
 * @param {Object} params
 * @param {number} params.lat
 * @param {number} params.lon
 * @param {string} params.startDate
 * @param {string} params.endDate
 * @returns {Promise<Object>}
 */
export async function historical({ lat, lon, startDate, endDate }) {
  const cacheKey = `earth:historical:${lat}:${lon}:${startDate}:${endDate}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(ARCHIVE_URL, {
      params: {
        latitude: lat,
        longitude: lon,
        start_date: startDate,
        end_date: endDate,
        daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum',
      },
    });
    const d = data.daily || {};
    const result = {
      lat,
      lon,
      start_date: startDate,
      end_date: endDate,
      time: d.time,
      temperature_2m_max: d.temperature_2m_max,
      temperature_2m_min: d.temperature_2m_min,
      precipitation_sum: d.precipitation_sum,
      _cached: false,
    };
    cache.set(cacheKey, result, 86400);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'earth');
  }
}
