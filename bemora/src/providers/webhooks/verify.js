/**
 * Unified webhook signature verification.
 *
 * Usage:
 *   import { verify } from './webhooks/verify.js';
 *   const ok = verify('stripe', { payload, signature, secret });
 *
 * Supported: stripe, twilio, github, clerk, resend, sendgrid, paypal
 */

import { createHmac, createVerify, timingSafeEqual } from 'node:crypto';

// ── Helpers ───────────────────────────────────────────────────────────────────

function bufferEqual(a, b) {
  try {
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

function hexEqual(a, b) {
  try {
    return bufferEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'));
  } catch {
    return false;
  }
}

// ── Stripe ────────────────────────────────────────────────────────────────────

/**
 * Verify a Stripe webhook signature (v1 scheme).
 * @param {{ payload: string|Buffer, signature: string, secret: string, tolerance?: number }} params
 * @returns {{ valid: boolean, event?: object, error?: string }}
 */
export function verifyStripeWebhook({ payload, signature, secret, tolerance = 300 }) {
  try {
    const payloadStr = Buffer.isBuffer(payload) ? payload.toString('utf8') : payload;
    const parts = (signature || '').split(',').reduce((acc, pair) => {
      const [k, v] = pair.split('=');
      if (!acc[k]) acc[k] = [];
      acc[k].push(v);
      return acc;
    }, {});

    const timestamp = parts.t?.[0];
    const signatures = parts.v1 || [];
    if (!timestamp || signatures.length === 0) return { valid: false, error: 'Missing timestamp or signature' };

    const ts = parseInt(timestamp, 10);
    if (Math.abs(Date.now() / 1000 - ts) > tolerance) {
      return { valid: false, error: 'Timestamp outside tolerance window' };
    }

    const expectedHmac = createHmac('sha256', secret)
      .update(`${timestamp}.${payloadStr}`)
      .digest('hex');

    const match = signatures.some((s) => hexEqual(s, expectedHmac));
    if (!match) return { valid: false, error: 'Signature mismatch' };

    try {
      return { valid: true, event: JSON.parse(payloadStr) };
    } catch {
      return { valid: true };
    }
  } catch (err) {
    return { valid: false, error: err.message };
  }
}

// ── Twilio ────────────────────────────────────────────────────────────────────

/**
 * Verify a Twilio webhook signature.
 * @param {{ url: string, params: object, signature: string, authToken: string }} params
 * @returns {boolean}
 */
export function verifyTwilioWebhook({ url, params = {}, signature, authToken }) {
  try {
    // Sort parameters alphabetically and append to URL
    const sortedParams = Object.keys(params).sort().reduce((acc, k) => acc + k + params[k], '');
    const stringToSign = url + sortedParams;
    const expected = createHmac('sha1', authToken).update(stringToSign).digest('base64');
    return bufferEqual(Buffer.from(expected, 'base64'), Buffer.from(signature || '', 'base64'));
  } catch {
    return false;
  }
}

// ── GitHub ────────────────────────────────────────────────────────────────────

/**
 * Verify a GitHub webhook signature (sha256 scheme).
 * @param {{ payload: string|Buffer, signature: string, secret: string }} params
 * @returns {boolean}
 */
export function verifyGitHubWebhook({ payload, signature, secret }) {
  try {
    const payloadStr = Buffer.isBuffer(payload) ? payload.toString('utf8') : payload;
    const expected = 'sha256=' + createHmac('sha256', secret).update(payloadStr).digest('hex');
    return bufferEqual(Buffer.from(expected), Buffer.from(signature || ''));
  } catch {
    return false;
  }
}

// ── Clerk ─────────────────────────────────────────────────────────────────────

/**
 * Verify a Clerk webhook signature (Svix-based).
 * @param {{ payload: string|Buffer, headers: object, secret: string }} params
 * @returns {{ valid: boolean, event?: object, error?: string }}
 */
export function verifyClerkWebhook({ payload, headers = {}, secret }) {
  try {
    const msgId = headers['svix-id'] || headers['webhook-id'];
    const timestamp = headers['svix-timestamp'] || headers['webhook-timestamp'];
    const sigHeader = headers['svix-signature'] || headers['webhook-signature'];

    if (!msgId || !timestamp || !sigHeader) {
      return { valid: false, error: 'Missing Svix headers' };
    }

    const payloadStr = Buffer.isBuffer(payload) ? payload.toString('utf8') : payload;
    const toSign = `${msgId}.${timestamp}.${payloadStr}`;

    // Clerk uses a base64-encoded secret prefixed with "whsec_"
    const rawSecret = secret.startsWith('whsec_')
      ? Buffer.from(secret.slice(6), 'base64')
      : Buffer.from(secret, 'base64');

    const expectedSig = createHmac('sha256', rawSecret).update(toSign).digest('base64');
    const signatures = sigHeader.split(' ').map((s) => s.replace(/^v\d+,/, ''));
    const valid = signatures.some((s) => bufferEqual(Buffer.from(s, 'base64'), Buffer.from(expectedSig, 'base64')));

    if (!valid) return { valid: false, error: 'Signature mismatch' };

    try {
      return { valid: true, event: JSON.parse(payloadStr) };
    } catch {
      return { valid: true };
    }
  } catch (err) {
    return { valid: false, error: err.message };
  }
}

// ── Resend ────────────────────────────────────────────────────────────────────

/**
 * Verify a Resend webhook signature (Svix-based, same pattern as Clerk).
 */
export function verifyResendWebhook({ payload, headers = {}, secret }) {
  return verifyClerkWebhook({ payload, headers, secret });
}

// ── SendGrid ──────────────────────────────────────────────────────────────────

/**
 * Verify a SendGrid Event Webhook signature.
 * @param {{ payload: string|Buffer, signature: string, timestamp: string, publicKey: string }} params
 */
/**
 * Verify a SendGrid Event Webhook signature (ECDSA P-256 with Node 15+ `crypto.verify`).
 * @param {{ payload: string|Buffer, signature: string, timestamp: string, publicKey: string }} params
 *   - signature: the value of the `X-Twilio-Email-Event-Webhook-Signature` header (base64)
 *   - timestamp:  the value of the `X-Twilio-Email-Event-Webhook-Timestamp` header
 *   - publicKey:  the ECDSA public key from SendGrid Dashboard (PEM format)
 */
/**
 * Verify a SendGrid Event Webhook signature (ECDSA P-256, sha256).
 * @param {{ payload: string|Buffer, signature: string, timestamp: string, publicKey: string }} params
 *   - signature: `X-Twilio-Email-Event-Webhook-Signature` header value (base64)
 *   - timestamp:  `X-Twilio-Email-Event-Webhook-Timestamp` header value
 *   - publicKey:  ECDSA public key from the SendGrid Dashboard (PEM format)
 */
export function verifySendGridWebhook({ payload, signature, timestamp, publicKey }) {
  try {
    if (!signature || !timestamp || !publicKey) {
      return { valid: false, error: 'Missing signature, timestamp, or publicKey' };
    }

    // Reject if timestamp is outside 5-minute window
    const ts = Number(timestamp);
    if (!Number.isFinite(ts) || Math.abs(Date.now() / 1000 - ts) > 300) {
      return { valid: false, error: 'Timestamp outside tolerance window' };
    }

    const payloadStr = Buffer.isBuffer(payload) ? payload.toString('utf8') : payload;
    const toVerify = timestamp + payloadStr;

    // SendGrid signs `timestamp + rawBody` with ECDSA P-256 using sha256
    const verifier = createVerify('sha256');
    verifier.update(toVerify, 'utf8');
    const valid = verifier.verify(publicKey, signature, 'base64');
    return { valid };
  } catch (err) {
    return { valid: false, error: err.message };
  }
}

// ── PayPal ────────────────────────────────────────────────────────────────────

/**
 * Verify a PayPal webhook via PayPal's verification API (recommended approach).
 * Returns true/false by calling PayPal's API to confirm authenticity.
 */
export async function verifyPayPalWebhook({ transmissionId, transmissionTime, certUrl, authAlgo, transmissionSig, webhookId, webhookEvent, accessToken, sandbox = false }) {
  try {
    const base = sandbox ? 'https://api-m.sandbox.paypal.com' : 'https://api-m.paypal.com';
    const { httpClient } = await import('../../../core/http.js');
    const http = httpClient({ timeout: 10_000, headers: { Authorization: `Bearer ${accessToken}` } });
    const { data } = await http.post(`${base}/v1/notifications/verify-webhook-signature`, {
      transmission_id: transmissionId,
      transmission_time: transmissionTime,
      cert_url: certUrl,
      auth_algo: authAlgo,
      transmission_sig: transmissionSig,
      webhook_id: webhookId,
      webhook_event: webhookEvent,
    });
    return { valid: data.verification_status === 'SUCCESS', status: data.verification_status };
  } catch (err) {
    return { valid: false, error: err.message };
  }
}

// ── Unified entry point ───────────────────────────────────────────────────────

const VERIFIERS = {
  stripe: verifyStripeWebhook,
  twilio: verifyTwilioWebhook,
  github: verifyGitHubWebhook,
  clerk: verifyClerkWebhook,
  resend: verifyResendWebhook,
  sendgrid: verifySendGridWebhook,
};

/**
 * Unified webhook verification.
 * @param {'stripe'|'twilio'|'github'|'clerk'|'resend'|'sendgrid'|'paypal'} provider
 * @param {object} params - provider-specific params
 * @returns {boolean|object}
 */
export function verify(provider, params) {
  const fn = VERIFIERS[provider.toLowerCase()];
  if (!fn) throw new Error(`[webhooks] Unknown provider: "${provider}". Supported: ${Object.keys(VERIFIERS).join(', ')}`);
  return fn(params);
}
