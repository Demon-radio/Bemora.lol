import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();

const BASE = 'https://ghibliapi.vercel.app';

/**
 * Fetch all Studio Ghibli films.
 * @returns {Promise<Object>} films array
 */
export async function films() {
  const cacheKey = 'ghibli:films';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/films`);
    const result = {
      films: (Array.isArray(data) ? data : []).map((f) => ({
        id: f.id,
        title: f.title,
        originalTitle: f.original_title,
        director: f.director,
        producer: f.producer,
        releaseDate: f.release_date,
        score: f.rt_score,
        description: f.description,
      })),
      _cached: false,
    };
    cache.set(cacheKey, result, 86400);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'ghibli');
  }
}

/**
 * Fetch a Studio Ghibli film by id.
 * @param {Object} params
 * @param {string} params.id
 * @returns {Promise<Object>} normalized film
 */
export async function film({ id } = {}) {
  const cacheKey = `ghibli:film:${id}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/films/${encodeURIComponent(id)}`);
    const result = {
      id: data.id,
      title: data.title,
      originalTitle: data.original_title,
      director: data.director,
      producer: data.producer,
      releaseDate: data.release_date,
      score: data.rt_score,
      description: data.description,
      _cached: false,
    };
    cache.set(cacheKey, result, 86400);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'ghibli');
  }
}

/**
 * Fetch all Studio Ghibli people.
 * @returns {Promise<Object>} people array
 */
export async function people() {
  const cacheKey = 'ghibli:people';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/people`);
    const result = {
      people: (Array.isArray(data) ? data : []).map((p) => ({
        id: p.id,
        name: p.name,
        gender: p.gender,
        age: p.age,
      })),
      _cached: false,
    };
    cache.set(cacheKey, result, 86400);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'ghibli');
  }
}
