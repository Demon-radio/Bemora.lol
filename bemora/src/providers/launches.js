import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();
const BASE = 'https://ll.thespacedevs.com/2.2.0';

function mapLaunch(l) {
  return {
    id: l.id,
    name: l.name,
    status: l.status?.abbrev,
    status_name: l.status?.name,
    net: l.net,
    window_start: l.window_start,
    window_end: l.window_end,
    provider: l.launch_service_provider?.name,
    rocket: l.rocket?.configuration?.name,
    pad: l.pad?.name,
    location: l.pad?.location?.name,
    mission: l.mission?.name,
    mission_type: l.mission?.type,
    image: l.image,
    webcast: l.vidURLs?.[0]?.url,
  };
}

/**
 * Upcoming rocket launches (TheSpaceDevs Launch Library 2).
 * @param {Object} params
 * @param {number} [params.limit]
 */
export async function upcoming({ limit = 5 }) {
  const cacheKey = `launches:upcoming:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/launch/upcoming/`, { params: { limit, mode: 'list' } });
    const results = data.results || [];
    const result = { count: results.length, launches: results.map(mapLaunch), _cached: false };
    cache.set(cacheKey, result, 3600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'launches');
  }
}

/**
 * Previous rocket launches (TheSpaceDevs Launch Library 2).
 * @param {Object} params
 * @param {number} [params.limit]
 */
export async function previous({ limit = 5 }) {
  const cacheKey = `launches:previous:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/launch/previous/`, { params: { limit, mode: 'list' } });
    const results = data.results || [];
    const result = { count: results.length, launches: results.map(mapLaunch), _cached: false };
    cache.set(cacheKey, result, 3600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'launches');
  }
}

/**
 * Detailed launch by id (TheSpaceDevs Launch Library 2).
 * @param {Object} params
 * @param {string} params.id
 */
export async function byId({ id }) {
  const cacheKey = `launches:byId:${id}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/launch/${encodeURIComponent(id)}/`, { params: { mode: 'detailed' } });
    const result = { ...mapLaunch(data), _cached: false };
    cache.set(cacheKey, result, 86400);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'launches');
  }
}
