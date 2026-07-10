/**
 * Algolia search provider — search(), addObjects(), updateObject(), deleteObject().
 */

import { httpClient } from '../../core/http.js';
import { wrapProviderError, ConfigurationError } from '../../core/errors.js';

function client(appId, apiKey) {
  return httpClient({
    timeout: 15_000,
    headers: {
      'X-Algolia-Application-Id': appId,
      'X-Algolia-API-Key': apiKey,
      'Content-Type': 'application/json',
    },
  });
}

function indexUrl(appId, indexName) {
  return `https://${appId}-dsn.algolia.net/1/indexes/${encodeURIComponent(indexName)}`;
}

/**
 * Search an Algolia index.
 * @param {{ indexName: string, query: string, hitsPerPage?: number, page?: number, filters?: string, facets?: string[], signal?: AbortSignal }} params
 * @param {{ appId: string, apiKey: string }} credentials - use Search-Only API key for reads
 */
export async function search({ indexName, query = '', hitsPerPage = 20, page = 0, filters, facets, attributesToRetrieve, signal } = {}, { appId, apiKey } = {}) {
  if (!appId || !apiKey) throw new ConfigurationError('[algolia] Missing appId or apiKey', { provider: 'algolia' });
  try {
    const body = {
      query, hitsPerPage, page,
      ...(filters && { filters }),
      ...(facets && { facets }),
      ...(attributesToRetrieve && { attributesToRetrieve }),
    };
    const { data } = await client(appId, apiKey).post(`${indexUrl(appId, indexName)}/query`, body, { signal });
    return {
      hits: data.hits,
      nbHits: data.nbHits,
      page: data.page,
      nbPages: data.nbPages,
      hitsPerPage: data.hitsPerPage,
      facets: data.facets,
      processingTimeMS: data.processingTimeMS,
    };
  } catch (err) {
    throw wrapProviderError(err, 'algolia');
  }
}

/**
 * Add objects to an index (auto-generates IDs).
 * @param {{ indexName: string, objects: object[], signal?: AbortSignal }} params
 * @param {{ appId: string, apiKey: string }} credentials - requires Admin API key
 */
export async function addObjects({ indexName, objects, signal } = {}, { appId, apiKey } = {}) {
  if (!appId || !apiKey) throw new ConfigurationError('[algolia] Missing appId or apiKey', { provider: 'algolia' });
  try {
    const requests = objects.map((obj) => ({ action: 'addObject', body: obj }));
    const { data } = await client(appId, apiKey).post(`${indexUrl(appId, indexName)}/batch`, { requests }, { signal });
    return data;
  } catch (err) {
    throw wrapProviderError(err, 'algolia');
  }
}

/**
 * Update (partial update) an object by objectID.
 */
export async function updateObject({ indexName, objectID, attributes, signal } = {}, { appId, apiKey } = {}) {
  if (!appId || !apiKey) throw new ConfigurationError('[algolia] Missing appId or apiKey', { provider: 'algolia' });
  try {
    const { data } = await client(appId, apiKey).post(
      `${indexUrl(appId, indexName)}/${objectID}/partial`,
      attributes,
      { signal }
    );
    return data;
  } catch (err) {
    throw wrapProviderError(err, 'algolia');
  }
}

/**
 * Delete an object by objectID.
 */
export async function deleteObject({ indexName, objectID, signal } = {}, { appId, apiKey } = {}) {
  if (!appId || !apiKey) throw new ConfigurationError('[algolia] Missing appId or apiKey', { provider: 'algolia' });
  try {
    const { data } = await client(appId, apiKey).delete(`${indexUrl(appId, indexName)}/${objectID}`, { signal });
    return data;
  } catch (err) {
    throw wrapProviderError(err, 'algolia');
  }
}

/**
 * Save (create or replace) objects by objectID.
 */
export async function saveObjects({ indexName, objects, signal } = {}, { appId, apiKey } = {}) {
  if (!appId || !apiKey) throw new ConfigurationError('[algolia] Missing appId or apiKey', { provider: 'algolia' });
  try {
    const requests = objects.map((obj) => ({ action: 'updateObject', body: obj }));
    const { data } = await client(appId, apiKey).post(`${indexUrl(appId, indexName)}/batch`, { requests }, { signal });
    return data;
  } catch (err) {
    throw wrapProviderError(err, 'algolia');
  }
}

/**
 * List indexes.
 */
export async function listIndexes({ signal } = {}, { appId, apiKey } = {}) {
  if (!appId || !apiKey) throw new ConfigurationError('[algolia] Missing appId or apiKey', { provider: 'algolia' });
  try {
    const { data } = await client(appId, apiKey).get(`https://${appId}.algolia.net/1/indexes`, { signal });
    return data;
  } catch (err) {
    throw wrapProviderError(err, 'algolia');
  }
}
