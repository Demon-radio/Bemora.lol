import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();

const BASE = 'https://rest.uniprot.org';

/**
 * Search UniProt entries.
 * @param {Object} params
 * @param {string} params.query - UniProt search query
 * @param {number} [params.size=5] - max number of results
 * @returns {Promise<Object>} query plus results array
 */
export async function search({ query, size = 5 } = {}) {
  const cacheKey = `uniprot:search:${query}:${size}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/uniprotkb/search`, {
      params: { query, size, format: 'json' },
    });
    const result = {
      query,
      results: (data.results || []).map((r) => ({
        accession: r.primaryAccession,
        id: r.uniProtkbId,
        protein: r.proteinDescription?.recommendedName?.fullName?.value,
        organism: r.organism?.scientificName,
        length: r.sequence?.length,
      })),
      _cached: false,
    };
    cache.set(cacheKey, result, 86400);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'uniprot');
  }
}

/**
 * Fetch a single UniProt entry by accession.
 * @param {Object} params
 * @param {string} params.accession - UniProt accession
 * @returns {Promise<Object>} entry details
 */
export async function entry({ accession } = {}) {
  const cacheKey = `uniprot:entry:${accession}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/uniprotkb/${encodeURIComponent(accession)}.json`);
    const result = {
      accession: data.primaryAccession,
      id: data.uniProtkbId,
      protein: data.proteinDescription?.recommendedName?.fullName?.value,
      organism: data.organism?.scientificName,
      length: data.sequence?.length,
      sequence: data.sequence?.value,
      _cached: false,
    };
    cache.set(cacheKey, result, 86400);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'uniprot');
  }
}
