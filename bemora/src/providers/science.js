import * as cache from '../core/cache.js';
import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';

const http = httpClient();

export async function getNasaApod({ date }) {
  const cacheKey = `science:nasa:apod:${date || 'today'}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  try {
    const { data } = await http.get('https://api.nasa.gov/planetary/apod', {
      params: { api_key: 'DEMO_KEY', date },
    });
    const result = { apod: data, _cached: false };
    cache.set(cacheKey, result, 86400);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'science');
  }
}

export async function getRandomScienceFact() {
  const cacheKey = 'science:fact:random';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  try {
    const { data } = await http.get('https://uselessfacts.jsph.pl/random.json?language=en');
    const result = { fact: data, _cached: false };
    cache.set(cacheKey, result, 3600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'science');
  }
}
