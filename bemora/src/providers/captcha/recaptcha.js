/**
 * Google reCAPTCHA v2/v3 server-side verification.
 */

import { httpClient } from '../../core/http.js';
import { wrapProviderError, ConfigurationError } from '../../core/errors.js';

const VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';

/**
 * Verify a reCAPTCHA token.
 * @param {{ token: string, remoteip?: string, minScore?: number, signal?: AbortSignal }} params
 * @param {string} secretKey - reCAPTCHA secret key
 * @returns {{ success: boolean, score?: number, action?: string, hostname?: string, error?: string }}
 */
export async function verify({ token, remoteip, minScore = 0.5, signal } = {}, secretKey) {
  if (!secretKey) throw new ConfigurationError('[recaptcha] Missing secretKey', { provider: 'recaptcha' });
  if (!token) return { success: false, error: 'Missing token' };
  try {
    const params = new URLSearchParams({ secret: secretKey, response: token });
    if (remoteip) params.append('remoteip', remoteip);
    const { data } = await httpClient({ timeout: 10_000 }).post(VERIFY_URL, params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      signal,
    });
    const valid = data.success && (data.score === undefined || data.score >= minScore);
    return {
      success: valid,
      score: data.score,
      action: data.action,
      hostname: data.hostname,
      challengeTs: data.challenge_ts,
      errors: data['error-codes'],
    };
  } catch (err) {
    throw wrapProviderError(err, 'recaptcha');
  }
}
