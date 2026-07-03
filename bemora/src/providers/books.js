import axios from 'axios';
import * as cache from '../core/cache.js';

export async function searchBooks({ query, limit = 10 }) {
  const cacheKey = `books:search:${query}:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data } = await axios.get('https://www.googleapis.com/books/v1/volumes', {
    params: { q: query, maxResults: limit },
  });
  const result = { books: data.items || [], _cached: false };
  cache.set(cacheKey, result, 3600);
  return result;
}

export async function getBookById({ id }) {
  const { data } = await axios.get(`https://www.googleapis.com/books/v1/volumes/${id}`);
  return { book: data };
}

export async function getRandomBook() {
  const cacheKey = 'books:random';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data } = await axios.get('https://openlibrary.org/api/books?bibkeys=ISBN:9780141439518&jscmd=data&format=json');
  const result = { book: Object.values(data)[0], _cached: false };
  cache.set(cacheKey, result, 3600);
  return result;
}
