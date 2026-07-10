import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();

export async function getRandomDog() {
  const cacheKey = 'animals:dog:random';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  // Primary: dog.ceo (occasionally returns Cloudflare 520)
  // Fallback 1: random.dog
  // Fallback 2: The Dog API (no key needed for basic image search)
  let image = null;
  let source = 'dog.ceo';

  try {
    const { data } = await http.get('https://dog.ceo/api/breeds/image/random');
    image = data.message;
  } catch {
    try {
      source = 'random.dog';
      const { data } = await http.get('https://random.dog/woof.json');
      // random.dog may return video files — skip those
      if (data.url && /\.(jpg|jpeg|png|gif|webp)$/i.test(data.url)) {
        image = data.url;
      } else {
        throw new Error('non-image filetype');
      }
    } catch {
      source = 'thedogapi';
      const { data } = await http.get('https://api.thedogapi.com/v1/images/search');
      image = data[0]?.url ?? null;
    }
  }

  const result = { image, _source: source, _cached: false };
  cache.set(cacheKey, result, 60);
  return result;
}

export async function getRandomCat() {
  const cacheKey = 'animals:cat:random';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  try {
    const { data } = await http.get('https://api.thecatapi.com/v1/images/search');
    const result = { image: data[0].url, _cached: false };
    cache.set(cacheKey, result, 60);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'animals');
  }
}

export async function getRandomFox() {
  const cacheKey = 'animals:fox:random';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  try {
    const { data } = await http.get('https://randomfox.ca/floof/');
    const result = { image: data.image, _cached: false };
    cache.set(cacheKey, result, 60);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'animals');
  }
}

export async function getRandomDuck() {
  const cacheKey = 'animals:duck:random';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  try {
    const { data } = await http.get('https://random-d.uk/api/v2/random');
    const result = { image: data.url, _cached: false };
    cache.set(cacheKey, result, 60);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'animals');
  }
}

export async function getRandomPanda() {
  const cacheKey = 'animals:panda:random';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  try {
    const { data } = await http.get('https://some-random-api.com/animal/panda');
    const result = { image: data.image, fact: data.fact, _cached: false, _source: 'some-random-api' };
    cache.set(cacheKey, result, 60);
    return result;
  } catch (e) {
    const { data } = await http.get('https://api.thecatapi.com/v1/images/search', { params: { limit: 1 } });
    return { image: data[0]?.url, fact: 'Pandas spend up to 14 hours a day eating bamboo.', _cached: false, _source: 'fallback' };
  }
}

export async function getRandomBird() {
  const cacheKey = 'animals:bird:random';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  try {
    const { data } = await http.get('https://some-random-api.com/animal/bird');
    const result = { image: data.image, fact: data.fact, _cached: false, _source: 'some-random-api' };
    cache.set(cacheKey, result, 60);
    return result;
  } catch (e) {
    const { data } = await http.get('https://shibe.online/api/birds', { params: { count: 1 } });
    return { image: Array.isArray(data) ? data[0] : null, fact: 'Birds are the only living descendants of dinosaurs.', _cached: false, _source: 'fallback' };
  }
}
