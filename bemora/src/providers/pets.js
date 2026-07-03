import axios from 'axios';
import * as cache from '../core/cache.js';

export async function getRandomPet() {
  const cacheKey = 'pets:random';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data } = await axios.get('https://random.dog/woof.json');
  const result = { pet: data, _cached: false };
  cache.set(cacheKey, result, 60);
  return result;
}
