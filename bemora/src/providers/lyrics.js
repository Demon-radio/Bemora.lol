import axios from 'axios';
import * as cache from '../core/cache.js';

export async function searchLyrics({ artist, title }) {
  const cacheKey = `lyrics:search:${artist}:${title}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data } = await axios.get(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`);
  const result = { lyrics: data.lyrics, _cached: false };
  cache.set(cacheKey, result, 86400);
  return result;
}
