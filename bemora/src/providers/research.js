import axios from 'axios';
import * as cache from '../core/cache.js';
import { logger } from '../core/logger.js';

/**
 * Search Wikipedia
 * @param {Object} params
 * @param {string} params.query
 * @param {string} [params.language] - e.g. 'en', 'ar'
 * @param {number} [params.limit]
 * @returns {Promise<Object>}
 */
export async function searchWikipedia({ query, language = 'en', limit = 5 }) {
  const cacheKey = `research:wiki:${language}:${query}:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data } = await axios.get(
    `https://${language}.wikipedia.org/w/api.php`,
    {
      params: {
        action: 'query',
        list: 'search',
        srsearch: query,
        srlimit: limit,
        format: 'json',
        origin: '*',
      },
    }
  );

  const result = {
    query,
    language,
    results: data.query.search.map((r) => ({
      title: r.title,
      snippet: r.snippet.replace(/<[^>]+>/g, ''),
      url: `https://${language}.wikipedia.org/wiki/${encodeURIComponent(r.title)}`,
      wordcount: r.wordcount,
      timestamp: r.timestamp,
    })),
    _cached: false,
  };

  cache.set(cacheKey, result, 3600);
  logger.info(`Wikipedia searched: "${query}"`);
  return result;
}

/**
 * Get full Wikipedia article summary
 * @param {Object} params
 * @param {string} params.title - Article title
 * @param {string} [params.language]
 * @returns {Promise<Object>}
 */
export async function getWikipediaArticle({ title, language = 'en' }) {
  const cacheKey = `research:wiki-article:${language}:${title}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data } = await axios.get(
    `https://${language}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`
  );

  const result = {
    title: data.title,
    description: data.description,
    extract: data.extract,
    url: data.content_urls?.desktop?.page,
    image: data.thumbnail?.source,
    _cached: false,
  };

  cache.set(cacheKey, result, 86400);
  return result;
}

/**
 * Search books via Open Library
 * @param {Object} params
 * @param {string} params.query
 * @param {number} [params.limit]
 * @returns {Promise<Object>}
 */
export async function searchBooks({ query, limit = 10 }) {
  const cacheKey = `research:books:${query}:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data } = await axios.get('https://openlibrary.org/search.json', {
    params: { q: query, limit },
  });

  const result = {
    total: data.numFound,
    books: (data.docs || []).slice(0, limit).map((b) => ({
      title: b.title,
      author: b.author_name?.[0] || 'Unknown',
      year: b.first_publish_year,
      isbn: b.isbn?.[0],
      cover: b.cover_i
        ? `https://covers.openlibrary.org/b/id/${b.cover_i}-M.jpg`
        : null,
      url: `https://openlibrary.org${b.key}`,
    })),
    _cached: false,
  };

  cache.set(cacheKey, result, 3600);
  logger.info(`Books searched: "${query}"`);
  return result;
}
