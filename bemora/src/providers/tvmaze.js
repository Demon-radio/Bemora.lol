import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();

const BASE = 'https://api.tvmaze.com';

/**
 * Search TV shows by name.
 * @param {Object} params
 * @param {string} params.query
 * @returns {Promise<Object>} query plus shows array
 */
export async function search({ query } = {}) {
  const cacheKey = `tvmaze:search:${query}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/search/shows`, { params: { q: query } });
    const result = {
      query,
      shows: (Array.isArray(data) ? data : []).map((r) => ({
        id: r.show?.id,
        name: r.show?.name,
        genres: r.show?.genres,
        rating: r.show?.rating?.average,
        premiered: r.show?.premiered,
        image: r.show?.image?.medium,
        summary: r.show?.summary,
      })),
      _cached: false,
    };
    cache.set(cacheKey, result, 3600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'tvmaze');
  }
}

/**
 * Fetch a TV show by id.
 * @param {Object} params
 * @param {string|number} params.id
 * @returns {Promise<Object>} normalized show
 */
export async function show({ id } = {}) {
  const cacheKey = `tvmaze:show:${id}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/shows/${encodeURIComponent(id)}`);
    const result = {
      id: data.id,
      name: data.name,
      type: data.type,
      language: data.language,
      genres: data.genres,
      status: data.status,
      runtime: data.runtime,
      premiered: data.premiered,
      rating: data.rating?.average,
      network: data.network?.name,
      summary: data.summary,
      _cached: false,
    };
    cache.set(cacheKey, result, 3600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'tvmaze');
  }
}

/**
 * Fetch all episodes for a show.
 * @param {Object} params
 * @param {string|number} params.id
 * @returns {Promise<Object>} id plus episodes array
 */
export async function episodes({ id } = {}) {
  const cacheKey = `tvmaze:episodes:${id}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/shows/${encodeURIComponent(id)}/episodes`);
    const result = {
      id,
      episodes: (Array.isArray(data) ? data : []).map((e) => ({
        id: e.id,
        name: e.name,
        season: e.season,
        number: e.number,
        airdate: e.airdate,
        runtime: e.runtime,
      })),
      _cached: false,
    };
    cache.set(cacheKey, result, 3600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'tvmaze');
  }
}

/**
 * Fetch the broadcast schedule for a country and date.
 * @param {Object} params
 * @param {string} [params.country]
 * @param {string} [params.date]
 * @returns {Promise<Object>} country plus entries array
 */
export async function schedule({ country = 'US', date } = {}) {
  const cacheKey = `tvmaze:schedule:${country}:${date}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/schedule`, { params: { country, date } });
    const result = {
      country,
      entries: (Array.isArray(data) ? data : []).map((e) => ({
        airdate: e.airdate,
        show: e.show?.name,
        season: e.season,
        number: e.number,
        name: e.name,
      })),
      _cached: false,
    };
    cache.set(cacheKey, result, 1800);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'tvmaze');
  }
}

/**
 * Search people by name.
 * @param {Object} params
 * @param {string} params.query
 * @returns {Promise<Object>} query plus people array
 */
export async function people({ query } = {}) {
  const cacheKey = `tvmaze:people:${query}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/search/people`, { params: { q: query } });
    const result = {
      query,
      people: (Array.isArray(data) ? data : []).map((r) => ({
        id: r.person?.id,
        name: r.person?.name,
        country: r.person?.country?.name,
        image: r.person?.image?.medium,
      })),
      _cached: false,
    };
    cache.set(cacheKey, result, 3600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'tvmaze');
  }
}
