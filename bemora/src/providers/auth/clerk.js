/**
 * Clerk auth provider — getUser(), verifySession(), listUsers().
 * Uses the Clerk Backend API.
 */

import { httpClient } from '../../core/http.js';
import { wrapProviderError, AuthError, ConfigurationError } from '../../core/errors.js';

const BASE = 'https://api.clerk.com/v1';

function client(secretKey) {
  return httpClient({ timeout: 10_000, headers: { Authorization: `Bearer ${secretKey}` } });
}

/**
 * Get a user by ID.
 * @param {{ userId: string, signal?: AbortSignal }} params
 * @param {string} secretKey — Clerk Secret Key (sk_live_... or sk_test_...)
 */
export async function getUser({ userId, signal } = {}, secretKey) {
  if (!secretKey) throw new ConfigurationError('[clerk] Missing secretKey', { provider: 'clerk' });
  try {
    const { data } = await client(secretKey).get(`${BASE}/users/${userId}`, { signal });
    return data;
  } catch (err) {
    throw wrapProviderError(err, 'clerk');
  }
}

/**
 * List users.
 * @param {{ limit?: number, offset?: number, emailAddress?: string[], signal?: AbortSignal }} params
 */
export async function listUsers({ limit = 20, offset = 0, emailAddress, signal } = {}, secretKey) {
  if (!secretKey) throw new ConfigurationError('[clerk] Missing secretKey', { provider: 'clerk' });
  try {
    const { data } = await client(secretKey).get(`${BASE}/users`, {
      params: { limit, offset, email_address: emailAddress },
      signal,
    });
    return data;
  } catch (err) {
    throw wrapProviderError(err, 'clerk');
  }
}

/**
 * Get user count.
 */
export async function getUserCount({ signal } = {}, secretKey) {
  if (!secretKey) throw new ConfigurationError('[clerk] Missing secretKey', { provider: 'clerk' });
  try {
    const { data } = await client(secretKey).get(`${BASE}/users/count`, { signal });
    return data;
  } catch (err) {
    throw wrapProviderError(err, 'clerk');
  }
}

/**
 * Verify a Clerk session token and return the session payload.
 * @param {{ token: string, signal?: AbortSignal }} params
 */
export async function verifySession({ token, signal } = {}, secretKey) {
  if (!secretKey) throw new ConfigurationError('[clerk] Missing secretKey', { provider: 'clerk' });
  try {
    const { data } = await client(secretKey).get(`${BASE}/sessions/${token}/verify`, { signal });
    return data;
  } catch (err) {
    if (err?.response?.status === 404) {
      throw new AuthError('[clerk] Session not found or expired', { provider: 'clerk', httpStatus: 404 });
    }
    throw wrapProviderError(err, 'clerk');
  }
}

/**
 * Revoke a session.
 */
export async function revokeSession({ sessionId, signal } = {}, secretKey) {
  if (!secretKey) throw new ConfigurationError('[clerk] Missing secretKey', { provider: 'clerk' });
  try {
    const { data } = await client(secretKey).post(`${BASE}/sessions/${sessionId}/revoke`, {}, { signal });
    return data;
  } catch (err) {
    throw wrapProviderError(err, 'clerk');
  }
}

/**
 * Create a new user.
 */
export async function createUser({ emailAddress, username, firstName, lastName, password, signal } = {}, secretKey) {
  if (!secretKey) throw new ConfigurationError('[clerk] Missing secretKey', { provider: 'clerk' });
  try {
    const { data } = await client(secretKey).post(`${BASE}/users`, {
      email_address: Array.isArray(emailAddress) ? emailAddress : [emailAddress],
      username,
      first_name: firstName,
      last_name: lastName,
      password,
    }, { signal });
    return data;
  } catch (err) {
    throw wrapProviderError(err, 'clerk');
  }
}

/**
 * Delete a user.
 */
export async function deleteUser({ userId, signal } = {}, secretKey) {
  if (!secretKey) throw new ConfigurationError('[clerk] Missing secretKey', { provider: 'clerk' });
  try {
    const { data } = await client(secretKey).delete(`${BASE}/users/${userId}`, { signal });
    return data;
  } catch (err) {
    throw wrapProviderError(err, 'clerk');
  }
}
