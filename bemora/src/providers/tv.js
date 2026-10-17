import * as cache from '../core/cache.js';
import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';

const http = httpClient();

export async function searchTVShows({ query, apiKey }) {
  const cacheKey = `tv:search:${query}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  try {
    const { data } = await http.get('https://api.themoviedb.org/3/search/tv', {
      params: { api_key: apiKey, query },
    });
    const result = { shows: data.results, _cached: false };
    cache.set(cacheKey, result, 3600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'tv');
  }
}

export async function getTVShowDetails({ id, apiKey }) {
  try {
    const { data } = await http.get(`https://api.themoviedb.org/3/tv/${id}`, {
      params: { api_key: apiKey },
    });
    return { show: data };
  } catch (err) {
    throw wrapProviderError(err, 'tv');
  }
}

export async function getTrendingTV({ apiKey }) {
  const cacheKey = 'tv:trending';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  try {
    const { data } = await http.get('https://api.themoviedb.org/3/trending/tv/week', {
      params: { api_key: apiKey },
    });
    const result = { shows: data.results, _cached: false };
    cache.set(cacheKey, result, 3600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'tv');
  }
}
