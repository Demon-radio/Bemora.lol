/**
 * AWS Signature Version 4 implementation.
 * Generates Authorization headers and presigned URLs for any AWS service.
 *
 * Usage (signed headers):
 *   const headers = await signAwsRequest({
 *     method: 'GET', url, body: '', service: 's3', region: 'us-east-1',
 *     accessKeyId, secretAccessKey,
 *   });
 *
 * Usage (presigned URL):
 *   const url = await presignUrl({ method: 'GET', url, expiresIn: 3600, service: 's3', region, accessKeyId, secretAccessKey });
 */

import { createHmac, createHash } from 'node:crypto';

function sha256(data) {
  return createHash('sha256').update(data).digest('hex');
}

function hmac(key, data, encoding) {
  return createHmac('sha256', key).update(data).digest(encoding || undefined);
}

function isoDate(date) {
  return date.toISOString().replace(/[:\-]|\.\d{3}/g, '').slice(0, 8);
}

function isoDateTime(date) {
  return date.toISOString().replace(/[:\-]|\.\d{3}/g, '');
}

function signingKey(secretKey, date, region, service) {
  const kDate    = hmac('AWS4' + secretKey, date);
  const kRegion  = hmac(kDate, region);
  const kService = hmac(kRegion, service);
  const kSigning = hmac(kService, 'aws4_request');
  return kSigning;
}

function parseUrl(url) {
  const u = new URL(url);
  return { host: u.host, pathname: u.pathname, searchParams: u.searchParams, href: u.href };
}

function canonicalQuery(searchParams) {
  const sorted = [...searchParams.entries()].sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0);
  return sorted.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
}

/**
 * Sign an AWS request and return the Authorization header (+ x-amz-date, etc.).
 */
export async function signAwsRequest({
  method,
  url,
  body = '',
  service,
  region,
  accessKeyId,
  secretAccessKey,
  sessionToken,
  headers: extraHeaders = {},
  date: forceDate,
} = {}) {
  const now = forceDate ? new Date(forceDate) : new Date();
  const dateStr     = isoDate(now);
  const dateTimeStr = isoDateTime(now);

  const { host, pathname, searchParams } = parseUrl(url);

  const payloadHash = sha256(body);

  const baseHeaders = {
    host,
    'x-amz-date': dateTimeStr,
    'x-amz-content-sha256': payloadHash,
    ...(sessionToken && { 'x-amz-security-token': sessionToken }),
    ...extraHeaders,
  };

  // Canonical headers (lowercase, sorted, trimmed)
  const canonHeaders = Object.entries(baseHeaders)
    .map(([k, v]) => [k.toLowerCase(), v.trim()])
    .sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0);

  const canonHeaderStr = canonHeaders.map(([k, v]) => `${k}:${v}`).join('\n') + '\n';
  const signedHeaders  = canonHeaders.map(([k]) => k).join(';');
  const canonQuery     = canonicalQuery(searchParams);

  const canonRequest = [
    method.toUpperCase(),
    pathname,
    canonQuery,
    canonHeaderStr,
    signedHeaders,
    payloadHash,
  ].join('\n');

  const credScope = `${dateStr}/${region}/${service}/aws4_request`;
  const stringToSign = ['AWS4-HMAC-SHA256', dateTimeStr, credScope, sha256(canonRequest)].join('\n');
  const sigKey = signingKey(secretAccessKey, dateStr, region, service);
  const sig = hmac(sigKey, stringToSign, 'hex');

  const auth = `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credScope}, SignedHeaders=${signedHeaders}, Signature=${sig}`;

  return {
    ...Object.fromEntries(canonHeaders),
    Authorization: auth,
  };
}

/**
 * Generate a presigned URL (no Authorization header — signature in query string).
 */
export function presignUrl({
  method,
  url,
  expiresIn = 3600,
  service,
  region,
  accessKeyId,
  secretAccessKey,
  sessionToken,
  headers: extraHeaders = {},
  date: forceDate,
} = {}) {
  const now = forceDate ? new Date(forceDate) : new Date();
  const dateStr     = isoDate(now);
  const dateTimeStr = isoDateTime(now);

  const u = new URL(url);
  const credScope = `${dateStr}/${region}/${service}/aws4_request`;

  const signedHeaders = ['host', ...Object.keys(extraHeaders).map((k) => k.toLowerCase())].sort().join(';');

  u.searchParams.set('X-Amz-Algorithm', 'AWS4-HMAC-SHA256');
  u.searchParams.set('X-Amz-Credential', `${accessKeyId}/${credScope}`);
  u.searchParams.set('X-Amz-Date', dateTimeStr);
  u.searchParams.set('X-Amz-Expires', String(expiresIn));
  if (sessionToken) u.searchParams.set('X-Amz-Security-Token', sessionToken);
  u.searchParams.set('X-Amz-SignedHeaders', signedHeaders);

  const canonHeaders = `host:${u.host}\n` +
    Object.entries(extraHeaders).map(([k, v]) => `${k.toLowerCase()}:${v}`).sort().join('\n') +
    (Object.keys(extraHeaders).length ? '\n' : '');

  const canonRequest = [
    method.toUpperCase(),
    u.pathname,
    canonicalQuery(u.searchParams),
    canonHeaders,
    signedHeaders,
    'UNSIGNED-PAYLOAD',
  ].join('\n');

  const stringToSign = ['AWS4-HMAC-SHA256', dateTimeStr, credScope, sha256(canonRequest)].join('\n');
  const sigKey = signingKey(secretAccessKey, dateStr, region, service);
  const sig = hmac(sigKey, stringToSign, 'hex');
  u.searchParams.set('X-Amz-Signature', sig);

  return u.toString();
}
