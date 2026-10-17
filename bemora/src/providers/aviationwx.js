import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();

const BASE = 'https://aviationweather.gov/api/data';

/**
 * Fetch the latest METAR observation for a station.
 * @param {Object} params
 * @param {string} [params.station='KJFK'] - ICAO station identifier
 * @returns {Promise<Object>} normalized METAR observation
 */
export async function metar({ station = 'KJFK' } = {}) {
  const cacheKey = `aviationweather:metar:${station}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/metar`, { params: { ids: station, format: 'json' } });
    const m = (Array.isArray(data) ? data[0] : data) || {};
    const result = {
      station: m.icaoId,
      raw: m.rawOb,
      time: m.reportTime,
      temp: m.temp,
      dewpoint: m.dewp,
      windDir: m.windDir,
      windSpeed: m.windSpd,
      visibility: m.visib,
      altimeter: m.altim,
      clouds: m.clouds,
      _cached: false,
    };
    cache.set(cacheKey, result, 300);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'aviationweather');
  }
}

/**
 * Fetch the latest TAF forecast for a station.
 * @param {Object} params
 * @param {string} [params.station='KJFK'] - ICAO station identifier
 * @returns {Promise<Object>} normalized TAF forecast
 */
export async function taf({ station = 'KJFK' } = {}) {
  const cacheKey = `aviationweather:taf:${station}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/taf`, { params: { ids: station, format: 'json' } });
    const t = (Array.isArray(data) ? data[0] : data) || {};
    const result = {
      station: t.icaoId,
      raw: t.rawTAF,
      issueTime: t.issueTime,
      validFrom: t.validTimeFrom,
      validTo: t.validTimeTo,
      _cached: false,
    };
    cache.set(cacheKey, result, 600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'aviationweather');
  }
}
