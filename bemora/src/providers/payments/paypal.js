/**
 * PayPal provider — Orders, Capture, Refunds.
 * Uses the PayPal REST API v2 with OAuth2 client-credentials.
 */

import { httpClient } from '../../core/http.js';
import { wrapProviderError, ConfigurationError } from '../../core/errors.js';

const BASE = 'https://api-m.paypal.com';
const SANDBOX_BASE = 'https://api-m.sandbox.paypal.com';

/** Cache access tokens to avoid a round-trip on every call. */
const _tokenCache = new Map();

async function getAccessToken({ clientId, clientSecret, sandbox = false }) {
  const cacheKey = `${clientId}:${sandbox}`;
  const cached = _tokenCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.token;

  const base = sandbox ? SANDBOX_BASE : BASE;
  const http = httpClient({ timeout: 10_000 });
  const { data } = await http.post(
    `${base}/v1/oauth2/token`,
    'grant_type=client_credentials',
    {
      auth: { username: clientId, password: clientSecret },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }
  );
  _tokenCache.set(cacheKey, { token: data.access_token, expiresAt: Date.now() + (data.expires_in - 60) * 1000 });
  return data.access_token;
}

function client(token, sandbox = false) {
  const base = sandbox ? SANDBOX_BASE : BASE;
  return { base, http: httpClient({ timeout: 15_000, headers: { Authorization: `Bearer ${token}` } }) };
}

// ── Orders ────────────────────────────────────────────────────────────────────

/**
 * Create a PayPal Order.
 * @param {{ amount: number, currency: string, description?: string, signal?: AbortSignal }} params
 * @param {{ clientId: string, clientSecret: string, sandbox?: boolean }} credentials
 */
export async function createOrder({ amount, currency = 'USD', description, returnUrl, cancelUrl, signal } = {}, { clientId, clientSecret, sandbox = false } = {}) {
  try {
    const token = await getAccessToken({ clientId, clientSecret, sandbox });
    const { base, http } = client(token, sandbox);
    const body = {
      intent: 'CAPTURE',
      purchase_units: [{ amount: { currency_code: currency, value: String(amount) }, description }],
      ...(returnUrl && {
        application_context: { return_url: returnUrl, cancel_url: cancelUrl },
      }),
    };
    const { data } = await http.post(`${base}/v2/checkout/orders`, body, {
      headers: { 'Content-Type': 'application/json' },
      signal,
    });
    const approveLink = data.links?.find((l) => l.rel === 'approve')?.href;
    return { ...data, approveUrl: approveLink };
  } catch (err) {
    throw wrapProviderError(err, 'paypal');
  }
}

/**
 * Get an Order by ID.
 */
export async function getOrder({ id, signal } = {}, { clientId, clientSecret, sandbox = false } = {}) {
  try {
    const token = await getAccessToken({ clientId, clientSecret, sandbox });
    const { base, http } = client(token, sandbox);
    const { data } = await http.get(`${base}/v2/checkout/orders/${id}`, { signal });
    return data;
  } catch (err) {
    throw wrapProviderError(err, 'paypal');
  }
}

/**
 * Capture an approved PayPal Order.
 */
export async function captureOrder({ id, signal } = {}, { clientId, clientSecret, sandbox = false } = {}) {
  try {
    const token = await getAccessToken({ clientId, clientSecret, sandbox });
    const { base, http } = client(token, sandbox);
    const { data } = await http.post(`${base}/v2/checkout/orders/${id}/capture`, {}, {
      headers: { 'Content-Type': 'application/json' },
      signal,
    });
    return data;
  } catch (err) {
    throw wrapProviderError(err, 'paypal');
  }
}

// ── Refunds ───────────────────────────────────────────────────────────────────

/**
 * Refund a captured payment.
 * @param {{ captureId: string, amount?: number, currency?: string, note?: string, signal?: AbortSignal }} params
 */
export async function refundCapture({ captureId, amount, currency = 'USD', note, signal } = {}, { clientId, clientSecret, sandbox = false } = {}) {
  try {
    const token = await getAccessToken({ clientId, clientSecret, sandbox });
    const { base, http } = client(token, sandbox);
    const body = {
      ...(amount && { amount: { value: String(amount), currency_code: currency } }),
      ...(note && { note_to_payer: note }),
    };
    const { data } = await http.post(`${base}/v2/payments/captures/${captureId}/refund`, body, {
      headers: { 'Content-Type': 'application/json' },
      signal,
    });
    return data;
  } catch (err) {
    throw wrapProviderError(err, 'paypal');
  }
}

export async function getRefund({ id, signal } = {}, { clientId, clientSecret, sandbox = false } = {}) {
  try {
    const token = await getAccessToken({ clientId, clientSecret, sandbox });
    const { base, http } = client(token, sandbox);
    const { data } = await http.get(`${base}/v2/payments/refunds/${id}`, { signal });
    return data;
  } catch (err) {
    throw wrapProviderError(err, 'paypal');
  }
}
