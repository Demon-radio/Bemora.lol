/**
 * HMAC signing helpers — generic request signing and verification.
 *
 * Usage:
 *   import { signRequest, verifyRequest } from '../core/signing/hmac.js';
 *
 *   // Sign
 *   const sig = signRequest({ method, url, body, secret, algorithm: 'sha256' });
 *
 *   // Verify (constant-time)
 *   const ok = verifyRequest({ method, url, body, secret, signature: sig });
 */

import { createHmac, timingSafeEqual, randomBytes } from 'node:crypto';

const DEFAULT_ALGO = 'sha256';

/**
 * Sign a canonical string derived from the request.
 *
 * Canonical string: `{METHOD}\n{URL}\n{ISO_TIMESTAMP}\n{SHA256_BODY}`
 *
 * @param {{ method: string, url: string, body?: string, secret: string, algorithm?: string, timestamp?: string }} params
 * @returns {{ signature: string, timestamp: string, algorithm: string }}
 */
export function signRequest({ method, url, body = '', secret, algorithm = DEFAULT_ALGO, timestamp } = {}) {
  const ts = timestamp || new Date().toISOString();
  const bodyHash = createHmac('sha256', '').update(body).digest('hex');
  const canonical = `${method.toUpperCase()}\n${url}\n${ts}\n${bodyHash}`;
  const signature = createHmac(algorithm, secret).update(canonical).digest('hex');
  return { signature, timestamp: ts, algorithm };
}

/**
 * Verify a signed request (constant-time comparison).
 *
 * @param {{ method: string, url: string, body?: string, secret: string, signature: string, timestamp: string, algorithm?: string, tolerance?: number }} params
 * @returns {boolean}
 */
export function verifyRequest({ method, url, body = '', secret, signature, timestamp, algorithm = DEFAULT_ALGO, tolerance = 300 } = {}) {
  try {
    // Reject requests outside the time window
    if (tolerance && timestamp) {
      const diff = Math.abs(Date.now() - new Date(timestamp).getTime()) / 1000;
      if (diff > tolerance) return false;
    }

    const { signature: expected } = signRequest({ method, url, body, secret, algorithm, timestamp });
    const a = Buffer.from(expected, 'hex');
    const b = Buffer.from(signature || '', 'hex');
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/**
 * Sign an arbitrary payload string.
 * @param {{ payload: string|Buffer, secret: string, algorithm?: string }} params
 * @returns {string} hex digest
 */
export function signPayload({ payload, secret, algorithm = DEFAULT_ALGO } = {}) {
  return createHmac(algorithm, secret).update(payload).digest('hex');
}

/**
 * Verify an arbitrary signed payload (constant-time).
 */
export function verifyPayload({ payload, secret, signature, algorithm = DEFAULT_ALGO } = {}) {
  try {
    const expected = Buffer.from(signPayload({ payload, secret, algorithm }), 'hex');
    const actual   = Buffer.from(signature || '', 'hex');
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}

/**
 * Generate a cryptographically secure random secret (hex string).
 * @param {number} bytes
 */
export function generateSecret(bytes = 32) {
  return randomBytes(bytes).toString('hex');
}
