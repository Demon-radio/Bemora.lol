import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();

/**
 * Hipolabs Universities API — free, no key, no signup.
 * https://github.com/Hipo/university-domains-list
 *
 * @param {{ country?: string, name?: string }} params - at least one required
 */
export async function search({ country, name } = {}) {
  if (!country && !name) {
    throw wrapProviderError(new Error('country or name is required'), 'university');
  }
  const cacheKey = `university:${country || ''}:${name || ''}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const params = {};
  if (country) params.country = country;
  if (name) params.name = name;

  let data;
  try {
    ({ data } = await http.get('http://universities.hipolabs.com/search', { params }));
  } catch (err) {
    throw wrapProviderError(err, 'university');
  }

  const result = {
    provider: 'hipolabs',
    count: data.length,
    universities: data.slice(0, 50).map((u) => ({
      name: u.name,
      country: u.country,
      state_province: u['state-province'] || null,
      domains: u.domains,
      web_pages: u.web_pages,
      alpha_two_code: u.alpha_two_code,
    })),
    _cached: false,
  };

  cache.set(cacheKey, result, 86400);
  return result;
}

/**
 * Convenience: universities for a whole country.
 * @param {{ country: string }} params
 */
export async function byCountry({ country }) {
  return search({ country });
}
