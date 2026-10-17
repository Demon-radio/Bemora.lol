import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();

export async function searchBooks({ query, limit = 10 }) {
  const cacheKey = `books:search:${query}:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  try {
    const { data } = await http.get('https://www.googleapis.com/books/v1/volumes', {
      params: { q: query, maxResults: limit },
    });
    const result = { books: data.items || [], _cached: false };
    cache.set(cacheKey, result, 3600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'books');
  }
}

export async function getBookById({ id }) {
  try {
    const { data } = await http.get(`https://www.googleapis.com/books/v1/volumes/${id}`);
    return { book: data };
  } catch (err) {
    throw wrapProviderError(err, 'books');
  }
}

export async function getRandomBook() {
  const cacheKey = 'books:random';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  try {
    const { data } = await http.get('https://openlibrary.org/api/books?bibkeys=ISBN:9780141439518&jscmd=data&format=json');
    const result = { book: Object.values(data)[0], _cached: false };
    cache.set(cacheKey, result, 3600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'books');
  }
}
