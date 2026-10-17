import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();

/**
 * Fetch article content as plain text via Jina Reader.
 * @param {Object} params
 * @param {string} params.url - article URL
 * @returns {Promise<Object>} article content
 */
export async function article({ url } = {}) {
  const cacheKey = `reader:article:${url}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`https://r.jina.ai/${url}`, {
      headers: { Accept: 'text/plain' },
      responseType: 'text',
    });
    const result = { url, content: String(data).slice(0, 20000), _cached: false };
    cache.set(cacheKey, result, 600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'reader');
  }
}

/**
 * Convert an RSS feed to JSON via rss2json.
 * @param {Object} params
 * @param {string} params.url - RSS feed URL
 * @returns {Promise<Object>} feed and items
 */
export async function rssToJson({ url } = {}) {
  const cacheKey = `reader:rssToJson:${url}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get('https://api.rss2json.com/v1/api.json', { params: { rss_url: url } });
    const result = {
      url,
      feed: { title: data.feed?.title, link: data.feed?.link, description: data.feed?.description },
      items: (data.items || []).map((i) => ({
        title: i.title,
        link: i.link,
        pubDate: i.pubDate,
        author: i.author,
        description: i.description,
      })),
      _cached: false,
    };
    cache.set(cacheKey, result, 600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'reader');
  }
}
