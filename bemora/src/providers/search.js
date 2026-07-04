import axios from 'axios';
import * as cache from '../core/cache.js';

/**
 * DuckDuckGo Instant Answers (Free, no key)
 * Great for quick factual lookups.
 * @param {{ query: string }} params
 */
export async function instantAnswer({ query }) {
  const cacheKey = `search:ddg:${query}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data } = await axios.get('https://api.duckduckgo.com/', {
    params: { q: query, format: 'json', no_html: 1, skip_disambig: 1 },
  });

  const result = {
    query,
    answer: data.Answer || null,
    abstract: data.Abstract || null,
    abstract_url: data.AbstractURL || null,
    abstract_source: data.AbstractSource || null,
    image: data.Image || null,
    type: data.Type,
    related_topics: (data.RelatedTopics || [])
      .filter((t) => t.Text)
      .slice(0, 5)
      .map((t) => ({ text: t.Text, url: t.FirstURL })),
    infobox: data.Infobox?.content?.slice(0, 5) || [],
    _cached: false,
  };

  cache.set(cacheKey, result, 3600);
  return result;
}

/**
 * Wikipedia full-text search (Free, no key)
 * @param {{ query: string, language?: string, limit?: number }} params
 */
export async function webSearch({ query, language = 'en', limit = 5 }) {
  if (!/^[a-z]{2,3}(-[a-z]{2,4})?$/i.test(language)) {
    throw new Error(`Invalid language code: "${language}". Expected a short locale code like "en" or "zh-hans".`);
  }
  const cacheKey = `search:wiki:${language}:${query}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data } = await axios.get(
    `https://${language}.wikipedia.org/w/api.php`,
    {
      params: {
        action: 'query', list: 'search', srsearch: query,
        srlimit: limit, srinfo: 'totalhits', srprop: 'snippet|titlesnippet',
        format: 'json', origin: '*',
      },
      headers: { 'User-Agent': 'bemora-npm-library (+https://github.com/Demon-radio/Bemora.lol)' },
    }
  );

  const result = {
    query,
    total_hits: data.query?.searchinfo?.totalhits,
    results: (data.query?.search || []).map((r) => ({
      title: r.title,
      snippet: r.snippet.replace(/<[^>]+>/g, ''),
      url: `https://${language}.wikipedia.org/wiki/${encodeURIComponent(r.title)}`,
    })),
    _cached: false,
  };

  cache.set(cacheKey, result, 3600);
  return result;
}
