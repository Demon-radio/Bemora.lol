import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();

const BASE = 'https://services.swpc.noaa.gov';

/**
 * Fetch recent planetary K-index readings.
 * @returns {Promise<Object>} recent Kp entries
 */
export async function kp() {
  const cacheKey = 'noaa-swpc:kp';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/products/noaa-planetary-k-index.json`);
    const result = {
      entries: (Array.isArray(data) ? data : []).slice(-24).map(r => ({
        time: r.time_tag,
        kp: +r.Kp,
        aRunning: +r.a_running,
        stations: +r.station_count,
      })),
      _cached: false,
    };
    cache.set(cacheKey, result, 900);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'noaa-swpc');
  }
}

/**
 * Fetch the seven-day solar wind plasma readings.
 * @returns {Promise<Object>} header row plus latest reading
 */
export async function solarWind() {
  const cacheKey = 'noaa-swpc:solarWind';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/products/solar-wind/plasma-7-day.json`);
    const result = {
      header: data[0],
      latest: (data.slice(1).filter(r => r && r.length).slice(-1)[0]) || null,
      _cached: false,
    };
    cache.set(cacheKey, result, 900);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'noaa-swpc');
  }
}

/**
 * Fetch the latest aurora oval forecast.
 * @returns {Promise<Object>} aurora forecast metadata
 */
export async function aurora() {
  const cacheKey = 'noaa-swpc:aurora';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/json/ovation_aurora_latest.json`);
    const result = {
      observationTime: data['Observation Time'],
      forecastTime: data['Forecast Time'],
      dataPoints: (data.coordinates || []).length,
      _cached: false,
    };
    cache.set(cacheKey, result, 1800);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'noaa-swpc');
  }
}

/**
 * Fetch active space weather alerts.
 * @returns {Promise<Object>} alerts array
 */
export async function alerts() {
  const cacheKey = 'noaa-swpc:alerts';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/products/alerts.json`);
    const result = {
      alerts: (Array.isArray(data) ? data : []).map(a => ({
        id: a.product_id,
        time: a.issue_datetime,
        message: a.message,
      })),
      _cached: false,
    };
    cache.set(cacheKey, result, 900);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'noaa-swpc');
  }
}
