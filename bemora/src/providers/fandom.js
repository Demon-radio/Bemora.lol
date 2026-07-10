import { httpClient } from '../core/http.js';
import { ValidationError, wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();

function assertValidWikiName(wiki) {
  if (!/^[a-z0-9][a-z0-9-]{0,60}$/i.test(wiki)) {
    throw new ValidationError(`Invalid wiki name: "${wiki}". Must be a plain subdomain (letters, numbers, hyphens only).`, { provider: 'fandom' });
  }
}

export async function search({ wiki, query, limit = 10 }) {
  assertValidWikiName(wiki);
  const cacheKey = `fandom:search:${wiki}:${query}:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  try {
    const { data } = await http.get(`https://${wiki}.fandom.com/api/v1/Search/List`, {
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
  } catch (err) {
    throw wrapProviderError(err, 'fandom');
  }
}

export async function getPage({ wiki, pageId, title }) {
  assertValidWikiName(wiki);
  const cacheKey = `fandom:page:${wiki}:${pageId || title}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const url = `https://${wiki}.fandom.com/api/v1/Articles/AsSimpleJson`;
  const params = {};
  if (pageId) params.id = pageId;
  if (title) params.titles = title;

  try {
    const { data } = await http.get(url, { params });
    const result = {
      wiki,
      title: data.sections?.[0]?.title || title,
      content: data.sections?.map(s => ({ title: s.title, content: s.content?.map(c => c.text || c.elements?.map(e => e.text || '')).filter(Boolean) })).filter(Boolean) || [],
      _cached: false,
    };
    cache.set(cacheKey, result, 86400);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'fandom');
  }
}

export async function recentActivity({ wiki, limit = 20 }) {
  assertValidWikiName(wiki);
  try {
    const { data } = await http.get(`https://${wiki}.fandom.com/api/v1/Activity/LatestActivity`, {
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
  } catch (err) {
    throw wrapProviderError(err, 'fandom');
  }
}
