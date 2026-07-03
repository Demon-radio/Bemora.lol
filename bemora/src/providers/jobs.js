import axios from 'axios';
import * as cache from '../core/cache.js';

export async function searchJobs({ query, location, limit = 10 }) {
  const cacheKey = `jobs:search:${query}:${location}:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data } = await axios.get('https://api.adzuna.com/v1/api/jobs/us/search/1', {
    params: { app_id: 'test', app_key: 'test', what: query, where: location, results_per_page: limit },
  });
  const result = { jobs: data.results || [], _cached: false };
  cache.set(cacheKey, result, 3600);
  return result;
}
