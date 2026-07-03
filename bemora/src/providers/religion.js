import axios from 'axios';
import * as cache from '../core/cache.js';

export async function getRandomVerse() {
  const cacheKey = 'religion:verse:random';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data } = await axios.get('https://bible-api.com/john+3:16');
  const result = { verse: data, _cached: false };
  cache.set(cacheKey, result, 86400);
  return result;
}

export async function getVerse({ reference }) {
  const { data } = await axios.get(`https://bible-api.com/${encodeURIComponent(reference)}`);
  return { verse: data };
}
