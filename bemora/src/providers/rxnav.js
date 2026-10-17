import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();

const BASE = 'https://rxnav.nlm.nih.gov/REST';

/**
 * Look up drugs by name from RxNav.
 * @param {Object} params
 * @param {string} params.name - drug name
 * @returns {Promise<Object>} name plus drugs array
 */
export async function drugs({ name } = {}) {
  const cacheKey = `rxnav:drugs:${name}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/drugs.json`, { params: { name } });
    const result = {
      name,
      drugs: (data.drugGroup?.conceptGroup || []).flatMap((g) =>
        (g.conceptProperties || []).map((c) => ({
          rxcui: c.rxcui,
          name: c.name,
          synonym: c.synonym,
          tty: c.tty,
        }))
      ),
      _cached: false,
    };
    cache.set(cacheKey, result, 86400);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'rxnav');
  }
}

/**
 * Fetch interactions for an RxCUI from RxNav.
 * @param {Object} params
 * @param {string} params.rxcui - RxNorm concept id
 * @returns {Promise<Object>} rxcui plus interactions array
 */
export async function interactions({ rxcui } = {}) {
  const cacheKey = `rxnav:interactions:${rxcui}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/interaction/interaction.json`, { params: { rxcui } });
    const result = {
      rxcui,
      interactions: (data.interactionTypeGroup || []).flatMap((g) =>
        (g.interactionType || []).map((t) => ({
          name: t.comment || t.interactionPair?.[0]?.description,
          severity: t.interactionPair?.[0]?.severity,
        }))
      ),
      _cached: false,
    };
    cache.set(cacheKey, result, 86400);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'rxnav');
  }
}
