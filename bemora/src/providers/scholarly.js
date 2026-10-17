import { httpClient } from '../core/http.js';
import { ValidationError, wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';
import { USER_AGENT } from '../core/headers.js';

const http = httpClient({ headers: { 'User-Agent': USER_AGENT } });

function formatOpenAlexWork(w) {
  const authorships = w.authorships || [];
  return {
    id: w.id,
    doi: w.doi,
    title: w.title,
    year: w.publication_year,
    venue: w.primary_location?.source?.display_name || null,
    authors: authorships.map((a) => a.author?.display_name).filter(Boolean),
    institutions: [
      ...new Set(authorships.flatMap((a) => (a.institutions || []).map((i) => i.display_name).filter(Boolean))),
    ],
    cited_by_count: w.cited_by_count ?? 0,
    topics: (w.topics || [])
      .map((t) => t.display_name)
      .filter(Boolean)
      .slice(0, 5),
    url: w.doi || w.id,
  };
}

/**
 * Search scholarly works on OpenAlex (250M+ works, no key needed).
 * @param {Object} params
 * @param {string} params.query
 * @param {number} [params.limit]
 */
export async function searchWorks({ query, limit = 10 }) {
  if (!query || typeof query !== 'string') {
    throw new ValidationError('[scholarly] searchWorks({ query }) requires a non-empty string.', {
      provider: 'openalex',
    });
  }
  const cacheKey = `scholarly:works:${query}:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  let data;
  try {
    ({ data } = await http.get('https://api.openalex.org/works', {
      params: { search: query, 'per-page': limit },
    }));
  } catch (err) {
    throw wrapProviderError(err, 'openalex');
  }

  const result = {
    query,
    total: data.meta?.count ?? 0,
    works: (data.results || []).map(formatOpenAlexWork),
    _cached: false,
  };
  cache.set(cacheKey, result, 3600);
  return result;
}

/**
 * Get a single OpenAlex work by ID or DOI (no key needed).
 * @param {Object} params
 * @param {string} params.id - OpenAlex ID (W…), DOI, or full DOI URL
 */
export async function getWork({ id }) {
  if (!id || typeof id !== 'string') {
    throw new ValidationError('[scholarly] getWork({ id }) requires an OpenAlex ID or DOI.', {
      provider: 'openalex',
    });
  }
  const clean = id.replace(/^https?:\/\/(dx\.)?doi\.org\//i, '').replace(/^https?:\/\/openalex\.org\//i, '');
  const cacheKey = `scholarly:work:${clean}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  let data;
  try {
    ({ data } = await http.get(`https://api.openalex.org/works/${encodeURIComponent(clean)}`));
  } catch (err) {
    throw wrapProviderError(err, 'openalex');
  }

  const result = { ...formatOpenAlexWork(data), _cached: false };
  cache.set(cacheKey, result, 86400);
  return result;
}

function formatCrossref(m) {
  const authors = (m.author || []).map((a) => [a.given, a.family].filter(Boolean).join(' ')).filter(Boolean);
  return {
    doi: m.DOI,
    title: Array.isArray(m.title) ? m.title[0] : m.title,
    authors,
    venue: Array.isArray(m['container-title']) ? m['container-title'][0] : null,
    year: m.published?.['date-parts']?.[0]?.[0] ?? m.created?.['date-parts']?.[0]?.[0] ?? null,
    publisher: m.publisher || null,
    url: m.URL,
  };
}

/**
 * Search DOI metadata on Crossref (140M+ records, no key needed).
 * @param {Object} params
 * @param {string} params.query
 * @param {number} [params.limit]
 */
export async function crossrefSearch({ query, limit = 10 }) {
  if (!query || typeof query !== 'string') {
    throw new ValidationError('[scholarly] crossrefSearch({ query }) requires a non-empty string.', {
      provider: 'crossref',
    });
  }
  const cacheKey = `scholarly:crossref:${query}:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  let data;
  try {
    ({ data } = await http.get('https://api.crossref.org/works', {
      params: { query, rows: limit },
    }));
  } catch (err) {
    throw wrapProviderError(err, 'crossref');
  }

  const result = {
    query,
    total: data.message?.['total-results'] ?? 0,
    works: (data.message?.items || []).map(formatCrossref),
    _cached: false,
  };
  cache.set(cacheKey, result, 3600);
  return result;
}

/**
 * Get Crossref metadata for one DOI (no key needed).
 * @param {Object} params
 * @param {string} params.doi - e.g. 10.1038/nature12373
 */
export async function doiMetadata({ doi }) {
  if (!doi || typeof doi !== 'string') {
    throw new ValidationError('[scholarly] doiMetadata({ doi }) requires a DOI string.', {
      provider: 'crossref',
    });
  }
  const clean = doi.replace(/^https?:\/\/(dx\.)?doi\.org\//i, '');
  const cacheKey = `scholarly:doi:${clean}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  let data;
  try {
    ({ data } = await http.get(`https://api.crossref.org/works/${encodeURIComponent(clean)}`));
  } catch (err) {
    throw wrapProviderError(err, 'crossref');
  }

  const result = { ...formatCrossref(data.message || {}), _cached: false };
  cache.set(cacheKey, result, 86400);
  return result;
}
