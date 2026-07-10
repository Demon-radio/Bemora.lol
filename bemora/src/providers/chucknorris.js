import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';

const http = httpClient();

export async function random({ category } = {}) {
  const params = category ? { category } : {};
  try {
    const { data } = await http.get('https://api.chucknorris.io/jokes/random', { params });
    return { id: data.id, joke: data.value, category: data.categories?.[0], url: data.url };
  } catch (err) {
    throw wrapProviderError(err, 'chucknorris');
  }
}

export async function categories() {
  try {
    const { data } = await http.get('https://api.chucknorris.io/jokes/categories');
    return { categories: data };
  } catch (err) {
    throw wrapProviderError(err, 'chucknorris');
  }
}

export async function search({ query }) {
  try {
    const { data } = await http.get('https://api.chucknorris.io/jokes/search', { params: { query } });
    return { total: data.total, jokes: data.result?.map((j) => ({ id: j.id, joke: j.value })) };
  } catch (err) {
    throw wrapProviderError(err, 'chucknorris');
  }
}
