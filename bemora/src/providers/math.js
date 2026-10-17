import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();

export async function evaluateMath({ expression }) {
  const cacheKey = `math:eval:${expression}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  let data;
  try {
    ({ data } = await http.get('http://api.mathjs.org/v4/', {
      params: { expr: expression },
    }));
  } catch (err) {
    throw wrapProviderError(err, 'math');
  }

  const result = { result: data, _cached: false };
  cache.set(cacheKey, result, 86400);
  return result;
}

export async function getRandomMathFact({ number, type = 'trivia' }) {
  const cacheKey = `math:fact:${number}:${type}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  let data;
  try {
    ({ data } = await http.get(`http://numbersapi.com/${number}/${type}?json`));
  } catch (err) {
    throw wrapProviderError(err, 'math');
  }

  const result = { fact: data, _cached: false };
  cache.set(cacheKey, result, 86400);
  return result;
}
