/**
 * Stripe provider — Payments, Customers, Subscriptions, Refunds, Webhooks.
 *
 * All methods accept an optional `signal` (AbortSignal) for cancellation:
 *   await stripe.createCharge({ amount: 2000, currency: 'usd', ... }, apiKey, { signal })
 */

import { httpClient } from '../../core/http.js';
import { wrapProviderError, AuthError, ConfigurationError } from '../../core/errors.js';
import { verifyStripeWebhook } from '../webhooks/verify.js';

/** Validate that an API key is present before making any network call. */
function requireKey(apiKey) {
  if (!apiKey) {
    throw new ConfigurationError(
      '[stripe] Missing apiKey — pass your Stripe secret key as the second argument.',
      { provider: 'stripe' }
    );
  }
}

const BASE = 'https://api.stripe.com/v1';

function client(apiKey) {
  return httpClient({
    timeout: 15_000,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
}

/** Encode a plain JS object as URL-encoded form data (Stripe's format). */
function encode(obj, prefix = '') {
  const parts = [];
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}[${k}]` : k;
    if (v !== null && v !== undefined) {
      if (typeof v === 'object' && !Array.isArray(v)) {
        parts.push(...encode(v, key).split('&'));
      } else if (Array.isArray(v)) {
        v.forEach((item, i) => parts.push(`${key}[${i}]=${encodeURIComponent(item)}`));
      } else {
        parts.push(`${key}=${encodeURIComponent(v)}`);
      }
    }
  }
  return parts.filter(Boolean).join('&');
}

// ── Charges ──────────────────────────────────────────────────────────────────

/**
 * Create a charge.
 * @param {{ amount: number, currency: string, source?: string, customerId?: string, description?: string, metadata?: object, idempotencyKey?: string, signal?: AbortSignal }} params
 * @param {string} apiKey
 */
export async function createCharge({ amount, currency, source, customerId, description, metadata, idempotencyKey, signal } = {}, apiKey) {
  requireKey(apiKey);
  try {
    const body = encode({ amount, currency, source, customer: customerId, description, metadata });
    const headers = idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {};
    const { data } = await client(apiKey).post(`${BASE}/charges`, body, { signal, headers });
    return data;
  } catch (err) {
    throw wrapProviderError(err, 'stripe');
  }
}

/**
 * Retrieve a charge by ID.
 */
export async function getCharge({ id, signal } = {}, apiKey) {
  requireKey(apiKey);
  try {
    const { data } = await client(apiKey).get(`${BASE}/charges/${id}`, { signal });
    return data;
  } catch (err) {
    throw wrapProviderError(err, 'stripe');
  }
}

/**
 * List charges.
 */
export async function listCharges({ limit = 10, customerId, signal } = {}, apiKey) {
  requireKey(apiKey);
  try {
    const params = { limit, ...(customerId && { customer: customerId }) };
    const { data } = await client(apiKey).get(`${BASE}/charges`, { params, signal });
    return data;
  } catch (err) {
    throw wrapProviderError(err, 'stripe');
  }
}

// ── PaymentIntents ────────────────────────────────────────────────────────────

/**
 * Create a PaymentIntent (preferred over raw charges).
 * @param {{ amount: number, currency: string, customerId?: string, paymentMethodId?: string, confirm?: boolean, metadata?: object, idempotencyKey?: string, signal?: AbortSignal }} params
 * @param {string} apiKey
 */
export async function createPaymentIntent({ amount, currency, customerId, paymentMethodId, confirm = false, metadata, idempotencyKey, signal } = {}, apiKey) {
  requireKey(apiKey);
  try {
    const body = encode({
      amount, currency,
      customer: customerId,
      payment_method: paymentMethodId,
      confirm,
      metadata,
    });
    const headers = idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {};
    const { data } = await client(apiKey).post(`${BASE}/payment_intents`, body, { signal, headers });
    return data;
  } catch (err) {
    throw wrapProviderError(err, 'stripe');
  }
}

export async function confirmPaymentIntent({ id, paymentMethodId, signal } = {}, apiKey) {
  requireKey(apiKey);
  try {
    const body = encode({ payment_method: paymentMethodId });
    const { data } = await client(apiKey).post(`${BASE}/payment_intents/${id}/confirm`, body, { signal });
    return data;
  } catch (err) {
    throw wrapProviderError(err, 'stripe');
  }
}

// ── Customers ─────────────────────────────────────────────────────────────────

export async function createCustomer({ email, name, phone, metadata, signal } = {}, apiKey) {
  requireKey(apiKey);
  try {
    const { data } = await client(apiKey).post(`${BASE}/customers`, encode({ email, name, phone, metadata }), { signal });
    return data;
  } catch (err) {
    throw wrapProviderError(err, 'stripe');
  }
}

export async function getCustomer({ id, signal } = {}, apiKey) {
  requireKey(apiKey);
  try {
    const { data } = await client(apiKey).get(`${BASE}/customers/${id}`, { signal });
    return data;
  } catch (err) {
    throw wrapProviderError(err, 'stripe');
  }
}

export async function updateCustomer({ id, email, name, phone, metadata, signal } = {}, apiKey) {
  requireKey(apiKey);
  try {
    const { data } = await client(apiKey).post(`${BASE}/customers/${id}`, encode({ email, name, phone, metadata }), { signal });
    return data;
  } catch (err) {
    throw wrapProviderError(err, 'stripe');
  }
}

export async function listCustomers({ limit = 10, email, signal } = {}, apiKey) {
  requireKey(apiKey);
  try {
    const { data } = await client(apiKey).get(`${BASE}/customers`, { params: { limit, email }, signal });
    return data;
  } catch (err) {
    throw wrapProviderError(err, 'stripe');
  }
}

export async function deleteCustomer({ id, signal } = {}, apiKey) {
  requireKey(apiKey);
  try {
    const { data } = await client(apiKey).delete(`${BASE}/customers/${id}`, { signal });
    return data;
  } catch (err) {
    throw wrapProviderError(err, 'stripe');
  }
}

// ── Subscriptions ────────────────────────────────────────────────────────────

export async function createSubscription({ customerId, items, trialDays, metadata, signal } = {}, apiKey) {
  requireKey(apiKey);
  try {
    const body = {
      customer: customerId,
      items: items.map((item) => ({ price: item.priceId, quantity: item.quantity })),
      ...(trialDays && { trial_period_days: trialDays }),
      metadata,
    };
    const { data } = await client(apiKey).post(`${BASE}/subscriptions`, encode(body), { signal });
    return data;
  } catch (err) {
    throw wrapProviderError(err, 'stripe');
  }
}

export async function getSubscription({ id, signal } = {}, apiKey) {
  requireKey(apiKey);
  try {
    const { data } = await client(apiKey).get(`${BASE}/subscriptions/${id}`, { signal });
    return data;
  } catch (err) {
    throw wrapProviderError(err, 'stripe');
  }
}

export async function cancelSubscription({ id, immediately = false, signal } = {}, apiKey) {
  requireKey(apiKey);
  try {
    if (immediately) {
      const { data } = await client(apiKey).delete(`${BASE}/subscriptions/${id}`, { signal });
      return data;
    }
    const { data } = await client(apiKey).post(`${BASE}/subscriptions/${id}`, encode({ cancel_at_period_end: true }), { signal });
    return data;
  } catch (err) {
    throw wrapProviderError(err, 'stripe');
  }
}

export async function listSubscriptions({ customerId, status, limit = 10, signal } = {}, apiKey) {
  requireKey(apiKey);
  try {
    const { data } = await client(apiKey).get(`${BASE}/subscriptions`, {
      params: { customer: customerId, status, limit },
      signal,
    });
    return data;
  } catch (err) {
    throw wrapProviderError(err, 'stripe');
  }
}

// ── Refunds ───────────────────────────────────────────────────────────────────

export async function createRefund({ chargeId, paymentIntentId, amount, reason, signal } = {}, apiKey) {
  requireKey(apiKey);
  try {
    const body = encode({
      charge: chargeId,
      payment_intent: paymentIntentId,
      amount,
      reason,
    });
    const { data } = await client(apiKey).post(`${BASE}/refunds`, body, { signal });
    return data;
  } catch (err) {
    throw wrapProviderError(err, 'stripe');
  }
}

export async function getRefund({ id, signal } = {}, apiKey) {
  requireKey(apiKey);
  try {
    const { data } = await client(apiKey).get(`${BASE}/refunds/${id}`, { signal });
    return data;
  } catch (err) {
    throw wrapProviderError(err, 'stripe');
  }
}

// ── Webhooks ──────────────────────────────────────────────────────────────────

/**
 * Verify a Stripe webhook signature and parse the event.
 * @param {{ payload: string|Buffer, signature: string, secret: string }} params
 * @returns {{ valid: boolean, event?: object }}
 */
export function verifyWebhook({ payload, signature, secret }) {
  return verifyStripeWebhook({ payload, signature, secret });
}
