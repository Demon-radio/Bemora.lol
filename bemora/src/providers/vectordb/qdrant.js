/**
 * Qdrant vector database provider — upsert(), query(), delete(), createCollection().
 * Supports Qdrant Cloud and self-hosted instances.
 */

import { httpClient } from '../../core/http.js';
import { wrapProviderError, ConfigurationError } from '../../core/errors.js';

function client(apiKey, timeout = 30_000) {
  return httpClient({
    timeout,
    headers: {
      'Content-Type': 'application/json',
      ...(apiKey && { 'api-key': apiKey }),
    },
  });
}

/**
 * Upsert points (vectors + optional payload) into a collection.
 * @param {{ url: string, collection: string, points: Array<{ id: string|number, vector: number[], payload?: object }>, signal?: AbortSignal }} params
 */
export async function upsert({ url, collection, points, signal } = {}, { apiKey } = {}) {
  if (!url) throw new ConfigurationError('[qdrant] Missing url', { provider: 'qdrant' });
  try {
    const { data } = await client(apiKey).put(
      `${url}/collections/${collection}/points`,
      { points },
      { params: { wait: true }, signal }
    );
    return { status: data.status, result: data.result };
  } catch (err) {
    throw wrapProviderError(err, 'qdrant');
  }
}

/**
 * Search by vector similarity.
 * @param {{ url: string, collection: string, vector: number[], topK?: number, filter?: object, withPayload?: boolean, withVectors?: boolean, signal?: AbortSignal }} params
 */
export async function query({ url, collection, vector, topK = 10, filter, withPayload = true, withVectors = false, signal } = {}, { apiKey } = {}) {
  if (!url) throw new ConfigurationError('[qdrant] Missing url', { provider: 'qdrant' });
  try {
    const body = {
      vector,
      limit: topK,
      with_payload: withPayload,
      with_vectors: withVectors,
      ...(filter && { filter }),
    };
    const { data } = await client(apiKey).post(`${url}/collections/${collection}/points/search`, body, { signal });
    return { results: data.result };
  } catch (err) {
    throw wrapProviderError(err, 'qdrant');
  }
}

/**
 * Delete points by IDs.
 */
export async function deletePoints({ url, collection, ids, signal } = {}, { apiKey } = {}) {
  if (!url) throw new ConfigurationError('[qdrant] Missing url', { provider: 'qdrant' });
  try {
    const { data } = await client(apiKey).post(
      `${url}/collections/${collection}/points/delete`,
      { points: ids },
      { params: { wait: true }, signal }
    );
    return { status: data.status };
  } catch (err) {
    throw wrapProviderError(err, 'qdrant');
  }
}

/**
 * Get point(s) by ID.
 */
export async function getPoints({ url, collection, ids, withPayload = true, withVectors = false, signal } = {}, { apiKey } = {}) {
  if (!url) throw new ConfigurationError('[qdrant] Missing url', { provider: 'qdrant' });
  try {
    const { data } = await client(apiKey).post(
      `${url}/collections/${collection}/points`,
      { ids, with_payload: withPayload, with_vectors: withVectors },
      { signal }
    );
    return { points: data.result };
  } catch (err) {
    throw wrapProviderError(err, 'qdrant');
  }
}

/**
 * Create a new collection.
 */
export async function createCollection({ url, collection, vectorSize, distance = 'Cosine', signal } = {}, { apiKey } = {}) {
  if (!url) throw new ConfigurationError('[qdrant] Missing url', { provider: 'qdrant' });
  try {
    const { data } = await client(apiKey).put(
      `${url}/collections/${collection}`,
      { vectors: { size: vectorSize, distance } },
      { signal }
    );
    return data;
  } catch (err) {
    throw wrapProviderError(err, 'qdrant');
  }
}

/**
 * List collections.
 */
export async function listCollections({ url, signal } = {}, { apiKey } = {}) {
  if (!url) throw new ConfigurationError('[qdrant] Missing url', { provider: 'qdrant' });
  try {
    const { data } = await client(apiKey).get(`${url}/collections`, { signal });
    return data.result;
  } catch (err) {
    throw wrapProviderError(err, 'qdrant');
  }
}

/**
 * Get collection info.
 */
export async function getCollection({ url, collection, signal } = {}, { apiKey } = {}) {
  if (!url) throw new ConfigurationError('[qdrant] Missing url', { provider: 'qdrant' });
  try {
    const { data } = await client(apiKey).get(`${url}/collections/${collection}`, { signal });
    return data.result;
  } catch (err) {
    throw wrapProviderError(err, 'qdrant');
  }
}
