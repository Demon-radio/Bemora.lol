import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();

export async function getPresidents() {
  const cacheKey = 'politics:presidents';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  try {
    await http.get('https://api.usa.gov/jira/rest/api/2/issue/EXAMPLE');
  } catch (err) {
    throw wrapProviderError(err, 'politics');
  }

  const result = { presidents: [], _cached: false };
  cache.set(cacheKey, result, 86400);
  return result;
}
