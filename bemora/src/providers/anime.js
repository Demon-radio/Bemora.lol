import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();
const BASE = 'https://api.jikan.moe/v4';
const QUOTE_BASE = 'https://api.animechan.io/v1';
const QUOTE_FALLBACK = 'https://yurippe.vercel.app/api/quotes';

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

  try {
    const { data } = await http.get(`${BASE}/anime`, { params });

    const result = {
      total: data.pagination?.items?.total,
      page: data.pagination?.current_page,
      anime: data.data.map(formatAnime),
      _cached: false,
    };

    cache.set(cacheKey, result, 3600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'anime');
  }
}

/**
 * Get full anime details — history, background, studios, genres, trailer, streaming, rank, score
 * @param {{ id: number }} params
 */
export async function getAnime({ id }) {
  const cacheKey = `anime:detail:${id}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  try {
    const { data } = await http.get(`${BASE}/anime/${id}/full`);

    const result = {
      ...formatAnime(data.data),
      synopsis: data.data.synopsis,
      background: data.data.background,
      studios: data.data.studios?.map((s) => s.name),
      producers: data.data.producers?.map((p) => p.name),
      genres: data.data.genres?.map((g) => g.name),
      themes: data.data.themes?.map((t) => t.name),
      demographics: data.data.demographics?.map((d) => d.name),
      duration: data.data.duration,
      source: data.data.source,
      broadcast: data.data.broadcast?.string,
      aired: data.data.aired?.string,
      trailer: data.data.trailer?.url,
      streaming: data.data.streaming?.map((s) => ({ name: s.name, url: s.url })),
      relations: data.data.relations?.map((r) => ({ relation: r.relation, entries: r.entry?.map((e) => e.name) })),
      _cached: false,
    };

    cache.set(cacheKey, result, 86400);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'anime');
  }
}

/**
 * Get the full episode list for an anime (title, aired date, filler/recap flags, score)
 * @param {{ id: number, page?: number }} params
 */
export async function getEpisodes({ id, page = 1 }) {
  const cacheKey = `anime:episodes:${id}:${page}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  try {
    const { data } = await http.get(`${BASE}/anime/${id}/episodes`, { params: { page } });

    const result = {
      totalEpisodes: data.pagination?.items?.total,
      hasNextPage: data.pagination?.has_next_page,
      episodes: (data.data || []).map((e) => ({
        number: e.mal_id,
        title: e.title,
        titleJapanese: e.title_japanese,
        titleRomanji: e.title_romanji,
        aired: e.aired,
        score: e.score,
        filler: e.filler,
        recap: e.recap,
        url: e.url,
      })),
      _cached: false,
    };

    cache.set(cacheKey, result, 21600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'anime');
  }
}

/**
 * Get one specific episode's details
 * @param {{ id: number, episode: number }} params
 */
export async function getEpisode({ id, episode }) {
  try {
    const { data } = await http.get(`${BASE}/anime/${id}/episodes/${episode}`);
    const e = data.data;
    return {
      number: e.mal_id,
      title: e.title,
      titleJapanese: e.title_japanese,
      titleRomanji: e.title_romanji,
      duration: e.duration,
      aired: e.aired,
      filler: e.filler,
      recap: e.recap,
      synopsis: e.synopsis,
      forumUrl: e.forum_url,
    };
  } catch (err) {
    throw wrapProviderError(err, 'anime');
  }
}

/**
 * Get the full character roster for an anime
 * @param {{ id: number }} params
 */
