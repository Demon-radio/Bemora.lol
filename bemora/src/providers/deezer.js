import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();

const BASE = 'https://api.deezer.com';

/**
 * Search tracks by query.
 * @param {Object} params
 * @param {string} params.query
 * @param {number} [params.limit]
 * @returns {Promise<Object>} query plus tracks array
 */
export async function search({ query, limit = 5 } = {}) {
  const cacheKey = `deezer:search:${query}:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/search`, { params: { q: query, limit } });
    const result = {
      query,
      tracks: (data.data || []).map((t) => ({
        id: t.id,
        title: t.title,
        duration: t.duration,
        artist: t.artist?.name,
        album: t.album?.title,
        preview: t.preview,
      })),
      _cached: false,
    };
    cache.set(cacheKey, result, 3600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'deezer');
  }
}

/**
 * Fetch a track by id.
 * @param {Object} params
 * @param {string|number} params.id
 * @returns {Promise<Object>} normalized track
 */
export async function track({ id } = {}) {
  const cacheKey = `deezer:track:${id}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/track/${encodeURIComponent(id)}`);
    const result = {
      id: data.id,
      title: data.title,
      duration: data.duration,
      artist: data.artist?.name,
      album: data.album?.title,
      preview: data.preview,
      _cached: false,
    };
    cache.set(cacheKey, result, 3600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'deezer');
  }
}

/**
 * Fetch an album by id.
 * @param {Object} params
 * @param {string|number} params.id
 * @returns {Promise<Object>} normalized album
 */
export async function album({ id } = {}) {
  const cacheKey = `deezer:album:${id}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/album/${encodeURIComponent(id)}`);
    const result = {
      id: data.id,
      title: data.title,
      artist: data.artist?.name,
      releaseDate: data.release_date,
      tracks: data.nb_tracks,
      cover: data.cover_medium,
      _cached: false,
    };
    cache.set(cacheKey, result, 3600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'deezer');
  }
}

/**
 * Fetch an artist by id.
 * @param {Object} params
 * @param {string|number} params.id
 * @returns {Promise<Object>} normalized artist
 */
export async function artist({ id } = {}) {
  const cacheKey = `deezer:artist:${id}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/artist/${encodeURIComponent(id)}`);
    const result = {
      id: data.id,
      name: data.name,
      albums: data.nb_album,
      fans: data.nb_fan,
      picture: data.picture_medium,
      _cached: false,
    };
    cache.set(cacheKey, result, 3600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'deezer');
  }
}

/**
 * Fetch the top chart tracks.
 * @returns {Promise<Object>} tracks array
 */
export async function chart() {
  const cacheKey = 'deezer:chart';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/chart/0/tracks`, { params: { limit: 10 } });
    const result = {
      tracks: (data.data || []).map((t) => ({
        id: t.id,
        title: t.title,
        artist: t.artist?.name,
      })),
      _cached: false,
    };
    cache.set(cacheKey, result, 1800);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'deezer');
  }
}
