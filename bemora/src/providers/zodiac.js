import * as cache from '../core/cache.js';
import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';

const http = httpClient();

export async function getHoroscope({ sign, day = 'today' }) {
  const cacheKey = `zodiac:${sign}:${day}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  try {
    const { data } = await http.get(`https://aztro.sameerkumar.website/`, {
      params: { sign, day },
    });
    const result = { horoscope: data, _cached: false };
    cache.set(cacheKey, result, 86400);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'zodiac');
  }
}
