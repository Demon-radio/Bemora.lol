/**
 * Resend email provider — send(), batch(), webhook verify.
 * Simple modern email API with excellent deliverability.
 */

import { httpClient } from '../../core/http.js';
import { wrapProviderError } from '../../core/errors.js';
import { verifyResendWebhook } from '../webhooks/verify.js';

const BASE = 'https://api.resend.com';

function client(apiKey) {
  return httpClient({ timeout: 15_000, headers: { Authorization: `Bearer ${apiKey}` } });
}

/**
 * Send a single email.
 * @param {{ to: string|string[], from: string, subject: string, text?: string, html?: string, replyTo?: string|string[], cc?: string|string[], bcc?: string|string[], tags?: Array<{name,value}>, signal?: AbortSignal }} params
 * @param {string} apiKey
 */
export async function send({ to, from, subject, text, html, replyTo, cc, bcc, tags, signal } = {}, apiKey) {
  try {
    const body = {
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      ...(text && { text }),
      ...(html && { html }),
      ...(replyTo && { reply_to: Array.isArray(replyTo) ? replyTo : [replyTo] }),
      ...(cc && { cc: Array.isArray(cc) ? cc : [cc] }),
      ...(bcc && { bcc: Array.isArray(bcc) ? bcc : [bcc] }),
      ...(tags && { tags }),
    };
    const { data } = await client(apiKey).post(`${BASE}/emails`, body, { signal });
    return { success: true, id: data.id };
  } catch (err) {
    throw wrapProviderError(err, 'resend');
  }
}

/**
 * Send a batch of emails (up to 100 at once).
 * @param {{ messages: Array<{ to, from, subject, text?, html? }>, signal?: AbortSignal }} params
 * @param {string} apiKey
 */
export async function batch({ messages, signal } = {}, apiKey) {
  try {
    const normalized = messages.map((m) => ({
      from: m.from,
      to: Array.isArray(m.to) ? m.to : [m.to],
      subject: m.subject,
      ...(m.text && { text: m.text }),
      ...(m.html && { html: m.html }),
    }));
    const { data } = await client(apiKey).post(`${BASE}/emails/batch`, normalized, { signal });
    return { success: true, data: data.data, count: normalized.length };
  } catch (err) {
    throw wrapProviderError(err, 'resend');
  }
}

/**
 * Get email details by ID.
 */
export async function getEmail({ id, signal } = {}, apiKey) {
  try {
    const { data } = await client(apiKey).get(`${BASE}/emails/${id}`, { signal });
    return data;
  } catch (err) {
    throw wrapProviderError(err, 'resend');
  }
}

/**
 * Cancel a scheduled email.
 */
export async function cancelEmail({ id, signal } = {}, apiKey) {
  try {
    const { data } = await client(apiKey).post(`${BASE}/emails/${id}/cancel`, {}, { signal });
    return data;
  } catch (err) {
    throw wrapProviderError(err, 'resend');
  }
}

/**
 * Verify a Resend webhook signature.
 */
export function verifyWebhook({ payload, signature, secret }) {
  return verifyResendWebhook({ payload, signature, secret });
}

/**
 * List domains.
 */
export async function listDomains({ signal } = {}, apiKey) {
  try {
    const { data } = await client(apiKey).get(`${BASE}/domains`, { signal });
    return data;
  } catch (err) {
    throw wrapProviderError(err, 'resend');
  }
}
