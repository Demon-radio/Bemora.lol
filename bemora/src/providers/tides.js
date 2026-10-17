import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();

const BASE = 'https://api.tidesandcurrents.noaa.gov/api/prod';

/**
 * Fetch the latest observed water level for a station.
 * @param {Object} params
 * @param {string} [params.station='8443970'] - NOAA station id
 * @param {string} [params.units='metric'] - unit system
 * @returns {Promise<Object>} station metadata plus readings
 */
export async function waterLevel({ station = '8443970', units = 'metric' } = {}) {
  const cacheKey = `noaa-tides:waterLevel:${station}:${units}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/datagetter`, {
      params: {
        date: 'latest',
        station,
        product: 'water_level',
        datum: 'MLLW',
        units,
        time_zone: 'gmt',
        application: 'bemora',
        format: 'json',
      },
    });
    const result = {
      station: data.metadata?.name,
      id: data.metadata?.id,
      readings: (data.data || []).map(r => ({ time: r.t, level: +r.v })),
      _cached: false,
    };
    cache.set(cacheKey, result, 300);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'noaa-tides');
  }
}

/**
 * Fetch tide predictions for a station.
 * @param {Object} params
 * @param {string} [params.station='8443970'] - NOAA station id
 * @param {string} [params.units='metric'] - unit system
 * @param {string} [params.date='today'] - prediction date
 * @returns {Promise<Object>} station metadata plus predictions
 */
export async function predictions({ station = '8443970', units = 'metric', date = 'today' } = {}) {
  const cacheKey = `noaa-tides:predictions:${station}:${units}:${date}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/datagetter`, {
      params: {
        date,
        station,
        product: 'predictions',
        datum: 'MLLW',
        units,
        time_zone: 'gmt',
        application: 'bemora',
        format: 'json',
      },
    });
    const result = {
      station: data.metadata?.name,
      id: data.metadata?.id,
      predictions: (data.predictions || []).map(r => ({ time: r.t, level: +r.v })),
      _cached: false,
    };
    cache.set(cacheKey, result, 600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'noaa-tides');
  }
}

/**
 * List NOAA water-level stations.
 * @returns {Promise<Object>} stations array
 */
export async function stations() {
  const cacheKey = 'noaa-tides:stations';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/mdapi/prod/webapi/stations.json`, {
      params: { type: 'waterlevels' },
    });
    const result = {
      stations: (data.stations || []).map(s => ({
        id: s.id,
        name: s.name,
        state: s.state,
        lat: s.lat,
        lon: s.lng,
      })),
      _cached: false,
    };
    cache.set(cacheKey, result, 86400);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'noaa-tides');
  }
}
