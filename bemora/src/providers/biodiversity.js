import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();

/**
 * Search species in the Global Biodiversity Information Facility (no key needed).
 * @param {Object} params
 * @param {string} params.query
 * @param {number} [params.limit]
 */
export async function searchSpecies({ query, limit = 10 }) {
  const cacheKey = `biodiversity:species:${query}:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  let data;
  try {
    ({ data } = await http.get('https://api.gbif.org/v1/species/search', {
      params: { q: query, limit },
    }));
  } catch (err) {
    throw wrapProviderError(err, 'biodiversity');
  }

  const result = {
    query,
    count: data.count,
    species: (data.results || []).map((s) => ({
      key: s.key,
      scientificName: s.scientificName,
      canonicalName: s.canonicalName,
      kingdom: s.kingdom,
      family: s.family,
      rank: s.rank,
      status: s.taxonomicStatus,
    })),
    _cached: false,
  };

  cache.set(cacheKey, result, 86400);
  return result;
}

/**
 * Recent occurrence records (sightings) for a species, optionally filtered by country.
 * @param {Object} params
 * @param {string} params.species - scientific or common name
 * @param {string} [params.country] - ISO 3166-1 alpha-2 code, e.g. 'US'
 * @param {number} [params.limit]
 */
export async function occurrences({ species, country, limit = 10 }) {
  const cacheKey = `biodiversity:occurrences:${species}:${country}:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const params = { q: species, limit };
  if (country) params.country = country;

  let data;
  try {
    ({ data } = await http.get('https://api.gbif.org/v1/occurrence/search', { params }));
  } catch (err) {
    throw wrapProviderError(err, 'biodiversity');
  }

  const result = {
    species,
    count: data.count,
    occurrences: (data.results || []).map((o) => ({
      species: o.species || o.scientificName,
      country: o.country,
      locality: o.locality,
      lat: o.decimalLatitude,
      lon: o.decimalLongitude,
      date: o.eventDate,
      recordedBy: o.recordedBy,
    })),
    _cached: false,
  };

  cache.set(cacheKey, result, 3600);
  return result;
}
