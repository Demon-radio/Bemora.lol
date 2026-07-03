import axios from 'axios';
import * as cache from '../core/cache.js';

export async function getRandomQuote() {
  const cacheKey = 'literature:quote:random';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data } = await axios.get('https://api.quotable.io/random');
  const result = { quote: data, _cached: false };
  cache.set(cacheKey, result, 3600);
  return result;
}

export async function searchQuotes({ query }) {
  const { data } = await axios.get('https://api.quotable.io/search/quotes', {
    params: { query },
  });
  return { quotes: data.results };
}
