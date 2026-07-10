import * as cache from '../core/cache.js';
import { httpClient } from '../core/http.js';

const http = httpClient();

const FALLBACK_FACTS = [
  'A group of flamingos is called a "flamboyance".',
  'Octopuses have three hearts and blue blood.',
  'A snail can sleep for three years.',
  'Elephants are the only mammals that can not jump.',
  'A shrimp\'s heart is in its head.',
  'Koalas sleep up to 22 hours a day.',
  'Sea otters hold hands while sleeping so they do not drift apart.',
];

export async function getRandomAnimalFact() {
  const cacheKey = 'wildlife:fact:random';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  try {
    const { data } = await http.get('https://some-random-api.com/facts/animal', { timeout: 5000 });
    const fact = typeof data === 'string' ? data : data.fact;
    const result = { fact, _cached: false, _source: 'some-random-api' };
    cache.set(cacheKey, result, 3600);
    return result;
  } catch (e) {
    const fact = FALLBACK_FACTS[Math.floor(Math.random() * FALLBACK_FACTS.length)];
    return { fact, _cached: false, _source: 'fallback' };
  }
}
