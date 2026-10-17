import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();

const BASE = 'https://poetrydb.org';

/**
 * Normalize a raw PoetryDB poem object into the provider shape.
 * @param {Object} p - raw poem record
 * @returns {Object} normalized poem
 */
function mapPoem(p) {
  return {
    title: p.title,
    author: p.author,
    line_count: parseInt(p.linecount, 10),
    lines: p.lines,
  };
}

/**
 * Detect PoetryDB's single-object error envelope (e.g. {"status":404,...}).
 * @param {any} data - raw response body
 * @returns {boolean} true when the body is an error envelope
 */
function isErrorEnvelope(data) {
  return Array.isArray(data) && data.length === 1 && data[0] && typeof data[0] === 'object' && 'status' in data[0];
}

/**
 * Fetch a random poem (or several) from PoetryDB.
 * @param {Object} params
 * @param {number} [params.limit=1] - max number of poems to return
 * @returns {Promise<Object>} poems array
 */
export async function random({ limit = 1 } = {}) {
  const cacheKey = `poetry:random:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/random`);
    const result = { poems: (Array.isArray(data) ? data : []).slice(0, limit).map(mapPoem), _cached: false };
    cache.set(cacheKey, result, 3600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'poetry');
  }
}

/**
 * Fetch poems by author from PoetryDB.
 * @param {Object} params
 * @param {string} params.author - author name
 * @param {number} [params.limit=3] - max number of poems to return
 * @returns {Promise<Object>} author plus poems array
 */
export async function byAuthor({ author, limit = 3 } = {}) {
  const cacheKey = `poetry:author:${author}:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/author/${encodeURIComponent(author)}`);
    const result = isErrorEnvelope(data)
      ? { author, poems: [], _cached: false }
      : { author, poems: data.slice(0, limit).map(mapPoem), _cached: false };
    cache.set(cacheKey, result, 3600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'poetry');
  }
}

/**
 * Fetch poems by title from PoetryDB.
 * @param {Object} params
 * @param {string} params.title - poem title
 * @returns {Promise<Object>} title plus poems array
 */
export async function byTitle({ title } = {}) {
  const cacheKey = `poetry:title:${title}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/title/${encodeURIComponent(title)}`);
    const result = {
      title,
      poems: (isErrorEnvelope(data) || !Array.isArray(data) ? [] : data).map(mapPoem),
      _cached: false,
    };
    cache.set(cacheKey, result, 3600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'poetry');
  }
}

/**
 * Search poems by matching lines from PoetryDB.
 * @param {Object} params
 * @param {string} params.query - text to match within poem lines
 * @param {number} [params.limit=3] - max number of poems to return
 * @returns {Promise<Object>} query plus poems array
 */
export async function search({ query, limit = 3 } = {}) {
  const cacheKey = `poetry:search:${query}:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/lines/${encodeURIComponent(query)}`);
    const result = {
      query,
      poems: (isErrorEnvelope(data) || !Array.isArray(data) ? [] : data).slice(0, limit).map(mapPoem),
      _cached: false,
    };
    cache.set(cacheKey, result, 3600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'poetry');
  }
}
