import axios from 'axios';
import * as cache from '../core/cache.js';

const BASE = 'https://api.jikan.moe/v4';

/**
 * Search anime (Jikan/MyAnimeList — Free, no key)
 * @param {{ query: string, limit?: number, page?: number, orderBy?: string, type?: string }} params
 */
export async function searchAnime({ query, limit = 10, page = 1, type, orderBy = 'score' }) {
  const cacheKey = `anime:search:${query}:${limit}:${page}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const params = { q: query, limit, page, order_by: orderBy };
  if (type) params.type = type;

  const { data } = await axios.get(`${BASE}/anime`, { params });

  const result = {
    total: data.pagination?.items?.total,
    page: data.pagination?.current_page,
    anime: data.data.map(formatAnime),
    _cached: false,
  };

  cache.set(cacheKey, result, 3600);
  return result;
}

/**
 * Get anime by MAL ID
 * @param {{ id: number }} params
 */
export async function getAnime({ id }) {
  const cacheKey = `anime:detail:${id}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data } = await axios.get(`${BASE}/anime/${id}/full`);

  const result = {
    ...formatAnime(data.data),
    synopsis: data.data.synopsis,
    background: data.data.background,
    studios: data.data.studios?.map((s) => s.name),
    genres: data.data.genres?.map((g) => g.name),
    trailer: data.data.trailer?.url,
    streaming: data.data.streaming?.map((s) => ({ name: s.name, url: s.url })),
    _cached: false,
  };

  cache.set(cacheKey, result, 86400);
  return result;
}

/**
 * Get top anime (all time or by season)
 * @param {{ limit?: number, type?: string, filter?: 'airing'|'upcoming'|'bypopularity' }} params
 */
export async function topAnime({ limit = 20, type, filter } = {}) {
  const cacheKey = `anime:top:${type}:${filter}:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const params = { limit };
  if (type) params.type = type;
  if (filter) params.filter = filter;

  const { data } = await axios.get(`${BASE}/top/anime`, { params });

  const result = { anime: data.data.map(formatAnime), _cached: false };
  cache.set(cacheKey, result, 3600);
  return result;
}

/**
 * Get current season anime
 */
export async function currentSeason() {
  const cacheKey = 'anime:season:current';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data } = await axios.get(`${BASE}/seasons/now`);
  const result = { anime: data.data.map(formatAnime), _cached: false };
  cache.set(cacheKey, result, 3600);
  return result;
}

/**
 * Get random anime
 */
export async function randomAnime() {
  const { data } = await axios.get(`${BASE}/random/anime`);
  return { anime: formatAnime(data.data), _cached: false };
}

/**
 * Search manga
 * @param {{ query: string, limit?: number }} params
 */
export async function searchManga({ query, limit = 10 }) {
  const cacheKey = `anime:manga:${query}:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data } = await axios.get(`${BASE}/manga`, { params: { q: query, limit } });

  const result = {
    manga: data.data.map((m) => ({
      id: m.mal_id,
      title: m.title,
      title_english: m.title_english,
      type: m.type,
      chapters: m.chapters,
      volumes: m.volumes,
      status: m.status,
      score: m.score,
      rank: m.rank,
      synopsis: m.synopsis?.slice(0, 200),
      image: m.images?.jpg?.image_url,
    })),
    _cached: false,
  };

  cache.set(cacheKey, result, 3600);
  return result;
}

function formatAnime(a) {
  return {
    id: a.mal_id,
    title: a.title,
    title_english: a.title_english,
    title_arabic: a.title_synonyms?.find((s) => /[\u0600-\u06FF]/.test(s)),
    type: a.type,
    episodes: a.episodes,
    status: a.status,
    score: a.score,
    rank: a.rank,
    popularity: a.popularity,
    rating: a.rating,
    image: a.images?.jpg?.large_image_url || a.images?.jpg?.image_url,
    year: a.year,
    season: a.season,
    url: a.url,
  };
}
