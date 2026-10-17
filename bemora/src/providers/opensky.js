import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();
const BASE = 'https://opensky-network.org/api/states/all';

/**
 * Get live aircraft state vectors from the OpenSky Network.
 * @param {Object} [params]
 * @param {Object} [params.bbox] - optional bounding box { lamin, lomin, lamax, lomax }
 * @returns {Promise<Object>}
 */
export async function states({ bbox } = {}) {
  const bboxKey = bbox ? `${bbox.lamin}:${bbox.lomin}:${bbox.lamax}:${bbox.lomax}` : 'all';
  const cacheKey = `opensky:states:${bboxKey}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const params = {};
    if (bbox) {
      if (bbox.lamin !== undefined) params.lamin = bbox.lamin;
      if (bbox.lomin !== undefined) params.lomin = bbox.lomin;
      if (bbox.lamax !== undefined) params.lamax = bbox.lamax;
      if (bbox.lomax !== undefined) params.lomax = bbox.lomax;
    }
    const { data } = await http.get(BASE, { params });
    const list = (data.states || []).map((s) => ({
      icao24: s[0],
      callsign: (s[1] || '').trim(),
      origin_country: s[2],
      longitude: s[5],
      latitude: s[6],
      baro_altitude: s[7],
      on_ground: s[8],
      velocity: s[9],
      true_track: s[10],
    }));
    const result = { time: data.time, count: list.length, states: list, _cached: false };
    cache.set(cacheKey, result, 60);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'opensky');
  }
}
