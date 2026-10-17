import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();
const POINTS_URL = 'https://api.weather.gov/points';
const ALERTS_URL = 'https://api.weather.gov/alerts/active';

/**
 * Get the National Weather Service forecast for a coordinate.
 * @param {Object} params
 * @param {number} params.lat
 * @param {number} params.lon
 * @returns {Promise<Object>}
 */
export async function forecast({ lat, lon }) {
  const cacheKey = `nws:forecast:${lat}:${lon}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${POINTS_URL}/${lat},${lon}`);
    const forecastUrl = data.properties?.forecast;
    const { data: full } = await http.get(forecastUrl);
    const periods = (full.properties?.periods || []).map((p) => ({
      name: p.name,
      temperature: p.temperature,
      temperature_unit: p.temperatureUnit,
      wind_speed: p.windSpeed,
      wind_direction: p.windDirection,
      short_forecast: p.shortForecast,
      detailed_forecast: p.detailedForecast,
      is_daytime: p.isDaytime,
    }));
    const result = { lat, lon, periods, _cached: false };
    cache.set(cacheKey, result, 600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'nws');
  }
}

/**
 * Get active National Weather Service alerts for an area.
 * @param {Object} params
 * @param {string} params.area - state/area code (e.g. CA)
 * @returns {Promise<Object>}
 */
export async function alerts({ area }) {
  const cacheKey = `nws:alerts:${area}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(ALERTS_URL, { params: { area } });
    const list = (data.features || []).map((f) => ({
      id: f.properties?.id,
      area: f.properties?.areaDesc,
      severity: f.properties?.severity,
      certainty: f.properties?.certainty,
      headline: f.properties?.headline,
      description: f.properties?.description,
      expires: f.properties?.expires,
    }));
    const result = { area, count: list.length, alerts: list, _cached: false };
    cache.set(cacheKey, result, 300);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'nws');
  }
}
