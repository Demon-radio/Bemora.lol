import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();

export async function searchLyrics({ artist, title }) {
  const cacheKey = `lyrics:search:${artist}:${title}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  let data;
  try {
    ({ data } = await http.get(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`));
  } catch (err) {
    throw wrapProviderError(err, 'lyrics');
  }

  const result = { lyrics: data.lyrics, _cached: false };
  cache.set(cacheKey, result, 86400);
  return result;
}
