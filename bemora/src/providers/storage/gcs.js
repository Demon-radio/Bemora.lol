/**
 * Google Cloud Storage provider — presignedUrl(), upload(), download(), delete(), list().
 * Uses the GCS XML API with HMAC signing (for service account keys).
 */

import { httpClient } from '../../core/http.js';
import { wrapProviderError, ConfigurationError } from '../../core/errors.js';
import { createHmac } from 'node:crypto';

const GCS_BASE = (bucket) => `https://storage.googleapis.com/${bucket}`;

function signGcsUrl({ method, bucket, key, expiresIn = 3600, contentType, accessKeyId, secretAccessKey }) {
  const expiry = Math.floor(Date.now() / 1000) + expiresIn;
  const resourcePath = `/${bucket}/${key}`;
  const stringToSign = [method, '', contentType || '', expiry, resourcePath].join('\n');
  const sig = createHmac('sha256', secretAccessKey).update(stringToSign).digest('base64');
  const sigEncoded = encodeURIComponent(sig);
  return `https://storage.googleapis.com${resourcePath}?GoogleAccessId=${accessKeyId}&Expires=${expiry}&Signature=${sigEncoded}`;
}

/**
 * Generate a presigned GET URL.
 */
export function presignedGetUrl({ bucket, key, expiresIn = 3600 } = {}, { accessKeyId, secretAccessKey } = {}) {
  if (!accessKeyId || !secretAccessKey) throw new ConfigurationError('[gcs] Missing credentials', { provider: 'gcs' });
  return signGcsUrl({ method: 'GET', bucket, key, expiresIn, accessKeyId, secretAccessKey });
}

/**
 * Generate a presigned PUT URL.
 */
export function presignedPutUrl({ bucket, key, contentType = 'application/octet-stream', expiresIn = 3600 } = {}, { accessKeyId, secretAccessKey } = {}) {
  if (!accessKeyId || !secretAccessKey) throw new ConfigurationError('[gcs] Missing credentials', { provider: 'gcs' });
  return signGcsUrl({ method: 'PUT', bucket, key, expiresIn, contentType, accessKeyId, secretAccessKey });
}

/**
 * Upload an object to GCS.
 */
export async function upload({ bucket, key, body, contentType = 'application/octet-stream', signal } = {}, { accessToken } = {}) {
  if (!accessToken) throw new ConfigurationError('[gcs] Missing accessToken (OAuth2)', { provider: 'gcs' });
  try {
    const url = `https://storage.googleapis.com/upload/storage/v1/b/${bucket}/o?uploadType=media&name=${encodeURIComponent(key)}`;
    const http = httpClient({
      timeout: 120_000,
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': contentType },
    });
    const { data } = await http.post(url, body, { signal });
    return { success: true, name: data.name, bucket: data.bucket, mediaLink: data.mediaLink };
  } catch (err) {
    throw wrapProviderError(err, 'gcs');
  }
}

/**
 * Download an object from GCS.
 */
export async function download({ bucket, key, signal } = {}, { accessToken } = {}) {
  if (!accessToken) throw new ConfigurationError('[gcs] Missing accessToken', { provider: 'gcs' });
  try {
    const url = `https://storage.googleapis.com/storage/v1/b/${bucket}/o/${encodeURIComponent(key)}?alt=media`;
    const http = httpClient({ timeout: 60_000, headers: { Authorization: `Bearer ${accessToken}` } });
    const { data, headers } = await http.get(url, { responseType: 'arraybuffer', signal });
    return { data, contentType: headers['content-type'] };
  } catch (err) {
    throw wrapProviderError(err, 'gcs');
  }
}

/**
 * Delete an object from GCS.
 */
export async function deleteObject({ bucket, key, signal } = {}, { accessToken } = {}) {
  if (!accessToken) throw new ConfigurationError('[gcs] Missing accessToken', { provider: 'gcs' });
  try {
    const url = `https://storage.googleapis.com/storage/v1/b/${bucket}/o/${encodeURIComponent(key)}`;
    const http = httpClient({ timeout: 15_000, headers: { Authorization: `Bearer ${accessToken}` } });
    await http.delete(url, { signal });
    return { success: true, key };
  } catch (err) {
    throw wrapProviderError(err, 'gcs');
  }
}

/**
 * List objects in a GCS bucket.
 */
export async function list({ bucket, prefix = '', maxResults = 1000, signal } = {}, { accessToken } = {}) {
  if (!accessToken) throw new ConfigurationError('[gcs] Missing accessToken', { provider: 'gcs' });
  try {
    const url = `https://storage.googleapis.com/storage/v1/b/${bucket}/o`;
    const http = httpClient({ timeout: 15_000, headers: { Authorization: `Bearer ${accessToken}` } });
    const { data } = await http.get(url, { params: { prefix, maxResults }, signal });
    return data;
  } catch (err) {
    throw wrapProviderError(err, 'gcs');
  }
}