export async function getCharacters({ id }) {
  const cacheKey = `anime:characters:${id}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  try {
    const { data } = await http.get(`${BASE}/anime/${id}/characters`);

    const result = {
      count: data.data?.length || 0,
      characters: (data.data || []).slice(0, 30).map((c) => ({
        id: c.character?.mal_id,
        name: c.character?.name,
        image: c.character?.images?.jpg?.image_url,
        role: c.role,
        voiceActors: c.voice_actors?.slice(0, 3).map((v) => ({ name: v.person?.name, language: v.language })),
      })),
      _cached: false,
    };

    cache.set(cacheKey, result, 86400);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'anime');
  }
}

/**
 * Get full details on a single character (bio, images, animeography, voice actors)
 * @param {{ id: number }} params
 */
export async function getCharacter({ id }) {
  const cacheKey = `anime:character:${id}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  try {
    const { data } = await http.get(`${BASE}/characters/${id}/full`);
    const c = data.data;

    const result = {
      id: c.mal_id,
      name: c.name,
      nameKanji: c.name_kanji,
      nicknames: c.nicknames,
      favorites: c.favorites,
      about: c.about,
      image: c.images?.jpg?.image_url,
      animeography: c.anime?.map((a) => ({ title: a.anime?.title, role: a.role })),
      voiceActors: c.voices?.slice(0, 10).map((v) => ({ name: v.person?.name, language: v.language })),
      _cached: false,
    };

    cache.set(cacheKey, result, 86400);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'anime');
  }
}

/**
 * Get promotional videos, trailers, and music videos for an anime
 * @param {{ id: number }} params
 */
export async function getVideos({ id }) {
  try {
    const { data } = await http.get(`${BASE}/anime/${id}/videos`);
    const v = data.data || {};
    return {
      promos: (v.promo || []).map((p) => ({ title: p.title, trailer: p.trailer?.embed_url, image: p.trailer?.images?.medium_image_url })),
      episodes: (v.episodes || []).slice(0, 20).map((e) => ({ title: e.title, episode: e.episode, image: e.images?.image_url, url: e.url })),
      musicVideos: (v.music_videos || []).map((m) => ({ title: m.title, video: m.video?.embed_url })),
    };
  } catch (err) {
    throw wrapProviderError(err, 'anime');
  }
}

/**
 * Get all cover art / promo pictures for an anime
 * @param {{ id: number }} params
 */
export async function getPictures({ id }) {
  try {
    const { data } = await http.get(`${BASE}/anime/${id}/pictures`);
    return {
      count: data.data?.length || 0,
      pictures: (data.data || []).map((p) => p.jpg?.large_image_url || p.jpg?.image_url),
    };
  } catch (err) {
    throw wrapProviderError(err, 'anime');
  }
}

/**
 * Get similar/recommended anime for a given title
 * @param {{ id: number }} params
 */
export async function getRecommendations({ id }) {
  try {
    const { data } = await http.get(`${BASE}/anime/${id}/recommendations`);
    return {
      count: data.data?.length || 0,
      recommendations: (data.data || []).slice(0, 15).map((r) => ({
        id: r.entry?.mal_id,
        title: r.entry?.title,
        image: r.entry?.images?.jpg?.image_url,
        votes: r.votes,
      })),
    };
  } catch (err) {
    throw wrapProviderError(err, 'anime');
  }
}

/**
 * Get news articles related to an anime
 * @param {{ id: number }} params
 */
export async function getNews({ id }) {
  try {
    const { data } = await http.get(`${BASE}/anime/${id}/news`);
    return {
      count: data.data?.length || 0,
      news: (data.data || []).slice(0, 10).map((n) => ({
        title: n.title,
        date: n.date,
        excerpt: n.excerpt,
        image: n.images?.jpg?.image_url,
        url: n.url,
        author: n.author_username,
        comments: n.comments,
      })),
    };
  } catch (err) {
    throw wrapProviderError(err, 'anime');
  }
}

/**
 * Get a random anime quote — by anime title, or a random one
 * @param {{ anime?: string }} params
 */
