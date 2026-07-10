import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();

export async function getRandomPet() {
  const cacheKey = 'pets:random';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  let data;
  try {
    ({ data } = await http.get('https://random.dog/woof.json'));
  } catch (err) {
    throw wrapProviderError(err, 'pets');
  }

  const result = { pet: data, _cached: false };
  cache.set(cacheKey, result, 60);
  return result;
}
