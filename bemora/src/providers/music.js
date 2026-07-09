import axios from 'axios';
import * as cache from '../core/cache.js';
import { USER_AGENT } from '../core/headers.js';

const MB = 'https://musicbrainz.org/ws/2';
const MB_HEADERS = { 'User-Agent': USER_AGENT };

/**
 * Search artists (MusicBrainz — Free, no key)
 * @param {{ name: string, limit?: number }} params
 */
export async function searchArtist({ name, limit = 5 }) {
  const cacheKey = `music:artist:${name}:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data } = await axios.get(`${MB}/artist`, {
    params: { query: name, limit, fmt: 'json' },
    headers: MB_HEADERS,
  });

  const result = {
    artists: data.artists.map((a) => ({
      id: a.id,
      name: a.name,
      type: a.type,
      country: a.country,
      area: a.area?.name,
      begin: a['life-span']?.begin,
      tags: a.tags?.slice(0, 5).map((t) => t.name),
      score: a.score,
    })),
    _cached: false,
  };

  cache.set(cacheKey, result, 3600);
  return result;
}

/**
 * Search albums (releases)
 * @param {{ query: string, artist?: string, limit?: number }} params
 */
export async function searchAlbum({ query, artist, limit = 5 }) {
  const q = artist ? `${query} AND artist:${artist}` : query;
  const cacheKey = `music:album:${q}:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data } = await axios.get(`${MB}/release-group`, {
    params: { query: q, limit, type: 'album', fmt: 'json' },
    headers: MB_HEADERS,
  });

  const result = {
    albums: (data['release-groups'] || []).map((r) => ({
      id: r.id,
      title: r.title,
      artist: r['artist-credit']?.[0]?.artist?.name,
      first_release: r['first-release-date'],
      type: r['primary-type'],
      score: r.score,
    })),
    _cached: false,
  };

  cache.set(cacheKey, result, 3600);
  return result;
}

/**
 * Get Spotify embed URL for a track (Spotify Web API - needs key)
 * @param {{ trackId: string }} params
 */
export function spotifyEmbed({ trackId }) {
  return `https://open.spotify.com/embed/track/${trackId}`;
}

/**
 * Search via iTunes (Free, no key) - songs, albums, artists
 * @param {{ term: string, media?: string, limit?: number }} params
 */
export async function itunesSearch({ term, media = 'music', limit = 10 }) {
  const cacheKey = `music:itunes:${media}:${term}:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data } = await axios.get('https://itunes.apple.com/search', {
    params: { term, media, limit },
  });

  const result = {
    total: data.resultCount,
    results: data.results.map((r) => ({
      artist: r.artistName,
      track: r.trackName,
      album: r.collectionName,
      genre: r.primaryGenreName,
      preview_url: r.previewUrl,
      artwork: r.artworkUrl100,
      release_date: r.releaseDate,
      price: r.trackPrice,
    })),
    _cached: false,
  };

  cache.set(cacheKey, result, 3600);
  return result;
}
