import axios from 'axios';
import * as cache from '../core/cache.js';

export async function evaluateMath({ expression }) {
  const cacheKey = `math:eval:${expression}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data } = await axios.get('http://api.mathjs.org/v4/', {
    params: { expr: expression },
  });
  const result = { result: data, _cached: false };
  cache.set(cacheKey, result, 86400);
  return result;
}

export async function getRandomMathFact({ number, type = 'trivia' }) {
  const cacheKey = `math:fact:${number}:${type}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data } = await axios.get(`http://numbersapi.com/${number}/${type}?json`);
  const result = { fact: data, _cached: false };
  cache.set(cacheKey, result, 86400);
  return result;
}
