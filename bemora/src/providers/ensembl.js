import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();

const BASE = 'https://rest.ensembl.org';

/**
 * Look up an Ensembl gene by symbol.
 * @param {Object} params
 * @param {string} params.symbol - gene symbol
 * @param {string} [params.species='homo_sapiens'] - species name
 * @returns {Promise<Object>} gene details
 */
export async function lookupSymbol({ symbol, species = 'homo_sapiens' } = {}) {
  const cacheKey = `ensembl:lookupSymbol:${species}:${symbol}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(
      `${BASE}/lookup/symbol/${encodeURIComponent(species)}/${encodeURIComponent(symbol)}`,
      { params: { 'content-type': 'application/json' } }
    );
    const result = {
      id: data.id,
      symbol: data.display_name,
      description: data.description,
      biotype: data.biotype,
      chromosome: data.seq_region_name,
      start: data.start,
      end: data.end,
      strand: data.strand,
      _cached: false,
    };
    cache.set(cacheKey, result, 86400);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'ensembl');
  }
}

/**
 * Fetch the sequence for an Ensembl id.
 * @param {Object} params
 * @param {string} params.id - Ensembl id
 * @returns {Promise<Object>} sequence details
 */
export async function sequence({ id } = {}) {
  const cacheKey = `ensembl:sequence:${id}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/sequence/id/${encodeURIComponent(id)}`, {
      params: { 'content-type': 'application/json' },
    });
    const result = {
      id: data.id,
      description: data.desc,
      molecule: data.molecule,
      sequence: data.seq,
      _cached: false,
    };
    cache.set(cacheKey, result, 86400);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'ensembl');
  }
}

/**
 * Fetch cross references for a gene symbol.
 * @param {Object} params
 * @param {string} params.symbol - gene symbol
 * @param {string} [params.species='homo_sapiens'] - species name
 * @returns {Promise<Object>} symbol plus xrefs array
 */
export async function xrefs({ symbol, species = 'homo_sapiens' } = {}) {
  const cacheKey = `ensembl:xrefs:${species}:${symbol}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(
      `${BASE}/xrefs/symbol/${encodeURIComponent(species)}/${encodeURIComponent(symbol)}`,
      { params: { 'content-type': 'application/json' } }
    );
    const result = {
      symbol,
      xrefs: (Array.isArray(data) ? data : []).map((x) => ({
        id: x.id,
        db: x.dbname,
        display: x.display_id,
      })),
      _cached: false,
    };
    cache.set(cacheKey, result, 86400);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'ensembl');
  }
}
