import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();

const BASE = 'https://exoplanetarchive.ipac.caltech.edu/TAP';

/**
 * Fetch a list of planets from the NASA Exoplanet Archive.
 * @param {Object} params
 * @param {number} [params.limit=10] - max number of planets
 * @returns {Promise<Object>} planets array
 */
export async function planets({ limit = 10 } = {}) {
  const cacheKey = `nasa-exoplanet:planets:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/sync`, {
      params: {
        query: `select top ${limit} pl_name,hostname,disc_year,discoverymethod,pl_orbper,pl_rade,pl_bmasse from ps`,
        format: 'json',
      },
    });
    const result = {
      planets: (Array.isArray(data) ? data : []).map((p) => ({
        name: p.pl_name,
        host: p.hostname,
        year: p.disc_year,
        method: p.discoverymethod,
        period: p.pl_orbper,
        radiusEarth: p.pl_rade,
        massEarth: p.pl_bmasse,
      })),
      _cached: false,
    };
    cache.set(cacheKey, result, 3600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'nasa-exoplanet');
  }
}

/**
 * Fetch a single planet by name from the NASA Exoplanet Archive.
 * @param {Object} params
 * @param {string} params.name - planet name
 * @returns {Promise<Object>} name plus planet record
 */
export async function planet({ name } = {}) {
  const cacheKey = `nasa-exoplanet:planet:${name}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/sync`, {
      params: {
        query: `select pl_name,hostname,disc_year,discoverymethod,pl_orbper,pl_rade,pl_bmasse from ps where pl_name='${name}'`,
        format: 'json',
      },
    });
    const result = {
      name,
      planet: (Array.isArray(data) ? data[0] : null) ?? null,
      _cached: false,
    };
    cache.set(cacheKey, result, 86400);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'nasa-exoplanet');
  }
}

/**
 * Run a raw ADQL query against the NASA Exoplanet Archive.
 * @param {Object} params
 * @param {string} params.adql - ADQL query
 * @returns {Promise<Object>} adql plus rows array
 */
export async function query({ adql } = {}) {
  const cacheKey = `nasa-exoplanet:query:${adql}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/sync`, {
      params: { query: adql, format: 'json' },
    });
    const result = {
      adql,
      rows: Array.isArray(data) ? data : [],
      _cached: false,
    };
    cache.set(cacheKey, result, 86400);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'nasa-exoplanet');
  }
}
