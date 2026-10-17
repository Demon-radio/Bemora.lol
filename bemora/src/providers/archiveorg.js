import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();

const BASE = 'https://archive.org';

/**
 * Search the Internet Archive advanced search API.
 * @param {Object} params
 * @param {string} params.query - search query
 * @param {number} [params.rows=10] - max number of items
 * @returns {Promise<Object>} search results
 */
export async function search({ query, rows = 10 } = {}) {
  const cacheKey = `archive-org:search:${query}:${rows}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/advancedsearch.php`, {
      params: { q: query, 'fl[]': ['identifier', 'title', 'creator', 'year', 'mediatype'], rows, output: 'json' },
    });
    const result = {
      query,
      items: (data.response?.docs || []).map((d) => ({
        identifier: d.identifier,
        title: d.title,
        creator: d.creator,
        year: d.year,
        mediatype: d.mediatype,
      })),
      _cached: false,
    };
    cache.set(cacheKey, result, 86400);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'archive-org');
  }
}

/**
 * Fetch metadata for an Internet Archive item.
 * @param {Object} params
 * @param {string} params.identifier - item identifier
 * @returns {Promise<Object>} item metadata
 */
export async function metadata({ identifier } = {}) {
  const cacheKey = `archive-org:metadata:${identifier}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/metadata/${encodeURIComponent(identifier)}`);
    const m = data.metadata || {};
    const result = {
      identifier,
      title: Array.isArray(m.title) ? m.title[0] : m.title,
      creator: Array.isArray(m.creator) ? m.creator[0] : m.creator,
      date: m.date,
      mediatype: m.mediatype,
      description: Array.isArray(m.description) ? m.description[0] : m.description,
      _cached: false,
    };
    cache.set(cacheKey, result, 86400);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'archive-org');
  }
}
