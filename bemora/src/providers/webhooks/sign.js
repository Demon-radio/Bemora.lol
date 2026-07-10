/**
 * Outbound webhook signing helper.
 *
 * Produces HMAC-SHA256 signatures for webhooks your application sends to
 * customers, matching the inbound-verify pattern in verify.js.
 *
 * Usage:
 *   import { signWebhook, verifySignature } from './webhooks/sign.js';
 *
 *   // When dispatching a webhook to a customer endpoint:
 *   const { signature, timestamp, headers } = signWebhook(payload, secret);
 *   // Include `headers` in your outbound HTTP request.
 *
 *   // The customer verifies with the same secret:
 *   const ok = verifySignature(payload, signature, secret, timestamp);
 */

import { createHmac, timingSafeEqual } from 'node:crypto';

const SIGNATURE_VERSION = 'v1';
const TIMESTAMP_TOLERANCE_S = 300; // 5 minutes

/**
 * Build a signed payload string.
 * Format: `{timestamp}.{rawBody}`
 */
function buildSignedPayload(rawBody, timestamp) {
  return `${timestamp}.${typeof rawBody === 'string' ? rawBody : rawBody.toString()}`;
}

/**
 * Sign a webhook payload with HMAC-SHA256.
 *
 * @param {string|Buffer} payload - the raw request body (JSON string)
 * @param {string} secret - shared signing secret
 * @param {object} [opts]
 * @param {number} [opts.timestamp] - Unix epoch seconds (defaults to now)
 * @returns {{ signature: string, timestamp: number, headers: Record<string, string> }}
 */
export function signWebhook(payload, secret, { timestamp } = {}) {
  const ts = timestamp ?? Math.floor(Date.now() / 1000);
  const signedPayload = buildSignedPayload(payload, ts);
  const hmac = createHmac('sha256', secret).update(signedPayload, 'utf8').digest('hex');
  const signature = `${SIGNATURE_VERSION}=${hmac}`;

  return {
    signature,
    timestamp: ts,
    headers: {
      'X-Bemora-Signature': signature,
      'X-Bemora-Timestamp': String(ts),
    },
  };
}

/**
 * Verify that a received signature matches the expected one.
 * Use this on the *receiving* end when Bemora is acting as a webhook producer
 * and the consumer wants to verify the authenticity of inbound requests.
 *
 * @param {string|Buffer} payload - raw request body
 * @param {string} receivedSig - value of X-Bemora-Signature header
 * @param {string} secret - shared signing secret
 * @param {number|string} receivedTimestamp - value of X-Bemora-Timestamp header
 * @param {object} [opts]
 * @param {number} [opts.toleranceSeconds=300] - clock skew tolerance in seconds
 * @returns {boolean}
 */
export function verifySignature(payload, receivedSig, secret, receivedTimestamp, { toleranceSeconds = TIMESTAMP_TOLERANCE_S } = {}) {
  const ts = Number(receivedTimestamp);
  if (!ts || isNaN(ts)) return false;

  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - ts) > toleranceSeconds) return false;

  const signedPayload = buildSignedPayload(payload, ts);
  const expected = `${SIGNATURE_VERSION}=${createHmac('sha256', secret).update(signedPayload, 'utf8').digest('hex')}`;

  try {
    const a = Buffer.from(receivedSig);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/**
 * Convenience: build the signing headers for an outbound fetch/axios call.
 *
 * @param {string|Buffer} payload
 * @param {string} secret
 * @returns {Record<string, string>}
 */
export function signingHeaders(payload, secret) {
  return signWebhook(payload, secret).headers;
}
