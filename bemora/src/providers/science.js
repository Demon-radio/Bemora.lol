import axios from 'axios';
import * as cache from '../core/cache.js';

export async function getNasaApod({ date }) {
  const cacheKey = `science:nasa:apod:${date || 'today'}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data } = await axios.get('https://api.nasa.gov/planetary/apod', {
    params: { api_key: 'DEMO_KEY', date },
  });
  const result = { apod: data, _cached: false };
  cache.set(cacheKey, result, 86400);
  return result;
}

export async function getRandomScienceFact() {
  const cacheKey = 'science:fact:random';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data } = await axios.get('https://uselessfacts.jsph.pl/random.json?language=en');
  const result = { fact: data, _cached: false };
  cache.set(cacheKey, result, 3600);
  return result;
}
