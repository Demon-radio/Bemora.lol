import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();

/**
 * Normalize a Lobsters story.
 * @param {Object} s
 * @returns {Object}
 */
function mapStory(s) {
  return {
    short_id: s.short_id,
    title: s.title,
    url: s.url,
    score: s.score,
    comment_count: s.comment_count,
    created_at: s.created_at,
    author: s.submitter_user,
    tags: s.tags,
    comments_url: s.comments_url,
  };
}

/**
 * Fetch the hottest Lobsters stories.
 */
export async function hottest() {
  const cacheKey = 'lobsters:hottest';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get('https://lobste.rs/hottest.json');
    const result = { stories: data.map(mapStory), _cached: false };
    cache.set(cacheKey, result, 300);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'lobsters');
  }
}

/**
 * Fetch the newest Lobsters stories.
 */
export async function newest() {
  const cacheKey = 'lobsters:newest';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get('https://lobste.rs/newest.json');
    const result = { stories: data.map(mapStory), _cached: false };
    cache.set(cacheKey, result, 300);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'lobsters');
  }
}

/**
 * Fetch the most active Lobsters stories.
 */
export async function active() {
  const cacheKey = 'lobsters:active';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get('https://lobste.rs/active.json');
    const result = { stories: data.map(mapStory), _cached: false };
    cache.set(cacheKey, result, 300);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'lobsters');
  }
}

/**
 * Fetch Lobsters stories for a specific tag.
 * @param {Object} params
 * @param {string} params.tag
 */
export async function byTag({ tag }) {
  const cacheKey = `lobsters:tag:${tag}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`https://lobste.rs/t/${encodeURIComponent(tag)}.json`);
    const result = { tag, stories: data.map(mapStory), _cached: false };
    cache.set(cacheKey, result, 300);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'lobsters');
  }
}
