import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();

export async function predictNationality({ name }) {
  const cacheKey = `predict:nationality:${name}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  let data;
  try {
    ({ data } = await http.get('https://api.nationalize.io', { params: { name } }));
  } catch (err) {
    throw wrapProviderError(err, 'predict');
  }

  const result = { name: data.name, countries: data.country?.map((c) => ({ country_id: c.country_id, probability: c.probability })), _cached: false };
  cache.set(cacheKey, result, 86400);
  return result;
}

export async function predictGender({ name }) {
  const cacheKey = `predict:gender:${name}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  let data;
  try {
    ({ data } = await http.get('https://api.genderize.io', { params: { name } }));
  } catch (err) {
    throw wrapProviderError(err, 'predict');
  }

  const result = { name: data.name, gender: data.gender, probability: data.probability, count: data.count, _cached: false };
  cache.set(cacheKey, result, 86400);
  return result;
}

export async function predictAge({ name }) {
  const cacheKey = `predict:age:${name}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  let data;
  try {
    ({ data } = await http.get('https://api.agify.io', { params: { name } }));
  } catch (err) {
    throw wrapProviderError(err, 'predict');
  }

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
