import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();
const BASE = 'https://eonet.gsfc.nasa.gov/api/v3';

function mapEvent(e) {
  return {
    id: e.id,
    title: e.title,
    category: e.categories?.map((c) => c.title),
    sources: e.sources?.map((s) => s.url),
    closed: e.closed,
    geometry: e.geometry?.slice(-1).map((g) => ({ date: g.date, type: g.type, coordinates: g.coordinates }))[0],
  };
}

/**
 * NASA EONET natural events.
 * @param {Object} params
 * @param {number} [params.limit]
 */
export async function events({ limit = 10 }) {
  const cacheKey = `eonet:events:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/events`, { params: { limit } });
    const list = data.events || [];
    const result = { count: list.length, events: list.map(mapEvent), _cached: false };
    cache.set(cacheKey, result, 900);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'eonet');
  }
}

/**
 * NASA EONET natural events in a category.
 * @param {Object} params
 * @param {string} params.category
 * @param {number} [params.limit]
 */
export async function category({ category, limit = 10 }) {
  const cacheKey = `eonet:category:${category}:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/categories/${encodeURIComponent(category)}`, { params: { limit } });
    const list = data.events || [];
    const result = { category, events: list.map(mapEvent), _cached: false };
    cache.set(cacheKey, result, 900);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'eonet');
  }
}

/**
 * NASA EONET wildfires.
 * @param {Object} params
 * @param {number} [params.limit]
 */
export async function wildfires({ limit = 10 }) {
  return category({ category: 'wildfires', limit });
}

/**
 * NASA EONET volcanoes.
 * @param {Object} params
 * @param {number} [params.limit]
 */
export async function volcanoes({ limit = 10 }) {
  return category({ category: 'volcanoes', limit });
}

/**
 * NASA EONET severe storms.
 * @param {Object} params
 * @param {number} [params.limit]
 */
export async function storms({ limit = 10 }) {
  return category({ category: 'severeStorms', limit });
}
