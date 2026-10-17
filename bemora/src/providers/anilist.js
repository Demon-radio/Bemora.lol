import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();

const URL = 'https://graphql.anilist.co';

/**
 * Search anime by title.
 * @param {Object} params
 * @param {string} params.query
 * @param {number} [params.perPage]
 * @returns {Promise<Object>} query plus anime array
 */
export async function search({ query, perPage = 5 } = {}) {
  const cacheKey = `anilist:search:${query}:${perPage}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const gql = 'query ($s:String,$p:Int){Page(perPage:$p){media(search:$s,type:ANIME){id title{romaji english} genres averageScore episodes status}}}';
    const { data } = await http.post(
      URL,
      { query: gql, variables: { s: query, p: perPage } },
      { headers: { 'Content-Type': 'application/json' } }
    );
    const result = {
      query,
      anime: data.data?.Page?.media || [],
      _cached: false,
    };
    cache.set(cacheKey, result, 3600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'anilist');
  }
}

/**
 * Fetch a single anime by id.
 * @param {Object} params
 * @param {string|number} params.id
 * @returns {Promise<Object>} id plus anime object
 */
export async function anime({ id } = {}) {
  const cacheKey = `anilist:anime:${id}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const gql = 'query ($id:Int){Media(id:$id,type:ANIME){id title{romaji english native} genres description averageScore episodes duration status seasonYear coverImage{large} siteUrl}}';
    const { data } = await http.post(
      URL,
      { query: gql, variables: { id: Number(id) } },
      { headers: { 'Content-Type': 'application/json' } }
    );
    const result = {
      id,
      anime: data.data?.Media || null,
      _cached: false,
    };
    cache.set(cacheKey, result, 3600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'anilist');
  }
}

/**
 * Search manga by title.
 * @param {Object} params
 * @param {string} params.query
 * @param {number} [params.perPage]
 * @returns {Promise<Object>} query plus manga array
 */
export async function manga({ query, perPage = 5 } = {}) {
  const cacheKey = `anilist:manga:${query}:${perPage}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const gql = 'query ($s:String,$p:Int){Page(perPage:$p){media(search:$s,type:MANGA){id title{romaji english} genres averageScore chapters status}}}';
    const { data } = await http.post(
      URL,
      { query: gql, variables: { s: query, p: perPage } },
      { headers: { 'Content-Type': 'application/json' } }
    );
    const result = {
      query,
      manga: data.data?.Page?.media || [],
      _cached: false,
    };
    cache.set(cacheKey, result, 3600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'anilist');
  }
}

/**
 * Search characters by name.
 * @param {Object} params
 * @param {string} params.query
 * @param {number} [params.perPage]
 * @returns {Promise<Object>} query plus characters array
 */
export async function character({ query, perPage = 5 } = {}) {
  const cacheKey = `anilist:character:${query}:${perPage}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const gql = 'query ($s:String,$p:Int){Page(perPage:$p){characters(search:$s){id name{full native} image{medium}}}}';
    const { data } = await http.post(
      URL,
      { query: gql, variables: { s: query, p: perPage } },
      { headers: { 'Content-Type': 'application/json' } }
    );
    const result = {
      query,
      characters: data.data?.Page?.characters || [],
      _cached: false,
    };
    cache.set(cacheKey, result, 3600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'anilist');
  }
}
