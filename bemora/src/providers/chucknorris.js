import axios from 'axios';

export async function random({ category } = {}) {
  const params = category ? { category } : {};
  const { data } = await axios.get('https://api.chucknorris.io/jokes/random', { params });
  return { id: data.id, joke: data.value, category: data.categories?.[0], url: data.url };
}

export async function categories() {
  const { data } = await axios.get('https://api.chucknorris.io/jokes/categories');
  return { categories: data };
}

export async function search({ query }) {
  const { data } = await axios.get('https://api.chucknorris.io/jokes/search', { params: { query } });
  return { total: data.total, jokes: data.result?.map((j) => ({ id: j.id, joke: j.value })) };
}
