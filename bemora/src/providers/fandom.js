
import axios from 'axios';
import * as cache from '../core/cache.js';

/**
 * Fandom API provider - Free, no key needed!
 * Access fandom/wikia wiki data, search, and more.
 * Documentation: https://api.fandom.com/v1/docs
 */

/**
 * Search Fandom for pages on any wiki
 * @param {{ wiki: string, query: string, limit?: number }} params
 *  - wiki: Fandom wiki domain (e.g., 'minecraft', 'harrypotter')
 *  - query: Search term
 */
function assertValidWikiName(wiki) {
  if (!/^[a-z0-9][a-z0-9-]{0,60}$/i.test(wiki)) {
    throw new Error(`Invalid wiki name: "${wiki}". Must be a plain subdomain (letters, numbers, hyphens only).`);
  }
}

export async function search({ wiki, query, limit = 10 }) {
  assertValidWikiName(wiki);
  const cacheKey = `fandom:search:${wiki}:${query}:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data } = await axios.get(`https://${wiki}.fandom.com/api/v1/Search/List`, {
    params: { query, limit }
  });
  const result = {
    wiki,
    total: data.total,
    results: data.items.map(item => ({
      id: item.id,
      title: item.title,
      url: `https://${wiki}.fandom.com/wiki/${encodeURIComponent(item.title.replace(/ /g, '_'))}`,
      snippet: item.snippet || item.abstract,
      thumbnail: item.thumbnail || null,
    })),
    _cached: false,
  };
  cache.set(cacheKey, result, 3600);
  return result;
}

/**
 * Get details of a specific wiki page by page ID or title
 * @param {{ wiki: string, pageId?: number, title?: string }} params
 */
export async function getPage({ wiki, pageId, title }) {
  assertValidWikiName(wiki);
  const cacheKey = `fandom:page:${wiki}:${pageId || title}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  let url = `https://${wiki}.fandom.com/api/v1/Articles/AsSimpleJson`;
  const params = {};
  if (pageId) params.id = pageId;
  if (title) params.titles = title;

  const { data } = await axios.get(url, { params });
  const result = {
    wiki,
    title: data.sections?.[0]?.title || title,
    content: data.sections?.map(s => ({ title: s.title, content: s.content?.map(c => c.text || c.elements?.map(e => e.text || '')).filter(Boolean) })).filter(Boolean) || [],
    _cached: false,
  };
  cache.set(cacheKey, result, 86400);
  return result;
}

/**
 * Get recent activity/changes from a wiki
 * @param {{ wiki: string, limit?: number }} params
 */
export async function recentActivity({ wiki, limit = 20 }) {
  assertValidWikiName(wiki);
  const { data } = await axios.get(`https://${wiki}.fandom.com/api/v1/Activity/LatestActivity`, {
    params: { limit }
  });
  return {
    wiki,
    activity: data.items.map(item => ({
      id: item.id,
      user: item.user,
      action: item.type,
      title: item.title,
      timestamp: item.timestamp,
      url: `https://${wiki}.fandom.com${item.url}`,
    })),
  };
}
