/**
 * Cloudflare API request signing helpers.
 *
 * Cloudflare APIs use Bearer tokens (API tokens) or API keys + email.
 * Some Cloudflare endpoints (Workers AI, R2) also accept AWS SigV4.
 * This module wraps the auth header construction.
 */

import { createHmac } from 'node:crypto';

/**
 * Build Cloudflare API auth headers for a token-based request.
 * @param {{ apiToken: string }} params
 */
export function tokenHeaders({ apiToken } = {}) {
  if (!apiToken) throw new Error('[cf-signing] Missing apiToken');
  return { Authorization: `Bearer ${apiToken}` };
}

/**
 * Build Cloudflare API auth headers for a legacy API key request.
 * @param {{ apiKey: string, email: string }} params
 */
export function apiKeyHeaders({ apiKey, email } = {}) {
  if (!apiKey || !email) throw new Error('[cf-signing] Missing apiKey or email');
  return {
    'X-Auth-Key': apiKey,
    'X-Auth-Email': email,
  };
}

/**
 * Sign a Cloudflare Worker custom signing key request.
 * Some Worker patterns sign the request body/URL for internal auth.
 * @param {{ payload: string|Buffer, secret: string }} params
 */
export function signWorkerPayload({ payload, secret } = {}) {
  const data = typeof payload === 'string' ? Buffer.from(payload) : payload;
  return createHmac('sha256', secret).update(data).digest('hex');
}

/**
 * Build full authorization headers for any Cloudflare REST API call.
 * Prefer `apiToken` (scoped); fall back to `apiKey + email` (global).
 */
export function buildHeaders({ apiToken, apiKey, email } = {}) {
  if (apiToken) return tokenHeaders({ apiToken });
  if (apiKey && email) return apiKeyHeaders({ apiKey, email });
  throw new Error('[cf-signing] Supply either apiToken or apiKey+email');
}
