/**
 * Cloudflare Turnstile server-side verification.
 */

import { httpClient } from '../../core/http.js';
import { wrapProviderError, ConfigurationError } from '../../core/errors.js';

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

/**
 * Verify a Turnstile token.
 * @param {{ token: string, remoteip?: string, idempotencyKey?: string, signal?: AbortSignal }} params
 * @param {string} secretKey
 */
export async function verify({ token, remoteip, idempotencyKey, signal } = {}, secretKey) {
  if (!secretKey) throw new ConfigurationError('[turnstile] Missing secretKey', { provider: 'turnstile' });
  if (!token) return { success: false, error: 'Missing token' };
  try {
    const body = { secret: secretKey, response: token };
    if (remoteip) body.remoteip = remoteip;
    if (idempotencyKey) body.idempotency_key = idempotencyKey;
    const { data } = await httpClient({ timeout: 10_000 }).post(VERIFY_URL, body, {
      headers: { 'Content-Type': 'application/json' },
      signal,
    });
    return {
      success: data.success,
      challengeTs: data.challenge_ts,
      hostname: data.hostname,
      action: data.action,
      cdata: data.cdata,
      errors: data['error-codes'],
    };
  } catch (err) {
    throw wrapProviderError(err, 'turnstile');
  }
}
