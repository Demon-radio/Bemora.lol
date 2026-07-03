import axios from 'axios';
import * as cache from '../core/cache.js';

export async function getRandomDog() {
  const cacheKey = 'animals:dog:random';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data } = await axios.get('https://dog.ceo/api/breeds/image/random');
  const result = { image: data.message, _cached: false };
  cache.set(cacheKey, result, 60);
  return result;
}

export async function getRandomCat() {
  const cacheKey = 'animals:cat:random';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data } = await axios.get('https://api.thecatapi.com/v1/images/search');
  const result = { image: data[0].url, _cached: false };
  cache.set(cacheKey, result, 60);
  return result;
}

export async function getRandomFox() {
  const cacheKey = 'animals:fox:random';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data } = await axios.get('https://randomfox.ca/floof/');
  const result = { image: data.image, _cached: false };
  cache.set(cacheKey, result, 60);
  return result;
}

export async function getRandomDuck() {
  const cacheKey = 'animals:duck:random';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data } = await axios.get('https://random-d.uk/api/v2/random');
  const result = { image: data.url, _cached: false };
  cache.set(cacheKey, result, 60);
  return result;
}

export async function getRandomPanda() {
  const cacheKey = 'animals:panda:random';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data } = await axios.get('https://some-random-api.com/animal/panda');
  const result = { image: data.image, fact: data.fact, _cached: false };
  cache.set(cacheKey, result, 60);
  return result;
}

export async function getRandomBird() {
  const cacheKey = 'animals:bird:random';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data } = await axios.get('https://some-random-api.com/animal/bird');
  const result = { image: data.image, fact: data.fact, _cached: false };
  cache.set(cacheKey, result, 60);
  return result;
}
