import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();

/**
 * Search Wikidata entities by label (no key needed).
 * @param {Object} params
 * @param {string} params.query
 * @param {string} [params.language]
 * @param {number} [params.limit]
 */
export async function searchEntities({ query, language = 'en', limit = 5 }) {
  const cacheKey = `wikidata:search:${language}:${query}:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  let data;
  try {
    ({ data } = await http.get('https://www.wikidata.org/w/api.php', {
      params: {
        action: 'wbsearchentities',
        search: query,
        language,
        limit,
        format: 'json',
        origin: '*',
      },
    }));
  } catch (err) {
    throw wrapProviderError(err, 'wikidata');
  }

  const result = {
    query,
    entities: (data.search || []).map((e) => ({
      id: e.id,
      label: e.label,
      description: e.description,
      url: e.concepturi,
    })),
    _cached: false,
  };

  cache.set(cacheKey, result, 86400);
  return result;
}

/**
 * Fetch a Wikidata entity's core claims (structured facts) by Q-id.
 * @param {Object} params
 * @param {string} params.id - e.g. 'Q90' (Paris)
 * @param {string} [params.language]
 */
export async function getEntity({ id, language = 'en' }) {
  const cacheKey = `wikidata:entity:${id}:${language}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  let data;
  try {
    ({ data } = await http.get('https://www.wikidata.org/w/api.php', {
      params: {
        action: 'wbgetentities',
        ids: id,
        languages: language,
        format: 'json',
        origin: '*',
      },
    }));
  } catch (err) {
    throw wrapProviderError(err, 'wikidata');
  }

  const entity = data.entities?.[id];
  if (!entity) throw new Error(`Wikidata entity not found: ${id}`);

  const result = {
    id,
    label: entity.labels?.[language]?.value,
    description: entity.descriptions?.[language]?.value,
    aliases: (entity.aliases?.[language] || []).map((a) => a.value),
    claimCount: Object.keys(entity.claims || {}).length,
    sitelinks: Object.keys(entity.sitelinks || {}).length,
    _cached: false,
  };

  cache.set(cacheKey, result, 86400);
  return result;
}
