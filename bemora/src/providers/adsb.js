import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();
const BASE = 'https://api.adsbdb.com/v0';

/**
 * Look up aircraft details by ICAO 24-bit hex address.
 * @param {Object} params
 * @param {string} params.icao
 * @returns {Promise<Object>}
 */
export async function aircraft({ icao }) {
  const cacheKey = `adsb:aircraft:${icao}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/aircraft/${encodeURIComponent(icao)}`);
    const a = data.response?.aircraft;
    if (!a) {
      const result = { icao, found: false, _cached: false };
      cache.set(cacheKey, result, 3600);
      return result;
    }
    const result = {
      icao,
      registration: a.registration,
      type: a.type,
      icao_type: a.icao_type,
      manufacturer: a.manufacturer,
      mode_s: a.mode_s,
      registered_owner: a.registered_owner,
      photo_url: a.url_photo,
      _cached: false,
    };
    cache.set(cacheKey, result, 3600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'adsb');
  }
}

/**
 * Look up a flight route by callsign.
 * @param {Object} params
 * @param {string} params.callsign
 * @returns {Promise<Object>}
 */
export async function callsign({ callsign }) {
  const cacheKey = `adsb:callsign:${callsign}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/callsign/${encodeURIComponent(callsign)}`);
    const r = data.response?.flightroute;
    if (!r) {
      const result = { callsign, found: false, _cached: false };
      cache.set(cacheKey, result, 3600);
      return result;
    }
    const result = {
      callsign,
      callsign_iata: r.callsign_iata,
      airline_name: r.airline?.name,
      origin: r.origin?.iata_code,
      origin_name: r.origin?.name,
      destination: r.destination?.iata_code,
      destination_name: r.destination?.name,
      country_iso: r.country_iso,
      _cached: false,
    };
    cache.set(cacheKey, result, 3600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'adsb');
  }
}
