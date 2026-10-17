/**
 * Meilisearch provider — search(), addDocuments(), updateDocuments(), deleteDocuments().
 * Works with Meilisearch Cloud and self-hosted.
 */

import { httpClient } from '../../core/http.js';
import { wrapProviderError, ConfigurationError } from '../../core/errors.js';

function client(url, apiKey) {
  return httpClient({
    timeout: 15_000,
    headers: {
      ...(apiKey && { Authorization: `Bearer ${apiKey}` }),
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Search an index.
 * @param {{ url: string, indexUid: string, query: string, limit?: number, offset?: number, filter?: string, facets?: string[], signal?: AbortSignal }} params
 * @param {{ apiKey?: string }} credentials
 */
export async function search({ url, indexUid, query = '', limit = 20, offset = 0, filter, facets, attributesToRetrieve, sort, signal } = {}, { apiKey } = {}) {
  if (!url) throw new ConfigurationError('[meilisearch] Missing url', { provider: 'meilisearch' });
  try {
    const body = {
      q: query, limit, offset,
      ...(filter && { filter }),
      ...(facets && { facets }),
      ...(attributesToRetrieve && { attributesToRetrieve }),
      ...(sort && { sort }),
    };
    const { data } = await client(url, apiKey).post(`${url}/indexes/${indexUid}/search`, body, { signal });
    return {
      hits: data.hits,
      estimatedTotalHits: data.estimatedTotalHits,
      offset: data.offset,
      limit: data.limit,
      processingTimeMs: data.processingTimeMs,
      facetDistribution: data.facetDistribution,
    };
  } catch (err) {
    throw wrapProviderError(err, 'meilisearch');
  }
}

/**
 * Add or replace documents.
 * @param {{ url: string, indexUid: string, documents: object[], primaryKey?: string, signal?: AbortSignal }} params
 */
export async function addDocuments({ url, indexUid, documents, primaryKey, signal } = {}, { apiKey } = {}) {
  if (!url) throw new ConfigurationError('[meilisearch] Missing url', { provider: 'meilisearch' });
  try {
    const { data } = await client(url, apiKey).post(
      `${url}/indexes/${indexUid}/documents`,
      documents,
      { params: primaryKey ? { primaryKey } : {}, signal }
    );
    return data; // returns a task { taskUid, indexUid, status, type, ... }
  } catch (err) {
    throw wrapProviderError(err, 'meilisearch');
  }
}

/**
 * Update documents (partial update).
 */
export async function updateDocuments({ url, indexUid, documents, primaryKey, signal } = {}, { apiKey } = {}) {
  if (!url) throw new ConfigurationError('[meilisearch] Missing url', { provider: 'meilisearch' });
  try {
    const { data } = await client(url, apiKey).put(
      `${url}/indexes/${indexUid}/documents`,
      documents,
      { params: primaryKey ? { primaryKey } : {}, signal }
    );
    return data;
  } catch (err) {
    throw wrapProviderError(err, 'meilisearch');
  }
}

/**
 * Delete documents by IDs.
 */
export async function deleteDocuments({ url, indexUid, ids, signal } = {}, { apiKey } = {}) {
  if (!url) throw new ConfigurationError('[meilisearch] Missing url', { provider: 'meilisearch' });
  try {
    const { data } = await client(url, apiKey).post(
      `${url}/indexes/${indexUid}/documents/delete-batch`,
      ids,
      { signal }
    );
    return data;
  } catch (err) {
    throw wrapProviderError(err, 'meilisearch');
  }
}

/**
 * Create or update an index.
 */
export async function createIndex({ url, indexUid, primaryKey, signal } = {}, { apiKey } = {}) {
  if (!url) throw new ConfigurationError('[meilisearch] Missing url', { provider: 'meilisearch' });
  try {
    const { data } = await client(url, apiKey).post(`${url}/indexes`, { uid: indexUid, primaryKey }, { signal });
    return data;
  } catch (err) {
    throw wrapProviderError(err, 'meilisearch');
  }
}

/**
 * Get index statistics.
 */
export async function getIndexStats({ url, indexUid, signal } = {}, { apiKey } = {}) {
  if (!url) throw new ConfigurationError('[meilisearch] Missing url', { provider: 'meilisearch' });
  try {
    const { data } = await client(url, apiKey).get(`${url}/indexes/${indexUid}/stats`, { signal });
    return data;
  } catch (err) {
    throw wrapProviderError(err, 'meilisearch');
  }
}
