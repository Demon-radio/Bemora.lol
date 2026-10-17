import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();

const BASE = 'https://kitsu.io/api/edge';

/**
 * Search anime by text.
 * @param {Object} params
 * @param {string} params.query
 * @param {number} [params.limit]
 * @returns {Promise<Object>} query plus anime array
 */
export async function search({ query, limit = 5 } = {}) {
  const cacheKey = `kitsu:search:${query}:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/anime`, {
      params: { 'filter[text]': query, 'page[limit]': limit },
    });
    const result = {
      query,
      anime: (data.data || []).map((a) => ({
        id: a.id,
        title: a.attributes?.canonicalTitle,
        english: a.attributes?.titles?.en,
        type: a.attributes?.subtype,
        status: a.attributes?.status,
        episodes: a.attributes?.episodeCount,
        rating: a.attributes?.averageRating,
        startDate: a.attributes?.startDate,
        synopsis: a.attributes?.synopsis,
      })),
      _cached: false,
    };
    cache.set(cacheKey, result, 3600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'kitsu');
  }
}

/**
 * Fetch an anime by id.
 * @param {Object} params
 * @param {string|number} params.id
 * @returns {Promise<Object>} normalized anime
 */
export async function anime({ id } = {}) {
  const cacheKey = `kitsu:anime:${id}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/anime/${encodeURIComponent(id)}`);
    const a = data.data?.attributes || {};
    const result = {
      id,
      title: a.canonicalTitle,
      english: a.titles?.en,
      type: a.subtype,
      status: a.status,
      episodes: a.episodeCount,
      rating: a.averageRating,
      synopsis: a.synopsis,
      _cached: false,
    };
    cache.set(cacheKey, result, 3600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'kitsu');
  }
}
