/**
 * Weaviate vector database provider.
 * Supports Weaviate Cloud and self-hosted via REST + GraphQL APIs.
 */

import { httpClient } from '../../core/http.js';
import { gql } from '../../core/gql.js';
import { wrapProviderError, ConfigurationError } from '../../core/errors.js';

function client(apiKey, timeout = 30_000) {
  return httpClient({
    timeout,
    headers: {
      'Content-Type': 'application/json',
      ...(apiKey && { Authorization: `Bearer ${apiKey}` }),
    },
  });
}

/**
 * Upsert objects into a Weaviate class.
 * @param {{ url: string, className: string, objects: Array<{ id?: string, properties: object, vector?: number[] }>, signal?: AbortSignal }} params
 */
export async function upsert({ url, className, objects, signal } = {}, { apiKey } = {}) {
  if (!url) throw new ConfigurationError('[weaviate] Missing url', { provider: 'weaviate' });
  try {
    const batch = objects.map((obj) => ({
      class: className,
      id: obj.id,
      properties: obj.properties,
      vector: obj.vector,
    }));
    const { data } = await client(apiKey).post(`${url}/v1/batch/objects`, { objects: batch }, { signal });
    return { created: data?.filter?.((r) => r.result?.status === 'SUCCESS')?.length ?? batch.length };
  } catch (err) {
    throw wrapProviderError(err, 'weaviate');
  }
}

/**
 * Query using vector similarity (nearVector).
 */
export async function query({ url, className, vector, limit = 10, certainty = 0.7, properties = [], filters, signal } = {}, { apiKey } = {}) {
  if (!url) throw new ConfigurationError('[weaviate] Missing url', { provider: 'weaviate' });
  try {
    const propStr = properties.length ? properties.join(' ') : '_additional { id certainty }';
    const queryStr = `{
      Get {
        ${className}(
          nearVector: { vector: [${vector.join(',')}], certainty: ${certainty} }
          limit: ${limit}
          ${filters ? `where: ${JSON.stringify(filters)}` : ''}
        ) {
          ${propStr}
          _additional { id certainty distance }
        }
      }
    }`;
    const endpoint = `${url}/v1/graphql`;
    const http = client(apiKey);
    const { data: body } = await http.post(endpoint, { query: queryStr }, { signal });
    return { results: body.data?.Get?.[className] ?? [] };
  } catch (err) {
    throw wrapProviderError(err, 'weaviate');
  }
}

/**
 * Delete objects by UUID.
 */
export async function deleteObjects({ url, className, ids, signal } = {}, { apiKey } = {}) {
  if (!url) throw new ConfigurationError('[weaviate] Missing url', { provider: 'weaviate' });
  try {
    const results = await Promise.all(ids.map((id) =>
      client(apiKey).delete(`${url}/v1/objects/${className}/${id}`, { signal })
        .then(() => ({ id, deleted: true }))
        .catch((err) => ({ id, deleted: false, error: err.message }))
    ));
    return { results };
  } catch (err) {
    throw wrapProviderError(err, 'weaviate');
  }
}

/**
 * Get schema.
 */
export async function getSchema({ url, signal } = {}, { apiKey } = {}) {
  if (!url) throw new ConfigurationError('[weaviate] Missing url', { provider: 'weaviate' });
  try {
    const { data } = await client(apiKey).get(`${url}/v1/schema`, { signal });
    return data;
  } catch (err) {
    throw wrapProviderError(err, 'weaviate');
  }
}

/**
 * Create a class (schema update).
 */
export async function createClass({ url, className, vectorizer = 'none', properties = [], signal } = {}, { apiKey } = {}) {
  if (!url) throw new ConfigurationError('[weaviate] Missing url', { provider: 'weaviate' });
  try {
    const { data } = await client(apiKey).post(`${url}/v1/schema`, {
      class: className,
      vectorizer,
      properties,
    }, { signal });
    return data;
  } catch (err) {
    throw wrapProviderError(err, 'weaviate');
  }
}
