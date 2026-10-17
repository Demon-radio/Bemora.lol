import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();

const BASE = 'https://v6.vbb.transport.rest';

/**
 * Search for transit locations by name.
 * @param {Object} params
 * @param {string} params.query - search text
 * @param {number} [params.results=5] - max number of locations to return
 * @returns {Promise<Object>} query plus locations array
 */
export async function locations({ query, results = 5 } = {}) {
  const cacheKey = `vbb:locations:${query}:${results}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/locations`, { params: { query, results } });
    const result = {
      query,
      locations: (Array.isArray(data) ? data : []).map(l => ({
        id: l.id,
        name: l.name,
        type: l.type,
        lat: l.location?.latitude,
        lon: l.location?.longitude,
      })),
      _cached: false,
    };
    cache.set(cacheKey, result, 600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'vbb');
  }
}

/**
 * Fetch upcoming departures for a stop.
 * @param {Object} params
 * @param {string} params.stop - stop id
 * @param {number} [params.duration=10] - look-ahead window in minutes
 * @returns {Promise<Object>} stop plus departures array
 */
export async function departures({ stop, duration = 10 } = {}) {
  const cacheKey = `vbb:departures:${stop}:${duration}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/stops/${encodeURIComponent(stop)}/departures`, {
      params: { duration },
    });
    const result = {
      stop,
      departures: (Array.isArray(data) ? data : []).map(d => ({
        line: d.line?.name,
        direction: d.direction,
        when: d.when,
        plannedWhen: d.plannedWhen,
        delay: d.delay,
        platform: d.platform,
      })),
      _cached: false,
    };
    cache.set(cacheKey, result, 60);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'vbb');
  }
}

/**
 * Fetch journeys between two locations.
 * @param {Object} params
 * @param {string} params.from - origin location id
 * @param {string} params.to - destination location id
 * @returns {Promise<Object>} from, to plus journeys array
 */
export async function journeys({ from, to } = {}) {
  const cacheKey = `vbb:journeys:${from}:${to}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/journeys`, { params: { from, to } });
    const result = {
      from,
      to,
      journeys: (data.journeys || []).map(j => ({
        departure: j.legs?.[0]?.departure,
        arrival: j.legs?.[j.legs.length - 1]?.arrival,
        transfers: (j.legs || []).length - 1,
      })),
      _cached: false,
    };
    cache.set(cacheKey, result, 120);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'vbb');
  }
}
