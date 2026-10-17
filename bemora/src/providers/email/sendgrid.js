/**
 * SendGrid email provider — send(), batch(), webhook verify.
 */

import { httpClient } from '../../core/http.js';
import { wrapProviderError } from '../../core/errors.js';
import { verifySendGridWebhook } from '../webhooks/verify.js';

const BASE = 'https://api.sendgrid.com/v3';

function client(apiKey) {
  return httpClient({ timeout: 15_000, headers: { Authorization: `Bearer ${apiKey}` } });
}

/**
 * Send a single email.
 * @param {{ to: string|string[], from: string, subject: string, text?: string, html?: string, replyTo?: string, templateId?: string, dynamicTemplateData?: object, signal?: AbortSignal }} params
 * @param {string} apiKey
 */
export async function send({ to, from, subject, text, html, replyTo, templateId, dynamicTemplateData, signal } = {}, apiKey) {
  try {
    const toArr = Array.isArray(to) ? to : [to];
    const body = {
      personalizations: [{ to: toArr.map((email) => ({ email })) }],
      from: { email: from },
      subject,
      ...(replyTo && { reply_to: { email: replyTo } }),
      ...(text && { content: [{ type: 'text/plain', value: text }] }),
      ...(html && { content: [{ type: 'text/html', value: html }] }),
      ...(templateId && { template_id: templateId }),
      ...(dynamicTemplateData && {
        personalizations: [{ to: toArr.map((email) => ({ email })), dynamic_template_data: dynamicTemplateData }],
      }),
    };
    const { data, status } = await client(apiKey).post(`${BASE}/mail/send`, body, { signal });
    return { success: status === 202, messageId: null };
  } catch (err) {
    throw wrapProviderError(err, 'sendgrid');
  }
}

/**
 * Send multiple emails in a batch (uses personalizations array).
 * @param {{ messages: Array<{ to: string, subject?: string, dynamicTemplateData?: object }>, from: string, templateId?: string, signal?: AbortSignal }} params
 * @param {string} apiKey
 */
export async function batch({ messages, from, subject, templateId, signal } = {}, apiKey) {
  try {
    const personalizations = messages.map((m) => ({
      to: [{ email: m.to }],
      subject: m.subject || subject,
      ...(m.dynamicTemplateData && { dynamic_template_data: m.dynamicTemplateData }),
    }));
    const body = {
      personalizations,
      from: { email: from },
      subject,
      ...(templateId && { template_id: templateId }),
    };
    const { status } = await client(apiKey).post(`${BASE}/mail/send`, body, { signal });
    return { success: status === 202, count: messages.length };
  } catch (err) {
    throw wrapProviderError(err, 'sendgrid');
  }
}

/**
 * Verify a SendGrid inbound/event webhook.
 */
export function verifyWebhook({ payload, signature, publicKey }) {
  return verifySendGridWebhook({ payload, signature, publicKey });
}

/**
 * Get email statistics.
 */
export async function stats({ startDate, endDate, signal } = {}, apiKey) {
  try {
    const { data } = await client(apiKey).get(`${BASE}/stats`, {
      params: { start_date: startDate, end_date: endDate },
      signal,
    });
    return data;
  } catch (err) {
    throw wrapProviderError(err, 'sendgrid');
  }
}

/**
 * List suppressed (unsubscribed) email addresses.
 */
export async function getSuppressions({ limit = 100, signal } = {}, apiKey) {
  try {
    const { data } = await client(apiKey).get(`${BASE}/suppression/unsubscribes`, { params: { limit }, signal });
    return data;
  } catch (err) {
    throw wrapProviderError(err, 'sendgrid');
  }
}
