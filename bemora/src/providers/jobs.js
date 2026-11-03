import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();

/**
 * Search remote jobs via Remotive's free API (no key needed).
 * Replaces the former Adzuna backend, which required app credentials and
 * always returned 401 in keyless mode.
 * @param {Object} params
 * @param {string} [params.query] - free-text search term (e.g. "developer")
 * @param {string} [params.location] - post-filter on candidate_required_location
 * @param {number} [params.limit=10]
 */
export async function searchJobs({ query, location, limit = 10 } = {}) {
  const cacheKey = `jobs:search:${query}:${location}:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  try {
    const { data } = await http.get('https://remotive.com/api/remote-jobs', {
      params: { search: query, limit: limit * 2 },
    });
    let jobs = (data.jobs || []).map((j) => ({
      title: j.title,
      company: j.company_name,
      location: j.candidate_required_location,
      url: j.url,
      salary: j.salary,
      category: j.category,
      published: j.publication_date,
    }));
    if (location) {
      const needle = location.toLowerCase();
      jobs = jobs.filter((j) => (j.location || '').toLowerCase().includes(needle));
    }
    const result = { query, count: jobs.length, jobs: jobs.slice(0, limit), _cached: false };
    cache.set(cacheKey, result, 3600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'jobs');
  }
}
