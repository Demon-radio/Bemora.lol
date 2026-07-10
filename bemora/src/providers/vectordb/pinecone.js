/**
 * Pinecone vector database provider — upsert(), query(), delete(), describeIndex().
 */

import { httpClient } from '../../core/http.js';
import { wrapProviderError, ConfigurationError, ValidationError } from '../../core/errors.js';

const UPSERT_MAX = 100; // Pinecone recommends batches ≤ 100 vectors

function client(apiKey) {
  return httpClient({ timeout: 30_000, headers: { 'Api-Key': apiKey, 'Content-Type': 'application/json' } });
}

/**
 * Validate that indexHost is a plain hostname (no protocol, no path injection).
 * Pinecone index hosts look like: my-index-abc123.svc.pinecone.io
 */
function validateIndexHost(indexHost) {
  if (!indexHost) throw new ConfigurationError('[pinecone] Missing indexHost (e.g. my-index-abc123.svc.pinecone.io)', { provider: 'pinecone' });
  if (typeof indexHost !== 'string' || !/^[a-zA-Z0-9]([a-zA-Z0-9\-\.]*[a-zA-Z0-9])?$/.test(indexHost)) {
    throw new ValidationError(
      `[pinecone] Invalid indexHost "${indexHost}" — expected a bare hostname like my-index.svc.pinecone.io (no protocol or path).`,
      { provider: 'pinecone' }
    );
  }
  return indexHost;
}

/**
 * Upsert vectors into a Pinecone index.
 * @param {{ indexHost: string, vectors: Array<{ id: string, values: number[], metadata?: object }>, namespace?: string, signal?: AbortSignal }} params
 * @param {string} apiKey
 */
export async function upsert({ indexHost, vectors, namespace = '', signal } = {}, apiKey) {
  if (!apiKey) throw new ConfigurationError('[pinecone] Missing apiKey', { provider: 'pinecone' });
  validateIndexHost(indexHost);
  if (!Array.isArray(vectors) || vectors.length === 0) {
    throw new ValidationError('[pinecone] vectors must be a non-empty array', { provider: 'pinecone' });
  }
  if (vectors.length > UPSERT_MAX) {
    throw new RangeError(
      `[pinecone] upsert received ${vectors.length} vectors; maximum is ${UPSERT_MAX}. ` +
      'Split into smaller batches.'
    );
  }
  try {
    const url = `https://${indexHost}/vectors/upsert`;
    const { data } = await client(apiKey).post(url, { vectors, namespace }, { signal });
    return { upsertedCount: data.upsertedCount, namespace };
  } catch (err) {
    throw wrapProviderError(err, 'pinecone');
  }
}

/**
 * Query vectors by embedding similarity.
 * @param {{ indexHost: string, vector: number[], topK?: number, namespace?: string, filter?: object, includeMetadata?: boolean, includeValues?: boolean, signal?: AbortSignal }} params
 */
export async function query({ indexHost, vector, topK = 10, namespace = '', filter, includeMetadata = true, includeValues = false, signal } = {}, apiKey) {
  if (!apiKey) throw new ConfigurationError('[pinecone] Missing apiKey', { provider: 'pinecone' });
  validateIndexHost(indexHost);
  try {
    const url = `https://${indexHost}/query`;
    const body = { vector, topK, namespace, includeMetadata, includeValues, ...(filter && { filter }) };
    const { data } = await client(apiKey).post(url, body, { signal });
    return { matches: data.matches, namespace };
  } catch (err) {
    throw wrapProviderError(err, 'pinecone');
  }
}

/**
 * Delete vectors by ID.
 */
export async function deleteVectors({ indexHost, ids, namespace = '', deleteAll = false, filter, signal } = {}, apiKey) {
  if (!apiKey) throw new ConfigurationError('[pinecone] Missing apiKey', { provider: 'pinecone' });
  validateIndexHost(indexHost);
  try {
    const url = `https://${indexHost}/vectors/delete`;
    const { data } = await client(apiKey).post(url, { ids, namespace, deleteAll, ...(filter && { filter }) }, { signal });
    return { success: true, ...data };
  } catch (err) {
    throw wrapProviderError(err, 'pinecone');
  }
}

/**
 * Fetch vectors by ID.
 */
export async function fetch({ indexHost, ids, namespace = '', signal } = {}, apiKey) {
  if (!apiKey) throw new ConfigurationError('[pinecone] Missing apiKey', { provider: 'pinecone' });
  validateIndexHost(indexHost);
  try {
    const url = `https://${indexHost}/vectors/fetch?${ids.map((id) => `ids=${encodeURIComponent(id)}`).join('&')}&namespace=${encodeURIComponent(namespace)}`;
    const { data } = await client(apiKey).get(url, { signal });
    return data;
  } catch (err) {
    throw wrapProviderError(err, 'pinecone');
  }
}

/**
 * List indexes for an account.
 */
export async function listIndexes({ signal } = {}, apiKey) {
  if (!apiKey) throw new ConfigurationError('[pinecone] Missing apiKey', { provider: 'pinecone' });
  try {
    const { data } = await client(apiKey).get('https://api.pinecone.io/indexes', { signal });
    return data;
  } catch (err) {
    throw wrapProviderError(err, 'pinecone');
  }
}

/**
 * Describe an index.
 */
export async function describeIndex({ indexName, signal } = {}, apiKey) {
  if (!apiKey) throw new ConfigurationError('[pinecone] Missing apiKey', { provider: 'pinecone' });
  try {
    const { data } = await client(apiKey).get(`https://api.pinecone.io/indexes/${indexName}`, { signal });
    return data;
  } catch (err) {
    throw wrapProviderError(err, 'pinecone');
  }
}
