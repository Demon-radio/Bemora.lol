import axios from 'axios';
import * as cache from '../core/cache.js';

export async function searchTVShows({ query, apiKey }) {
  const cacheKey = `tv:search:${query}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data } = await axios.get('https://api.themoviedb.org/3/search/tv', {
    params: { api_key: apiKey, query },
  });
  const result = { shows: data.results, _cached: false };
  cache.set(cacheKey, result, 3600);
  return result;
}

export async function getTVShowDetails({ id, apiKey }) {
  const { data } = await axios.get(`https://api.themoviedb.org/3/tv/${id}`, {
    params: { api_key: apiKey },
  });
  return { show: data };
}

export async function getTrendingTV({ apiKey }) {
  const cacheKey = 'tv:trending';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data } = await axios.get('https://api.themoviedb.org/3/trending/tv/week', {
    params: { api_key: apiKey },
  });
  const result = { shows: data.results, _cached: false };
  cache.set(cacheKey, result, 3600);
  return result;
}