export async function getQuote({ anime } = {}) {
  try {
    const url = anime ? `${QUOTE_BASE}/quotes/random?anime=${encodeURIComponent(anime)}` : `${QUOTE_BASE}/quotes/random`;
    const { data } = await http.get(url);
    const q = data?.data || data;
    return {
      source: 'animechan',
      quote: q.content || q.quote,
      character: q.character?.name || q.character,
      anime: q.anime?.name || q.show,
    };
  } catch (err) {
    const params = anime ? { title: anime } : {};
    try {
      const { data } = await http.get(QUOTE_FALLBACK, { params });
      const q = Array.isArray(data) ? data[Math.floor(Math.random() * data.length)] : data;
      if (!q) throw new Error('No quotes found');
      return {
        source: 'yurippe',
        quote: q.quote,
        character: q.character,
        anime: q.show,
      };
    } catch (fallbackErr) {
      throw wrapProviderError(fallbackErr, 'anime');
    }
  }
}

/**
 * Search for anime quotes by character name
 * @param {{ character: string }} params
 */
export async function getQuotesByCharacter({ character }) {
  try {
    const { data } = await http.get(QUOTE_FALLBACK, { params: { character } });
    return {
      count: Array.isArray(data) ? data.length : 0,
      quotes: (Array.isArray(data) ? data : []).slice(0, 20).map((q) => ({
        quote: q.quote,
        character: q.character,
        anime: q.show,
      })),
    };
  } catch (err) {
    throw wrapProviderError(err, 'anime');
  }
}

/**
 * Get top anime (all time or filtered by airing/upcoming/popularity)
 * @param {{ limit?: number, type?: string, filter?: 'airing'|'upcoming'|'bypopularity' }} params
 */
export async function topAnime({ limit = 20, type, filter } = {}) {
  const cacheKey = `anime:top:${type}:${filter}:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const params = { limit };
  if (type) params.type = type;
  if (filter) params.filter = filter;

  try {
    const { data } = await http.get(`${BASE}/top/anime`, { params });

    const result = { anime: data.data.map(formatAnime), _cached: false };
    cache.set(cacheKey, result, 3600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'anime');
  }
}

/**
 * Get current season anime
 */
export async function currentSeason() {
  const cacheKey = 'anime:season:current';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  try {
    const { data } = await http.get(`${BASE}/seasons/now`);
    const result = { anime: data.data.map(formatAnime), _cached: false };
    cache.set(cacheKey, result, 3600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'anime');
  }
}

/**
 * Get a random anime (with full detail)
 */
export async function randomAnime() {
  try {
    const { data } = await http.get(`${BASE}/random/anime`);
    return { anime: formatAnime(data.data), _cached: false };
  } catch (err) {
    throw wrapProviderError(err, 'anime');
  }
}

/**
 * Search manga
 * @param {{ query: string, limit?: number }} params
 */
export async function searchManga({ query, limit = 10 }) {
  const cacheKey = `anime:manga:${query}:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  try {
    const { data } = await http.get(`${BASE}/manga`, { params: { q: query, limit } });

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
  } catch (err) {
    throw wrapProviderError(err, 'anime');
  }
}

/**
 * Get full manga details (chapters, volumes, authors, genres, background)
 * @param {{ id: number }} params
 */
export async function getManga({ id }) {
  const cacheKey = `anime:manga:detail:${id}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  try {
    const { data } = await http.get(`${BASE}/manga/${id}/full`);
    const m = data.data;

    const result = {
      id: m.mal_id,
      title: m.title,
      titleEnglish: m.title_english,
      type: m.type,
      chapters: m.chapters,
      volumes: m.volumes,
      status: m.status,
      published: m.published?.string,
      score: m.score,
      rank: m.rank,
      popularity: m.popularity,
      synopsis: m.synopsis,
      background: m.background,
      authors: m.authors?.map((a) => a.name),
      genres: m.genres?.map((g) => g.name),
      image: m.images?.jpg?.large_image_url,
      _cached: false,
    };

    cache.set(cacheKey, result, 86400);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'anime');
  }
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
