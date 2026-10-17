/**
 * Cloudflare R2 storage provider.
 * R2 is S3-compatible so we reuse the S3 signing logic with a Cloudflare endpoint.
 */

import { httpClient } from '../../core/http.js';
import { wrapProviderError, ConfigurationError } from '../../core/errors.js';
import { signAwsRequest, presignUrl } from '../../core/signing/awsSigV4.js';

const R2_ENDPOINT = ({ accountId, bucket }) =>
  `https://${accountId}.r2.cloudflarestorage.com/${bucket}`;

/**
 * Generate a presigned GET URL for R2 object.
 */
export async function presignedGetUrl({ accountId, bucket, key, expiresIn = 3600 } = {}, { accessKeyId, secretAccessKey } = {}) {
  if (!accessKeyId || !secretAccessKey) throw new ConfigurationError('[r2] Missing credentials', { provider: 'r2' });
  const url = `${R2_ENDPOINT({ accountId, bucket })}/${encodeURIComponent(key)}`;
  return presignUrl({ method: 'GET', url, expiresIn, service: 's3', region: 'auto', accessKeyId, secretAccessKey });
}

/**
 * Generate a presigned PUT URL for R2 uploads.
 */
export async function presignedPutUrl({ accountId, bucket, key, contentType = 'application/octet-stream', expiresIn = 3600 } = {}, { accessKeyId, secretAccessKey } = {}) {
  if (!accessKeyId || !secretAccessKey) throw new ConfigurationError('[r2] Missing credentials', { provider: 'r2' });
  const url = `${R2_ENDPOINT({ accountId, bucket })}/${encodeURIComponent(key)}`;
  return presignUrl({
    method: 'PUT', url, expiresIn, service: 's3', region: 'auto', accessKeyId, secretAccessKey,
    headers: { 'Content-Type': contentType },
  });
}

/**
 * Upload an object to R2.
 */
export async function upload({ accountId, bucket, key, body, contentType = 'application/octet-stream', signal } = {}, { accessKeyId, secretAccessKey } = {}) {
  if (!accessKeyId || !secretAccessKey) throw new ConfigurationError('[r2] Missing credentials', { provider: 'r2' });
  try {
    const url = `${R2_ENDPOINT({ accountId, bucket })}/${encodeURIComponent(key)}`;
    const headers = await signAwsRequest({
      method: 'PUT', url, body: typeof body === 'string' ? body : body.toString('binary'),
      service: 's3', region: 'auto', accessKeyId, secretAccessKey,
      headers: { 'Content-Type': contentType },
    });
    const http = httpClient({ timeout: 120_000 });
    const { status, headers: resHeaders } = await http.put(url, body, { headers, signal });
    return { success: status === 200, etag: resHeaders.etag, url };
  } catch (err) {
    throw wrapProviderError(err, 'r2');
  }
}

/**
 * Delete an object from R2.
 */
export async function deleteObject({ accountId, bucket, key, signal } = {}, { accessKeyId, secretAccessKey } = {}) {
  if (!accessKeyId || !secretAccessKey) throw new ConfigurationError('[r2] Missing credentials', { provider: 'r2' });
  try {
    const url = `${R2_ENDPOINT({ accountId, bucket })}/${encodeURIComponent(key)}`;
    const headers = await signAwsRequest({
      method: 'DELETE', url, body: '', service: 's3', region: 'auto', accessKeyId, secretAccessKey,
    });
    const http = httpClient({ timeout: 15_000 });
    await http.delete(url, { headers, signal });
    return { success: true, key };
  } catch (err) {
    throw wrapProviderError(err, 'r2');
  }
}

/**
 * List objects in an R2 bucket.
 */
export async function list({ accountId, bucket, prefix = '', maxKeys = 1000, signal } = {}, { accessKeyId, secretAccessKey } = {}) {
  if (!accessKeyId || !secretAccessKey) throw new ConfigurationError('[r2] Missing credentials', { provider: 'r2' });
  try {
    const baseUrl = R2_ENDPOINT({ accountId, bucket });
    const url = `${baseUrl}?list-type=2&prefix=${encodeURIComponent(prefix)}&max-keys=${maxKeys}`;
    const headers = await signAwsRequest({
      method: 'GET', url, body: '', service: 's3', region: 'auto', accessKeyId, secretAccessKey,
    });
    const http = httpClient({ timeout: 15_000 });
    const { data } = await http.get(url, { headers, signal });
    return { raw: data };
  } catch (err) {
    throw wrapProviderError(err, 'r2');
  }
}
