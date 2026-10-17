import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();

/**
 * Normalize a Dev.to article.
 * @param {Object} a
 * @returns {Object}
 */
function mapArticle(a) {
  return {
    id: a.id,
    title: a.title,
    description: a.description,
    url: a.url,
    tags: a.tag_list,
    reactions: a.public_reactions_count,
    comments: a.comments_count,
    reading_time_minutes: a.reading_time_minutes,
    published_at: a.published_at,
    author: a.user?.name,
    author_username: a.user?.username,
    cover_image: a.cover_image,
  };
}

/**
 * Fetch Dev.to articles, optionally filtered by tag.
 * @param {Object} params
 * @param {string} [params.tag]
 * @param {number} [params.page]
 * @param {number} [params.perPage]
 */
export async function articles({ tag, page = 1, perPage = 10 }) {
  const cacheKey = `devto:articles:${tag || 'all'}:${page}:${perPage}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const params = { page, per_page: perPage };
    if (tag) params.tag = tag;
    const { data } = await http.get('https://dev.to/api/articles', { params });
    const result = {
      page,
      count: data.length,
      articles: data.map(mapArticle),
      _cached: false,
    };
    cache.set(cacheKey, result, 600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'devto');
  }
}

/**
 * Fetch Dev.to articles for a specific tag.
 * @param {Object} params
 * @param {string} params.tag
 * @param {number} [params.perPage]
 */
export async function byTag({ tag, perPage = 10 }) {
  return articles({ tag, perPage });
}

/**
 * Fetch trending Dev.to tags.
 * @param {Object} params
 * @param {number} [params.perPage]
 */
export async function tags({ perPage = 20 }) {
  const cacheKey = `devto:tags:${perPage}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get('https://dev.to/api/tags', { params: { per_page: perPage } });
    const result = {
      tags: data.map((t) => ({
        name: t.name,
        bg_color: t.bg_color_hex,
        text_color: t.text_color_hex,
      })),
      _cached: false,
    };
    cache.set(cacheKey, result, 600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'devto');
  }
}
