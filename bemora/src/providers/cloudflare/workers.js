/**
 * Cloudflare Workers provider — deploy scripts, manage KV, trigger Workers via HTTP.
 */

import { httpClient } from '../../core/http.js';
import { wrapProviderError, ConfigurationError } from '../../core/errors.js';
import { buildHeaders } from '../../core/signing/cloudflare.js';

const BASE = 'https://api.cloudflare.com/client/v4';

function client(creds) {
  return httpClient({ timeout: 30_000, headers: { ...buildHeaders(creds), 'Content-Type': 'application/json' } });
}

/**
 * List Workers scripts for an account.
 */
export async function listScripts({ accountId, signal } = {}, creds = {}) {
  if (!accountId) throw new ConfigurationError('[cf-workers] Missing accountId', { provider: 'cf-workers' });
  try {
    const { data } = await client(creds).get(`${BASE}/accounts/${accountId}/workers/scripts`, { signal });
    return { scripts: data.result };
  } catch (err) {
    throw wrapProviderError(err, 'cf-workers');
  }
}

/**
 * Get a Workers script.
 */
export async function getScript({ accountId, scriptName, signal } = {}, creds = {}) {
  if (!accountId || !scriptName) throw new ConfigurationError('[cf-workers] Missing accountId or scriptName', { provider: 'cf-workers' });
  try {
    const { data } = await client(creds).get(`${BASE}/accounts/${accountId}/workers/scripts/${scriptName}`, { signal });
    return data.result;
  } catch (err) {
    throw wrapProviderError(err, 'cf-workers');
  }
}

/**
 * Put (deploy) a Workers script.
 * @param {{ accountId: string, scriptName: string, script: string, bindings?: object[], signal?: AbortSignal }} params
 */
export async function putScript({ accountId, scriptName, script, bindings = [], signal } = {}, creds = {}) {
  if (!accountId || !scriptName) throw new ConfigurationError('[cf-workers] Missing accountId or scriptName', { provider: 'cf-workers' });
  try {
    const http = httpClient({ timeout: 30_000, headers: { ...buildHeaders(creds) } });
    const formData = new FormData();
    const metadata = { main_module: 'worker.js', bindings };
    formData.append('metadata', JSON.stringify(metadata), { contentType: 'application/json' });
    formData.append('worker.js', script, { contentType: 'application/javascript+module', filename: 'worker.js' });
    const { data } = await http.put(
      `${BASE}/accounts/${accountId}/workers/scripts/${scriptName}`,
      formData,
      { signal }
    );
    return { id: data.result?.id, etag: data.result?.etag, success: data.success };
  } catch (err) {
    throw wrapProviderError(err, 'cf-workers');
  }
}

/**
 * Delete a Workers script.
 */
export async function deleteScript({ accountId, scriptName, signal } = {}, creds = {}) {
  if (!accountId || !scriptName) throw new ConfigurationError('[cf-workers] Missing accountId or scriptName', { provider: 'cf-workers' });
  try {
    await client(creds).delete(`${BASE}/accounts/${accountId}/workers/scripts/${scriptName}`, { signal });
    return { deleted: true, scriptName };
  } catch (err) {
    throw wrapProviderError(err, 'cf-workers');
  }
}

// ── KV Namespace management ───────────────────────────────────────────────────

/**
 * List KV namespaces.
 */
export async function listKVNamespaces({ accountId, signal } = {}, creds = {}) {
  if (!accountId) throw new ConfigurationError('[cf-workers] Missing accountId', { provider: 'cf-workers' });
  try {
    const { data } = await client(creds).get(`${BASE}/accounts/${accountId}/storage/kv/namespaces`, { signal });
    return { namespaces: data.result };
  } catch (err) {
    throw wrapProviderError(err, 'cf-workers');
  }
}

/**
 * Read a KV value.
 */
export async function kvGet({ accountId, namespaceId, key, signal } = {}, creds = {}) {
  if (!accountId || !namespaceId || !key) throw new ConfigurationError('[cf-workers] Missing accountId, namespaceId, or key', { provider: 'cf-workers' });
  try {
    const { data } = await client(creds).get(`${BASE}/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values/${encodeURIComponent(key)}`, { signal });
    return { key, value: data };
  } catch (err) {
    throw wrapProviderError(err, 'cf-workers');
  }
}

/**
 * Write a KV value.
 */
export async function kvPut({ accountId, namespaceId, key, value, expiration, expirationTtl, signal } = {}, creds = {}) {
  if (!accountId || !namespaceId || !key) throw new ConfigurationError('[cf-workers] Missing accountId, namespaceId, or key', { provider: 'cf-workers' });
  try {
    const params = { ...(expiration && { expiration }), ...(expirationTtl && { expiration_ttl: expirationTtl }) };
    await client(creds).put(
      `${BASE}/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values/${encodeURIComponent(key)}`,
      typeof value === 'string' ? value : JSON.stringify(value),
      { params, signal }
    );
    return { success: true, key };
  } catch (err) {
    throw wrapProviderError(err, 'cf-workers');
  }
}

/**
 * Delete a KV key.
 */
export async function kvDelete({ accountId, namespaceId, key, signal } = {}, creds = {}) {
  if (!accountId || !namespaceId || !key) throw new ConfigurationError('[cf-workers] Missing accountId, namespaceId, or key', { provider: 'cf-workers' });
  try {
    await client(creds).delete(`${BASE}/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values/${encodeURIComponent(key)}`, { signal });
    return { deleted: true, key };
  } catch (err) {
    throw wrapProviderError(err, 'cf-workers');
  }
}
