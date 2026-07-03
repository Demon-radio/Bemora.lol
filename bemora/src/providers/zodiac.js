import axios from 'axios';
import * as cache from '../core/cache.js';

export async function getHoroscope({ sign, day = 'today' }) {
  const cacheKey = `zodiac:${sign}:${day}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data } = await axios.get(`https://aztro.sameerkumar.website/`, {
    params: { sign, day },
  });
  const result = { horoscope: data, _cached: false };
  cache.set(cacheKey, result, 86400);
  return result;
}
