/**
 * hCaptcha server-side verification.
 */

import { httpClient } from '../../core/http.js';
import { wrapProviderError, ConfigurationError } from '../../core/errors.js';

const VERIFY_URL = 'https://api.hcaptcha.com/siteverify';

/**
 * Verify an hCaptcha token.
 * @param {{ token: string, sitekey?: string, remoteip?: string, signal?: AbortSignal }} params
 * @param {string} secretKey
 */
export async function verify({ token, sitekey, remoteip, signal } = {}, secretKey) {
  if (!secretKey) throw new ConfigurationError('[hcaptcha] Missing secretKey', { provider: 'hcaptcha' });
  if (!token) return { success: false, error: 'Missing token' };
  try {
    const params = new URLSearchParams({ secret: secretKey, response: token });
    if (sitekey) params.append('sitekey', sitekey);
    if (remoteip) params.append('remoteip', remoteip);
    const { data } = await httpClient({ timeout: 10_000 }).post(VERIFY_URL, params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      signal,
    });
    return {
      success: data.success,
      score: data.score,
      scoreReasons: data.score_reasons,
      hostname: data.hostname,
      credit: data.credit,
      errors: data['error-codes'],
    };
  } catch (err) {
    throw wrapProviderError(err, 'hcaptcha');
  }
}
