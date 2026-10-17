import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();
const BASE = 'https://api.met.no/weatherapi/locationforecast/2.0/compact';

/**
 * Get the MET Norway compact location forecast for a coordinate.
 * @param {Object} params
 * @param {number} params.lat
 * @param {number} params.lon
 * @returns {Promise<Object>}
 */
export async function forecast({ lat, lon }) {
  const cacheKey = `metno:forecast:${lat}:${lon}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(BASE, { params: { lat, lon } });
    const props = data.properties || {};
    const timeseries = (props.timeseries || []).slice(0, 24).map((entry) => {
      const inst = entry.data?.instant?.details || {};
      return {
        time: entry.time,
        temperature: inst.air_temperature,
        humidity: inst.relative_humidity,
        wind_speed: inst.wind_speed,
        symbol: entry.data?.next_1_hours?.summary?.symbol_code,
      };
    });
    const result = {
      lat,
      lon,
      updated_at: props.meta?.updated_at,
      timeseries,
      _cached: false,
    };
    cache.set(cacheKey, result, 900);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'metno');
  }
}
