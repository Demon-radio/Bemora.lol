import axios from 'axios';
import * as cache from '../core/cache.js';

export async function predictNationality({ name }) {
  const cacheKey = `predict:nationality:${name}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  const { data } = await axios.get('https://api.nationalize.io', { params: { name } });
  const result = { name: data.name, countries: data.country?.map((c) => ({ country_id: c.country_id, probability: c.probability })), _cached: false };
  cache.set(cacheKey, result, 86400);
  return result;
}

export async function predictGender({ name }) {
  const cacheKey = `predict:gender:${name}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  const { data } = await axios.get('https://api.genderize.io', { params: { name } });
  const result = { name: data.name, gender: data.gender, probability: data.probability, count: data.count, _cached: false };
  cache.set(cacheKey, result, 86400);
  return result;
}

export async function predictAge({ name }) {
  const cacheKey = `predict:age:${name}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  const { data } = await axios.get('https://api.agify.io', { params: { name } });
  const result = { name: data.name, age: data.age, count: data.count, _cached: false };
  cache.set(cacheKey, result, 86400);
  return result;
}

export async function predictAll({ name }) {
  const [nationality, gender, age] = await Promise.all([
    predictNationality({ name }).catch(() => null),
    predictGender({ name }).catch(() => null),
    predictAge({ name }).catch(() => null),
  ]);
  return { name, nationality, gender, age };
}
