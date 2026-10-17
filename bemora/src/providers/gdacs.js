import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();

const BASE = 'https://www.gdacs.org/gdacsapi/api';

/**
 * Fetch active GDACS disaster events.
 * @param {Object} params
 * @param {number} [params.limit=20] - max number of events
 * @param {string} [params.type] - filter by event type
 * @returns {Promise<Object>} disaster events
 */
export async function events({ limit = 20, type } = {}) {
  const cacheKey = `gdacs:events:${limit}:${type}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/events/geteventlist/SEARCH`);
    let feats = data.features || [];
    if (type) feats = feats.filter((f) => f.properties?.eventtype === type);
    const result = {
      events: feats.slice(0, limit).map((f) => ({
        id: f.properties?.eventid,
        type: f.properties?.eventtype,
        title: f.properties?.name || f.properties?.htmldescription,
        alertLevel: f.properties?.alertlevel,
        from: f.properties?.fromdate,
        to: f.properties?.todate,
        country: f.properties?.country,
        lat: f.geometry?.coordinates?.[1],
        lon: f.geometry?.coordinates?.[0],
      })),
      _cached: false,
    };
    cache.set(cacheKey, result, 600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'gdacs');
  }
}
