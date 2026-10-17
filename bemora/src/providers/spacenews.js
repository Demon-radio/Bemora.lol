import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();

const BASE = 'https://api.spaceflightnewsapi.net/v4';

/**
 * Normalize a Spaceflight News article.
 * @param {Object} a
 * @returns {Object}
 */
function mapArticle(a) {
  return {
    id: a.id,
    title: a.title,
    url: a.url,
    image_url: a.image_url,
    news_site: a.news_site,
    summary: a.summary,
    published_at: a.published_at,
    updated_at: a.updated_at,
  };
}

/**
 * Fetch Spaceflight News articles.
 * @param {Object} params
 * @param {number} [params.limit]
 * @param {string} [params.search]
 */
export async function articles({ limit = 10, search }) {
  const cacheKey = `spacenews:articles:${limit}:${search || 'all'}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const params = { limit };
    if (search) params.search_title = search;
    const { data } = await http.get(`${BASE}/articles/`, { params });
    const result = {
      count: data.count,
      articles: data.results.map(mapArticle),
      _cached: false,
    };
    cache.set(cacheKey, result, 600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'spacenews');
  }
}

/**
 * Fetch Spaceflight News blogs.
 * @param {Object} params
 * @param {number} [params.limit]
 */
export async function blogs({ limit = 10 }) {
  const cacheKey = `spacenews:blogs:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/blogs/`, { params: { limit } });
    const result = {
      count: data.count,
      blogs: data.results.map(mapArticle),
      _cached: false,
    };
    cache.set(cacheKey, result, 600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'spacenews');
  }
}

/**
 * Fetch Spaceflight News reports.
 * @param {Object} params
 * @param {number} [params.limit]
 */
export async function reports({ limit = 10 }) {
  const cacheKey = `spacenews:reports:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/reports/`, { params: { limit } });
    const result = {
      count: data.count,
      reports: data.results.map(mapArticle),
      _cached: false,
    };
    cache.set(cacheKey, result, 600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'spacenews');
  }
}
