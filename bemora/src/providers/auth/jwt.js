/**
 * JWT auth helpers — sign(), verify(), refresh().
 * Pure Node.js implementation using the built-in `crypto` module.
 * No external dependencies.
 */

import { createHmac, createHash, randomBytes } from 'node:crypto';
import { ConfigurationError, AuthError } from '../../core/errors.js';

// ── Encoding helpers ──────────────────────────────────────────────────────────

function b64uEncode(str) {
  return Buffer.from(str).toString('base64url');
}

function b64uDecode(str) {
  return Buffer.from(str, 'base64url').toString('utf8');
}

function jsonB64u(obj) {
  return b64uEncode(JSON.stringify(obj));
}

// ── HMAC sign/verify ──────────────────────────────────────────────────────────

const ALGORITHMS = {
  HS256: 'sha256',
  HS384: 'sha384',
  HS512: 'sha512',
};

function hmacSign(input, secret, algo) {
  return createHmac(ALGORITHMS[algo], secret).update(input).digest('base64url');
}

function hmacVerify(input, sig, secret, algo) {
  const expected = hmacSign(input, secret, algo);
  // Constant-time comparison to prevent timing attacks
  if (expected.length !== sig.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  }
  return diff === 0;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Sign a JWT.
 * @param {{ payload: object, secret: string, expiresIn?: number, algorithm?: string, issuer?: string, audience?: string, jti?: boolean }} params
 * @returns {string} Signed JWT
 */
export function sign({ payload, secret, expiresIn = 3600, algorithm = 'HS256', issuer, audience, jti = false } = {}) {
  if (!secret) throw new ConfigurationError('[jwt] Missing secret', { provider: 'jwt' });
  if (!ALGORITHMS[algorithm]) throw new ConfigurationError(`[jwt] Unsupported algorithm: ${algorithm}`, { provider: 'jwt' });

  const now = Math.floor(Date.now() / 1000);
  const claims = {
    ...payload,
    iat: now,
    ...(expiresIn && { exp: now + expiresIn }),
    ...(issuer && { iss: issuer }),
    ...(audience && { aud: audience }),
    ...(jti && { jti: randomBytes(16).toString('hex') }),
  };

  const header = jsonB64u({ alg: algorithm, typ: 'JWT' });
  const body = jsonB64u(claims);
  const sig = hmacSign(`${header}.${body}`, secret, algorithm);
  return `${header}.${body}.${sig}`;
}

/**
 * Verify and decode a JWT.
 * @param {{ token: string, secret: string, algorithm?: string, issuer?: string, audience?: string, clockTolerance?: number }} params
 * @returns {{ header: object, payload: object }}
 */
export function verify({ token, secret, algorithm = 'HS256', issuer, audience, clockTolerance = 0 } = {}) {
  if (!token) throw new AuthError('[jwt] Missing token', { provider: 'jwt' });
  if (!secret) throw new ConfigurationError('[jwt] Missing secret', { provider: 'jwt' });

  const parts = token.split('.');
  if (parts.length !== 3) throw new AuthError('[jwt] Invalid token format', { provider: 'jwt' });

  const [headerB64, bodyB64, sig] = parts;

  let header, payload;
  try {
    header = JSON.parse(b64uDecode(headerB64));
    payload = JSON.parse(b64uDecode(bodyB64));
  } catch {
    throw new AuthError('[jwt] Malformed token (invalid JSON)', { provider: 'jwt' });
  }

  if (!ALGORITHMS[algorithm]) throw new ConfigurationError(`[jwt] Unsupported algorithm: ${algorithm}`, { provider: 'jwt' });

  if (!hmacVerify(`${headerB64}.${bodyB64}`, sig, secret, algorithm)) {
    throw new AuthError('[jwt] Invalid signature', { provider: 'jwt' });
  }

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp + clockTolerance < now) {
    throw new AuthError(`[jwt] Token expired at ${new Date(payload.exp * 1000).toISOString()}`, { provider: 'jwt' });
  }
  if (payload.nbf && payload.nbf - clockTolerance > now) {
    throw new AuthError('[jwt] Token not yet valid (nbf)', { provider: 'jwt' });
  }
  if (issuer && payload.iss !== issuer) {
    throw new AuthError(`[jwt] Issuer mismatch: expected "${issuer}", got "${payload.iss}"`, { provider: 'jwt' });
  }
  if (audience) {
    const audList = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
    const audTarget = Array.isArray(audience) ? audience : [audience];
    if (!audTarget.some((a) => audList.includes(a))) {
      throw new AuthError('[jwt] Audience mismatch', { provider: 'jwt' });
    }
  }

  return { header, payload };
}

/**
 * Decode a JWT without verifying (useful for inspecting headers/payload).
 * @param {string} token
 */
export function decode(token) {
  const parts = token?.split('.');
  if (!parts || parts.length !== 3) throw new AuthError('[jwt] Invalid token format', { provider: 'jwt' });
  try {
    return {
      header: JSON.parse(b64uDecode(parts[0])),
      payload: JSON.parse(b64uDecode(parts[1])),
    };
  } catch {
    throw new AuthError('[jwt] Malformed token', { provider: 'jwt' });
  }
}

/**
 * Refresh a JWT — re-signs with a new exp, validating the old one first (ignoring expiry).
 * @param {{ token: string, secret: string, expiresIn?: number, algorithm?: string }} params
 */
export function refresh({ token, secret, expiresIn = 3600, algorithm = 'HS256' } = {}) {
  // Decode without expiry check to allow refresh of recently expired tokens
  const parts = token?.split('.');
  if (!parts || parts.length !== 3) throw new AuthError('[jwt] Invalid token format', { provider: 'jwt' });

  let payload;
  try {
    payload = JSON.parse(b64uDecode(parts[1]));
  } catch {
    throw new AuthError('[jwt] Malformed token', { provider: 'jwt' });
  }

  // Verify signature (but not expiry)
  if (!hmacVerify(`${parts[0]}.${parts[1]}`, parts[2], secret, algorithm)) {
    throw new AuthError('[jwt] Invalid signature — cannot refresh', { provider: 'jwt' });
  }

  // Strip timing claims and re-sign
  const { iat, exp, ...rest } = payload;
  return sign({ payload: rest, secret, expiresIn, algorithm });
}

/**
 * Generate a random token suitable for use as a refresh token or API secret.
 * @param {number} bytes
 */
export function generateSecret(bytes = 32) {
  return randomBytes(bytes).toString('hex');
}
