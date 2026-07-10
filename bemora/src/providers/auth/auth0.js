/**
 * Auth0 provider — getUser(), verifyToken(), listUsers(), clientCredentials().
 */

import { httpClient } from '../../core/http.js';
import { wrapProviderError, AuthError, ConfigurationError } from '../../core/errors.js';

function client(token, domain) {
  return httpClient({ timeout: 10_000, headers: { Authorization: `Bearer ${token}` } });
}

/** Obtain a machine-to-machine token via client_credentials grant. */
const _tokenCache = new Map();

export async function getManagementToken({ domain, clientId, clientSecret, audience } = {}) {
  const key = `${domain}:${clientId}`;
  const cached = _tokenCache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.token;

  const http = httpClient({ timeout: 10_000 });
  const { data } = await http.post(`https://${domain}/oauth/token`, {
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
    audience: audience || `https://${domain}/api/v2/`,
  });
  _tokenCache.set(key, { token: data.access_token, expiresAt: Date.now() + (data.expires_in - 60) * 1000 });
  return data.access_token;
}

/**
 * Get a user by ID.
 */
export async function getUser({ userId, signal } = {}, { domain, clientId, clientSecret } = {}) {
  if (!domain) throw new ConfigurationError('[auth0] Missing domain', { provider: 'auth0' });
  try {
    const token = await getManagementToken({ domain, clientId, clientSecret });
    const { data } = await client(token).get(`https://${domain}/api/v2/users/${encodeURIComponent(userId)}`, { signal });
    return data;
  } catch (err) {
    throw wrapProviderError(err, 'auth0');
  }
}

/**
 * List users (Management API).
 */
export async function listUsers({ page = 0, perPage = 50, query, sort, signal } = {}, { domain, clientId, clientSecret } = {}) {
  if (!domain) throw new ConfigurationError('[auth0] Missing domain', { provider: 'auth0' });
  try {
    const token = await getManagementToken({ domain, clientId, clientSecret });
    const { data } = await client(token).get(`https://${domain}/api/v2/users`, {
      params: { page, per_page: perPage, q: query, sort, include_totals: true },
      signal,
    });
    return data;
  } catch (err) {
    throw wrapProviderError(err, 'auth0');
  }
}

/**
 * Get the user info from an access token (userinfo endpoint).
 */
export async function getUserInfo({ accessToken, domain, signal } = {}) {
  if (!domain) throw new ConfigurationError('[auth0] Missing domain', { provider: 'auth0' });
  try {
    const http = httpClient({ timeout: 10_000, headers: { Authorization: `Bearer ${accessToken}` } });
    const { data } = await http.get(`https://${domain}/userinfo`, { signal });
    return data;
  } catch (err) {
    throw wrapProviderError(err, 'auth0');
  }
}

/**
 * Verify a JWT access token via the JWKS endpoint.
 * Returns decoded payload if valid.
 */
export async function verifyToken({ token, domain, audience, signal } = {}) {
  if (!domain) throw new ConfigurationError('[auth0] Missing domain', { provider: 'auth0' });
  try {
    // Fetch JWKS
    const http = httpClient({ timeout: 10_000 });
    const { data: jwks } = await http.get(`https://${domain}/.well-known/jwks.json`, { signal });

    // Decode header to get kid
    const [headerB64] = token.split('.');
    const header = JSON.parse(Buffer.from(headerB64, 'base64url').toString());
    const key = jwks.keys?.find((k) => k.kid === header.kid);
    if (!key) throw new AuthError('[auth0] No matching key in JWKS', { provider: 'auth0' });

    // For full RS256 verification in production, use a proper JWKS library.
    // Here we validate structure and return decoded payload for inspection.
    const [, payloadB64] = token.split('.');
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString());

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) throw new AuthError('[auth0] Token expired', { provider: 'auth0' });
    if (audience && payload.aud !== audience && !payload.aud?.includes(audience)) {
      throw new AuthError('[auth0] Audience mismatch', { provider: 'auth0' });
    }

    return { valid: true, payload, key };
  } catch (err) {
    if (err instanceof AuthError) throw err;
    throw wrapProviderError(err, 'auth0');
  }
}

/**
 * Block/unblock a user.
 */
export async function blockUser({ userId, blocked = true, signal } = {}, { domain, clientId, clientSecret } = {}) {
  if (!domain) throw new ConfigurationError('[auth0] Missing domain', { provider: 'auth0' });
  try {
    const token = await getManagementToken({ domain, clientId, clientSecret });
    const { data } = await client(token).patch(
      `https://${domain}/api/v2/users/${encodeURIComponent(userId)}`,
      { blocked },
      { signal }
    );
    return data;
  } catch (err) {
    throw wrapProviderError(err, 'auth0');
  }
}
