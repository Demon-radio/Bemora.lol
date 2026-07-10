/**
 * Have I Been Pwned (HIBP) security provider.
 * Check if passwords/emails have appeared in known data breaches.
 */

import { httpClient } from '../../core/http.js';
import { wrapProviderError, ConfigurationError } from '../../core/errors.js';
import { createHash } from 'node:crypto';

const BASE = 'https://haveibeenpwned.com/api/v3';
const PWNED_PASSWORDS = 'https://api.pwnedpasswords.com';

/**
 * Check if a password has appeared in known data breaches.
 * Uses the k-anonymity model — only the first 5 chars of the SHA1 hash are sent.
 * @param {{ password: string, signal?: AbortSignal }} params
 * @returns {{ pwned: boolean, count: number }}
 */
export async function checkPassword({ password, signal } = {}) {
  try {
    const hash = createHash('sha1').update(password).digest('hex').toUpperCase();
    const prefix = hash.slice(0, 5);
    const suffix = hash.slice(5);
    const http = httpClient({ timeout: 10_000 });
    const { data } = await http.get(`${PWNED_PASSWORDS}/range/${prefix}`, {
      headers: { 'Add-Padding': 'true' },
      signal,
    });
    const lines = data.split('\n');
    const match = lines.find((line) => line.startsWith(suffix));
    if (!match) return { pwned: false, count: 0 };
    const count = parseInt(match.split(':')[1], 10);
    return { pwned: count > 0, count };
  } catch (err) {
    throw wrapProviderError(err, 'hibp');
  }
}

/**
 * Check if an email address has appeared in data breaches.
 * @param {{ email: string, signal?: AbortSignal }} params
 * @param {string} apiKey - HIBP API key (required for breach lookups)
 */
export async function checkEmail({ email, truncateResponse = false, signal } = {}, apiKey) {
  if (!apiKey) throw new ConfigurationError('[hibp] checkEmail requires an HIBP API key (https://haveibeenpwned.com/API/Key)', { provider: 'hibp' });
  try {
    const http = httpClient({ timeout: 10_000, headers: { 'hibp-api-key': apiKey } });
    const { data } = await http.get(`${BASE}/breachedaccount/${encodeURIComponent(email)}`, {
      params: { truncateResponse },
      signal,
    }).catch((err) => {
      if (err.response?.status === 404) return { data: [] };
      throw err;
    });
    return {
      breached: data.length > 0,
      count: data.length,
      breaches: data,
    };
  } catch (err) {
    throw wrapProviderError(err, 'hibp');
  }
}

/**
 * Get all breaches in the HIBP database.
 */
export async function getAllBreaches({ domain, signal } = {}) {
  try {
    const http = httpClient({ timeout: 15_000 });
    const { data } = await http.get(`${BASE}/breaches`, { params: domain ? { domain } : {}, signal });
    return data;
  } catch (err) {
    throw wrapProviderError(err, 'hibp');
  }
}

/**
 * Get a specific breach by name.
 */
export async function getBreach({ name, signal } = {}) {
  try {
    const http = httpClient({ timeout: 10_000 });
    const { data } = await http.get(`${BASE}/breach/${encodeURIComponent(name)}`, { signal });
    return data;
  } catch (err) {
    throw wrapProviderError(err, 'hibp');
  }
}
