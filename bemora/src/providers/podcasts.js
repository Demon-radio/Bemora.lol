import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';
import { USER_AGENT } from '../core/headers.js';

const http = httpClient({ headers: { 'User-Agent': USER_AGENT } });

/**
 * Search podcasts via iTunes (Free, no key)
 * @param {{ query: string, limit?: number, country?: string, language?: string }} params
 */
export async function searchPodcasts({ query, limit = 10, country = 'us', language } = {}) {
  const cacheKey = `podcasts:search:${query}:${limit}:${country}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const params = { term: query, media: 'podcast', limit, country };
  if (language) params.language = language;

  let data;
  try {
    ({ data } = await http.get('https://itunes.apple.com/search', { params }));
  } catch (err) {
    throw wrapProviderError(err, 'podcasts');
  }

  const result = {
    total: data.resultCount,
    podcasts: data.results.map((p) => ({
      id: p.collectionId,
      name: p.collectionName,
      artist: p.artistName,
      genre: p.primaryGenreName,
      episodes: p.trackCount,
      feed_url: p.feedUrl,
      artwork: p.artworkUrl600 || p.artworkUrl100,
      url: p.collectionViewUrl,
      release_date: p.releaseDate,
      country: p.country,
    })),
    _cached: false,
  };

  cache.set(cacheKey, result, 3600);
  return result;
}

/**
 * Get podcast episodes from its RSS feed
 * @param {{ feedUrl: string, limit?: number }} params
 */
export async function getPodcastEpisodes({ feedUrl, limit = 10 }) {
  const cacheKey = `podcasts:episodes:${feedUrl}:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  let data;
  try {
    ({ data } = await http.get(feedUrl, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'application/rss+xml, text/xml' },
    }));
  } catch (err) {
    throw wrapProviderError(err, 'podcasts');
  }

  const episodes = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;

  while ((match = itemRegex.exec(data)) !== null && episodes.length < limit) {
    const block = match[1];
    const get = (tag) => {
      const m = block.match(new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?(.*?)(?:\\]\\]>)?<\\/${tag}>`, 'si'));
      return m ? m[1].trim() : null;
    };
    const enclosure = block.match(/<enclosure[^>]+url=["']([^"']+)["'][^>]*length=["']([^"']*)["'][^>]*type=["']([^"']*)["']/i);
    const duration = block.match(/<itunes:duration[^>]*>(.*?)<\/itunes:duration>/i);

    episodes.push({
      title: get('title'),
      description: get('description')?.replace(/<[^>]+>/g, '').slice(0, 300),
      published: get('pubDate'),
      audio_url: enclosure?.[1],
      audio_type: enclosure?.[3],
      duration: duration?.[1]?.trim(),
      guid: get('guid'),
    });
  }

  const result = { feedUrl, episodes, _cached: false };
  cache.set(cacheKey, result, 3600);
  return result;
}

/**
 * Search podcasts on Podcast Index (Free, no auth for basic)
 * @param {{ query: string, limit?: number }} params
 */
export async function searchPodcastIndex({ query, limit = 10 }) {
  const cacheKey = `podcasts:index:${query}:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data } = await http.get('https://api.podcastindex.org/api/1.0/search/byterm', {
    params: { q: query, max: limit },
    headers: {
      'User-Agent': USER_AGENT,
      'X-Auth-Date': Math.floor(Date.now() / 1000).toString(),
    },
  }).catch(() => ({ data: { feeds: [] } }));

  const result = {
    podcasts: (data.feeds || []).map((p) => ({
      id: p.id, title: p.title,
      description: p.description?.slice(0, 200),
      author: p.author,
      image: p.image,
      feed_url: p.url,
      website: p.link,
      language: p.language,
      episodes: p.episodeCount,
      categories: p.categories ? Object.values(p.categories) : [],
    })),
    _cached: false,
  };

  cache.set(cacheKey, result, 3600);
  return result;
}
