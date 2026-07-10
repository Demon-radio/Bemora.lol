/**
 * AWS S3 storage provider — presignedUrl(), upload(), download(), delete(), list().
 */

import { httpClient } from '../../core/http.js';
import { wrapProviderError, ConfigurationError } from '../../core/errors.js';
import { signAwsRequest, presignUrl } from '../../core/signing/awsSigV4.js';

function buildUrl({ bucket, key, region = 'us-east-1' }) {
  if (region === 'us-east-1') {
    return `https://${bucket}.s3.amazonaws.com/${encodeURIComponent(key)}`;
  }
  return `https://${bucket}.s3.${region}.amazonaws.com/${encodeURIComponent(key)}`;
}

/**
 * Generate a presigned GET URL (for private object downloads).
 * @param {{ bucket: string, key: string, expiresIn?: number, region?: string }} params
 * @param {{ accessKeyId: string, secretAccessKey: string, sessionToken?: string }} credentials
 */
export async function presignedGetUrl({ bucket, key, expiresIn = 3600, region = 'us-east-1' } = {}, { accessKeyId, secretAccessKey, sessionToken } = {}) {
  if (!accessKeyId || !secretAccessKey) {
    throw new ConfigurationError('[s3] Missing AWS credentials', { provider: 's3' });
  }
  const url = buildUrl({ bucket, key, region });
  return presignUrl({ method: 'GET', url, expiresIn, service: 's3', region, accessKeyId, secretAccessKey, sessionToken });
}

/**
 * Generate a presigned PUT URL (for direct browser uploads).
 */
export async function presignedPutUrl({ bucket, key, contentType = 'application/octet-stream', expiresIn = 3600, region = 'us-east-1' } = {}, { accessKeyId, secretAccessKey, sessionToken } = {}) {
  if (!accessKeyId || !secretAccessKey) {
    throw new ConfigurationError('[s3] Missing AWS credentials', { provider: 's3' });
  }
  const url = buildUrl({ bucket, key, region });
  return presignUrl({
    method: 'PUT', url, expiresIn, service: 's3', region, accessKeyId, secretAccessKey, sessionToken,
    headers: { 'Content-Type': contentType },
  });
}

/**
 * Upload a file/buffer to S3 using a server-side signed PUT request.
 * @param {{ bucket: string, key: string, body: Buffer|string, contentType?: string, region?: string, signal?: AbortSignal }} params
 */
export async function upload({ bucket, key, body, contentType = 'application/octet-stream', region = 'us-east-1', signal } = {}, { accessKeyId, secretAccessKey, sessionToken } = {}) {
  if (!accessKeyId || !secretAccessKey) {
    throw new ConfigurationError('[s3] Missing AWS credentials', { provider: 's3' });
  }
  try {
    const url = buildUrl({ bucket, key, region });
    const bodyStr = typeof body === 'string' ? body : body.toString('binary');
    const headers = await signAwsRequest({
      method: 'PUT', url, body: bodyStr, service: 's3', region, accessKeyId, secretAccessKey, sessionToken,
      headers: { 'Content-Type': contentType },
    });
    const http = httpClient({ timeout: 120_000 });
    const { status, headers: resHeaders } = await http.put(url, body, { headers, signal });
    return { success: status === 200, etag: resHeaders.etag, url };
  } catch (err) {
    throw wrapProviderError(err, 's3');
  }
}

/**
 * Download an object from S3.
 */
export async function download({ bucket, key, region = 'us-east-1', signal } = {}, { accessKeyId, secretAccessKey, sessionToken } = {}) {
  if (!accessKeyId || !secretAccessKey) {
    throw new ConfigurationError('[s3] Missing AWS credentials', { provider: 's3' });
  }
  try {
    const url = buildUrl({ bucket, key, region });
    const headers = await signAwsRequest({
      method: 'GET', url, body: '', service: 's3', region, accessKeyId, secretAccessKey, sessionToken,
    });
    const http = httpClient({ timeout: 60_000 });
    const { data, headers: resHeaders } = await http.get(url, { headers, responseType: 'arraybuffer', signal });
    return { data, contentType: resHeaders['content-type'], contentLength: resHeaders['content-length'] };
  } catch (err) {
    throw wrapProviderError(err, 's3');
  }
}

/**
 * Delete an object from S3.
 */
export async function deleteObject({ bucket, key, region = 'us-east-1', signal } = {}, { accessKeyId, secretAccessKey, sessionToken } = {}) {
  if (!accessKeyId || !secretAccessKey) {
    throw new ConfigurationError('[s3] Missing AWS credentials', { provider: 's3' });
  }
  try {
    const url = buildUrl({ bucket, key, region });
    const headers = await signAwsRequest({
      method: 'DELETE', url, body: '', service: 's3', region, accessKeyId, secretAccessKey, sessionToken,
    });
    const http = httpClient({ timeout: 15_000 });
    await http.delete(url, { headers, signal });
    return { success: true, key };
  } catch (err) {
    throw wrapProviderError(err, 's3');
  }
}

/**
 * List objects in a bucket (or prefix).
 */
export async function list({ bucket, prefix = '', maxKeys = 1000, region = 'us-east-1', signal } = {}, { accessKeyId, secretAccessKey, sessionToken } = {}) {
  if (!accessKeyId || !secretAccessKey) {
    throw new ConfigurationError('[s3] Missing AWS credentials', { provider: 's3' });
  }
  try {
    const baseUrl = region === 'us-east-1'
      ? `https://${bucket}.s3.amazonaws.com/`
      : `https://${bucket}.s3.${region}.amazonaws.com/`;
    const url = `${baseUrl}?list-type=2&prefix=${encodeURIComponent(prefix)}&max-keys=${maxKeys}`;
    const headers = await signAwsRequest({
      method: 'GET', url, body: '', service: 's3', region, accessKeyId, secretAccessKey, sessionToken,
    });
    const http = httpClient({ timeout: 15_000 });
    const { data } = await http.get(url, { headers, signal });
    return { raw: data };
  } catch (err) {
    throw wrapProviderError(err, 's3');
  }
}
