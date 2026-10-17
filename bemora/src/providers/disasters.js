import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();

/**
 * NASA EONET — Earth Observatory Natural Event Tracker. Free, no key.
 * https://eonet.gsfc.nasa.gov/docs/v3
 *
 * @param {{ category?: string, status?: 'open'|'closed', limit?: number, days?: number }} params
 */
export async function activeEvents({ category, status = 'open', limit = 20, days } = {}) {
  const cacheKey = `disasters:events:${category || ''}:${status}:${limit}:${days || ''}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const params = { status, limit };
  if (category) params.category = category;
  if (days) params.days = days;

  let data;
  try {
    ({ data } = await http.get('https://eonet.gsfc.nasa.gov/api/v3/events', { params }));
  } catch (err) {
    throw wrapProviderError(err, 'disasters');
  }

  const result = {
    provider: 'nasa-eonet',
    count: data.events?.length || 0,
    events: (data.events || []).map((e) => ({
      id: e.id,
      title: e.title,
      categories: e.categories?.map((c) => c.title),
      sources: e.sources?.map((s) => s.url),
      last_updated: e.geometry?.[e.geometry.length - 1]?.date,
      coordinates: e.geometry?.[e.geometry.length - 1]?.coordinates,
      closed: e.closed || null,
    })),
    _cached: false,
  };

  cache.set(cacheKey, result, 900);
  return result;
}

/**
 * List available EONET event categories (wildfires, storms, floods, etc.)
 */
export async function categories() {
  const cacheKey = 'disasters:categories';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  let data;
  try {
    ({ data } = await http.get('https://eonet.gsfc.nasa.gov/api/v3/categories'));
  } catch (err) {
    throw wrapProviderError(err, 'disasters');
  }

  const result = {
    provider: 'nasa-eonet',
    categories: (data.categories || []).map((c) => ({ id: c.id, title: c.title })),
    _cached: false,
  };

  cache.set(cacheKey, result, 86400);
  return result;
}
