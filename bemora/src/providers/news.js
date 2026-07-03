import axios from 'axios';
import * as cache from '../core/cache.js';
import { logger } from '../core/logger.js';

/**
 * Get top headlines
 * @param {Object} params
 * @param {string} [params.country] - e.g. 'us', 'eg', 'gb'
 * @param {string} [params.category] - business|entertainment|health|science|sports|technology
 * @param {string} [params.q] - Search query
 * @param {number} [params.pageSize]
 * @param {string} apiKey - NewsAPI key
 * @returns {Promise<Object>}
 */
export async function getHeadlines({ country = 'us', category, q, pageSize = 10 }, apiKey) {
  const cacheKey = `news:headlines:${country}:${category}:${q}:${pageSize}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data } = await axios.get('https://newsapi.org/v2/top-headlines', {
    params: { country, category, q, pageSize, apiKey },
  });

  const result = {
    total: data.totalResults,
    articles: data.articles.map((a) => ({
      title: a.title,
      description: a.description,
      url: a.url,
      image: a.urlToImage,
      source: a.source.name,
      publishedAt: a.publishedAt,
    })),
    _cached: false,
  };

  cache.set(cacheKey, result, 900);
  logger.info(`News headlines fetched (${result.total} total)`);
  return result;
}

/**
 * Search news articles
 * @param {Object} params
 * @param {string} params.q - Search query (required)
 * @param {string} [params.language]
 * @param {string} [params.sortBy] - relevancy|popularity|publishedAt
 * @param {number} [params.pageSize]
 * @param {string} apiKey
 * @returns {Promise<Object>}
 */
export async function searchNews({ q, language = 'en', sortBy = 'publishedAt', pageSize = 10 }, apiKey) {
  const cacheKey = `news:search:${q}:${language}:${sortBy}:${pageSize}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data } = await axios.get('https://newsapi.org/v2/everything', {
    params: { q, language, sortBy, pageSize, apiKey },
  });

  const result = {
    total: data.totalResults,
    articles: data.articles.map((a) => ({
      title: a.title,
      description: a.description,
      url: a.url,
      image: a.urlToImage,
      source: a.source.name,
      publishedAt: a.publishedAt,
    })),
    _cached: false,
  };

  cache.set(cacheKey, result, 900);
  return result;
}
