/**
 * Cloudflare R2 via Cloudflare API (account-level operations).
 * For object-level operations (upload, download), use storage/r2.js which uses S3 compat.
 */

import { httpClient } from '../../core/http.js';
import { wrapProviderError, ConfigurationError } from '../../core/errors.js';
import { buildHeaders } from '../../core/signing/cloudflare.js';

const BASE = 'https://api.cloudflare.com/client/v4';

function client(creds) {
  return httpClient({ timeout: 30_000, headers: { ...buildHeaders(creds), 'Content-Type': 'application/json' } });
}

/**
 * List R2 buckets for an account.
 */
export async function listBuckets({ accountId, signal } = {}, creds = {}) {
  if (!accountId) throw new ConfigurationError('[cf-r2] Missing accountId', { provider: 'cf-r2' });
  try {
    const { data } = await client(creds).get(`${BASE}/accounts/${accountId}/r2/buckets`, { signal });
    return { buckets: data.result?.buckets, count: data.result?.buckets?.length };
  } catch (err) {
    throw wrapProviderError(err, 'cf-r2');
  }
}

/**
 * Create an R2 bucket.
 */
export async function createBucket({ accountId, name, locationHint, signal } = {}, creds = {}) {
  if (!accountId || !name) throw new ConfigurationError('[cf-r2] Missing accountId or name', { provider: 'cf-r2' });
  try {
    const { data } = await client(creds).post(`${BASE}/accounts/${accountId}/r2/buckets`, {
      name,
      ...(locationHint && { locationHint }),
    }, { signal });
    return data.result;
  } catch (err) {
    throw wrapProviderError(err, 'cf-r2');
  }
}

/**
 * Get bucket details.
 */
export async function getBucket({ accountId, bucketName, signal } = {}, creds = {}) {
  if (!accountId || !bucketName) throw new ConfigurationError('[cf-r2] Missing accountId or bucketName', { provider: 'cf-r2' });
  try {
    const { data } = await client(creds).get(`${BASE}/accounts/${accountId}/r2/buckets/${bucketName}`, { signal });
    return data.result;
  } catch (err) {
    throw wrapProviderError(err, 'cf-r2');
  }
}

/**
 * Delete an R2 bucket (must be empty).
 */
export async function deleteBucket({ accountId, bucketName, signal } = {}, creds = {}) {
  if (!accountId || !bucketName) throw new ConfigurationError('[cf-r2] Missing accountId or bucketName', { provider: 'cf-r2' });
  try {
    await client(creds).delete(`${BASE}/accounts/${accountId}/r2/buckets/${bucketName}`, { signal });
    return { deleted: true, bucketName };
  } catch (err) {
    throw wrapProviderError(err, 'cf-r2');
  }
}

/**
 * Get bucket CORS config.
 */
export async function getBucketCors({ accountId, bucketName, signal } = {}, creds = {}) {
  if (!accountId || !bucketName) throw new ConfigurationError('[cf-r2] Missing accountId or bucketName', { provider: 'cf-r2' });
  try {
    const { data } = await client(creds).get(`${BASE}/accounts/${accountId}/r2/buckets/${bucketName}/cors`, { signal });
    return data.result;
  } catch (err) {
    throw wrapProviderError(err, 'cf-r2');
  }
}

/**
 * Set bucket CORS config.
 */
export async function setBucketCors({ accountId, bucketName, rules, signal } = {}, creds = {}) {
  if (!accountId || !bucketName) throw new ConfigurationError('[cf-r2] Missing accountId or bucketName', { provider: 'cf-r2' });
  try {
    const { data } = await client(creds).put(`${BASE}/accounts/${accountId}/r2/buckets/${bucketName}/cors`, { rules }, { signal });
    return data.result;
  } catch (err) {
    throw wrapProviderError(err, 'cf-r2');
  }
}
