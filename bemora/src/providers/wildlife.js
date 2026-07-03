import axios from 'axios';
import * as cache from '../core/cache.js';

export async function getRandomAnimalFact() {
  const cacheKey = 'wildlife:fact:random';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data } = await axios.get('https://some-random-api.com/facts/animal');
  const result = { fact: data, _cached: false };
  cache.set(cacheKey, result, 3600);
  return result;
}
