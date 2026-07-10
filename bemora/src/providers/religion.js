import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();

export async function getRandomVerse() {
  const cacheKey = 'religion:verse:random';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  let data;
  try {
    ({ data } = await http.get('https://bible-api.com/john+3:16'));
  } catch (err) {
    throw wrapProviderError(err, 'religion');
  }

  const result = { verse: data, _cached: false };
  cache.set(cacheKey, result, 86400);
  return result;
}

export async function getVerse({ reference }) {
  let data;
  try {
    ({ data } = await http.get(`https://bible-api.com/${encodeURIComponent(reference)}`));
  } catch (err) {
    throw wrapProviderError(err, 'religion');
  }
  return { verse: data };
}
