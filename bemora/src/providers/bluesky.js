import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();

const BASE = 'https://public.api.bsky.app/xrpc';

/**
 * Search Bluesky actors by query.
 * @param {Object} params
 * @param {string} params.query
 * @param {number} [params.limit]
 */
export async function searchActors({ query, limit = 10 }) {
  const cacheKey = `bluesky:searchActors:${query}:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/app.bsky.actor.searchActors`, {
      params: { q: query, limit },
    });
    const actors = (data.actors || []).map((a) => ({
      did: a.did,
      handle: a.handle,
      display_name: a.displayName,
      description: a.description,
      avatar: a.avatar,
    }));
    const result = { query, actors, _cached: false };
    cache.set(cacheKey, result, 300);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'bluesky');
  }
}

/**
 * Fetch a Bluesky actor profile.
 * @param {Object} params
 * @param {string} params.actor
 */
export async function profile({ actor }) {
  const cacheKey = `bluesky:profile:${actor}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/app.bsky.actor.getProfile`, {
      params: { actor },
    });
    const result = {
      did: data.did,
      handle: data.handle,
      display_name: data.displayName,
      description: data.description,
      avatar: data.avatar,
      banner: data.banner,
      followers: data.followersCount,
      follows: data.followsCount,
      posts: data.postsCount,
      created_at: data.createdAt,
      _cached: false,
    };
    cache.set(cacheKey, result, 300);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'bluesky');
  }
}

/**
 * Fetch the recent feed for a Bluesky actor.
 * @param {Object} params
 * @param {string} params.actor
 * @param {number} [params.limit]
 */
export async function authorFeed({ actor, limit = 10 }) {
  const cacheKey = `bluesky:authorFeed:${actor}:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/app.bsky.feed.getAuthorFeed`, {
      params: { actor, limit },
    });
    const posts = (data.feed || []).map((f) => ({
      uri: f.post.uri,
      cid: f.post.cid,
      text: f.post.record?.text,
      created_at: f.post.record?.createdAt,
      likes: f.post.likeCount,
      replies: f.post.replyCount,
      reposts: f.post.repostCount,
      author: f.post.author?.handle,
    }));
    const result = { actor, posts, _cached: false };
    cache.set(cacheKey, result, 300);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'bluesky');
  }
}
