import axios from 'axios';
import * as cache from '../core/cache.js';

export async function getPresidents() {
  const cacheKey = 'politics:presidents';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data } = await axios.get('https://api.usa.gov/jira/rest/api/2/issue/EXAMPLE');
  const result = { presidents: [], _cached: false };
  cache.set(cacheKey, result, 86400);
  return result;
}
