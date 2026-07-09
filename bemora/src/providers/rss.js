import axios from 'axios';
import * as cache from '../core/cache.js';
import { USER_AGENT } from '../core/headers.js';

/**
 * Parse RSS/Atom feed into clean article objects (no key needed)
 * @param {string} url
 * @returns {Promise<Object[]>}
 */
async function parseFeed(url) {
  const { data } = await axios.get(url, {
    headers: { 'User-Agent': USER_AGENT, Accept: 'application/rss+xml, application/xml, text/xml' },
    timeout: 10000,
  });

  // lightweight regex parser — no external lib needed
  const items = [];
  const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = itemRegex.exec(data)) !== null) {
    const block = match[1];
    const get = (tag) => {
      const m = block.match(new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?(.*?)(?:\\]\\]>)?<\\/${tag}>`, 'si'));
      return m ? m[1].trim() : null;
    };
    items.push({
      title: get('title'),
      description: get('description')?.replace(/<[^>]+>/g, '').slice(0, 200),
      url: get('link'),
      published: get('pubDate') || get('dc:date'),
      author: get('dc:creator') || get('author'),
      category: get('category'),
    });
  }

  // Atom support
  if (!items.length) {
    const entryRegex = /<entry[^>]*>([\s\S]*?)<\/entry>/gi;
    while ((match = entryRegex.exec(data)) !== null) {
      const block = match[1];
      const get = (tag) => {
        const m = block.match(new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?(.*?)(?:\\]\\]>)?<\\/${tag}>`, 'si'));
        return m ? m[1].trim() : null;
      };
      const linkMatch = block.match(/<link[^>]+href=["']([^"']+)["']/i);
      items.push({
        title: get('title'),
        description: get('summary')?.replace(/<[^>]+>/g, '').slice(0, 200),
        url: linkMatch?.[1],
        published: get('updated') || get('published'),
        author: get('name'),
      });
    }
  }

  return items.filter((i) => i.title);
}

const RSS_SOURCES = {
  'bbc-world':       'https://feeds.bbci.co.uk/news/world/rss.xml',
  'bbc-tech':        'https://feeds.bbci.co.uk/news/technology/rss.xml',
  'bbc-business':    'https://feeds.bbci.co.uk/news/business/rss.xml',
  'bbc-sport':       'https://feeds.bbci.co.uk/sport/rss.xml',
  'aljazeera':       'https://www.aljazeera.com/xml/rss/all.xml',
  'reuters-world':   'https://feeds.reuters.com/reuters/worldNews',
  'reuters-tech':    'https://feeds.reuters.com/reuters/technologyNews',
  'reuters-business':'https://feeds.reuters.com/reuters/businessNews',
  'cnn-world':       'http://rss.cnn.com/rss/edition_world.rss',
  'cnn-tech':        'http://rss.cnn.com/rss/edition_technology.rss',
  'google-news':     'https://news.google.com/rss',
  'hn-top':          'https://hnrss.org/frontpage',
  'nasa-news':       'https://www.nasa.gov/rss/dyn/breaking_news.rss',
  'space-news':      'https://spacenews.com/feed/',
  'mit-tech':        'https://www.technologyreview.com/feed/',
};

/**
 * Fetch news from a named RSS source
 * @param {{ source: string, limit?: number }} params
 * Sources: bbc-world, bbc-tech, aljazeera, reuters-world, cnn-world, google-news, hn-top, nasa-news ...
 */
export async function fetchFeed({ source, limit = 20 }) {
  const url = RSS_SOURCES[source];
  if (!url) throw new Error(`Unknown RSS source: "${source}". Available: ${Object.keys(RSS_SOURCES).join(', ')}`);

  const cacheKey = `rss:${source}:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const items = await parseFeed(url);
  const result = { source, items: items.slice(0, limit), total: items.length, _cached: false };
  cache.set(cacheKey, result, 600);
  return result;
}

/**
 * Fetch from a custom RSS URL
 * @param {{ url: string, limit?: number }} params
 */
export async function fetchCustomFeed({ url, limit = 20 }) {
  const cacheKey = `rss:custom:${url}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const items = await parseFeed(url);
  const result = { url, items: items.slice(0, limit), total: items.length, _cached: false };
  cache.set(cacheKey, result, 600);
  return result;
}

/**
 * Aggregate news from multiple RSS sources at once
 * @param {{ sources: string[], limit?: number, sortBy?: 'published'|'source' }} params
 */
export async function aggregateFeeds({ sources, limit = 10, sortBy = 'published' }) {
  const results = await Promise.allSettled(
    sources.map((s) => {
      const url = RSS_SOURCES[s] || s;
      return parseFeed(url).then((items) =>
        items.slice(0, limit).map((i) => ({ ...i, source: s }))
      );
    })
  );

  const all = results
    .filter((r) => r.status === 'fulfilled')
    .flatMap((r) => r.value);

  if (sortBy === 'published') {
    all.sort((a, b) => new Date(b.published || 0) - new Date(a.published || 0));
  }

  return { items: all.slice(0, limit * sources.length), sources, total: all.length, _cached: false };
}

export const AVAILABLE_SOURCES = Object.keys(RSS_SOURCES);
