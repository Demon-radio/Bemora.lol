import axios from 'axios';
import * as cache from '../core/cache.js';

const BASE = 'https://api.openbrewerydb.org/v1/breweries';

export async function search({ query, city, state, limit = 10 } = {}) {
  const params = { per_page: limit };
  if (query) params.by_name = query;
  if (city) params.by_city = city;
  if (state) params.by_state = state;
  const { data } = await axios.get(BASE, { params });
  return { count: data.length, breweries: data.map((b) => ({ name: b.name, type: b.brewery_type, city: b.city, state: b.state, country: b.country, website: b.website_url })) };
}

export async function random() {
  const { data } = await axios.get(`${BASE}/random`);
  const b = data[0];
  return { name: b.name, type: b.brewery_type, city: b.city, state: b.state, country: b.country, website: b.website_url };
}

export async function getById({ id }) {
  const cacheKey = `brewery:${id}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  const { data } = await axios.get(`${BASE}/${id}`);
  const result = { name: data.name, type: data.brewery_type, address: data.street, city: data.city, state: data.state, phone: data.phone, website: data.website_url, _cached: false };
  cache.set(cacheKey, result, 86400);
  return result;
}
