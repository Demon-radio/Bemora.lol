import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const BASE = 'https://api.themoviedb.org/3';
const IMG = 'https://image.tmdb.org/t/p/w500';

function client(apiKey) {
  return httpClient({
    headers: {},
  });
}

/**
 * Search movies (TMDB free key)
 * @param {{ query: string, year?: number, page?: number }} params
 * @param {string} apiKey - TMDB API key (free at themoviedb.org)
 */
export async function searchMovies({ query, year, page = 1 }, apiKey) {
  const cacheKey = `movies:search:${query}:${year}:${page}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const http = httpClient();
  let data;
  try {
    ({ data } = await http.get(`${BASE}/search/movie`, { params: { api_key: apiKey, query, year, page } }));
  } catch (err) {
    throw wrapProviderError(err, 'movies');
  }

  const result = {
    total: data.total_results,
    page: data.page,
    movies: data.results.map(formatMovie),
    _cached: false,
  };

  cache.set(cacheKey, result, 3600);
  return result;
}

/**
 * Get movie details by TMDB ID
 * @param {{ id: number }} params
 * @param {string} apiKey
 */
export async function getMovie({ id }, apiKey) {
  const cacheKey = `movies:detail:${id}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const http = httpClient();
  let data;
  try {
    ({ data } = await http.get(`${BASE}/movie/${id}`, { params: { api_key: apiKey, append_to_response: 'credits,videos' } }));
  } catch (err) {
    throw wrapProviderError(err, 'movies');
  }

  const result = {
    id: data.id,
    title: data.title,
    original_title: data.original_title,
    tagline: data.tagline,
    overview: data.overview,
    release_date: data.release_date,
    runtime: data.runtime,
    genres: data.genres?.map((g) => g.name),
    rating: data.vote_average,
    votes: data.vote_count,
    popularity: data.popularity,
    budget: data.budget,
    revenue: data.revenue,
    poster: data.poster_path ? `${IMG}${data.poster_path}` : null,
    backdrop: data.backdrop_path ? `${IMG}${data.backdrop_path}` : null,
    homepage: data.homepage,
    imdb_id: data.imdb_id,
    trailer: data.videos?.results?.find((v) => v.type === 'Trailer')
      ? `https://youtube.com/watch?v=${data.videos.results.find((v) => v.type === 'Trailer').key}`
      : null,
    cast: data.credits?.cast?.slice(0, 10).map((a) => ({
      name: a.name,
      character: a.character,
      photo: a.profile_path ? `${IMG}${a.profile_path}` : null,
    })),
    _cached: false,
  };

  cache.set(cacheKey, result, 86400);
  return result;
}

/**
 * Get trending movies (week or day)
 * @param {{ window?: 'week'|'day' }} params
 * @param {string} apiKey
 */
export async function getTrending({ window = 'week' } = {}, apiKey) {
  const cacheKey = `movies:trending:${window}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const http = httpClient();
  let data;
  try {
    ({ data } = await http.get(`${BASE}/trending/movie/${window}`, { params: { api_key: apiKey } }));
  } catch (err) {
    throw wrapProviderError(err, 'movies');
  }

  const result = { movies: data.results.map(formatMovie), _cached: false };
  cache.set(cacheKey, result, 3600);
  return result;
}

/**
 * Search TV shows
 * @param {{ query: string, page?: number }} params
 * @param {string} apiKey
 */
export async function searchTV({ query, page = 1 }, apiKey) {
  const cacheKey = `tv:search:${query}:${page}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const http = httpClient();
  let data;
  try {
    ({ data } = await http.get(`${BASE}/search/tv`, { params: { api_key: apiKey, query, page } }));
  } catch (err) {
    throw wrapProviderError(err, 'movies');
  }

  const result = {
    total: data.total_results,
    shows: data.results.map((s) => ({
      id: s.id, name: s.name,
      overview: s.overview?.slice(0, 200),
      first_air_date: s.first_air_date,
      rating: s.vote_average,
      poster: s.poster_path ? `${IMG}${s.poster_path}` : null,
    })),
    _cached: false,
  };

  cache.set(cacheKey, result, 3600);
  return result;
}

function formatMovie(m) {
  return {
    id: m.id, title: m.title,
    overview: m.overview?.slice(0, 200),
    release_date: m.release_date,
    rating: m.vote_average,
    poster: m.poster_path ? `${IMG}${m.poster_path}` : null,
    genre_ids: m.genre_ids,
    popularity: m.popularity,
  };
}
