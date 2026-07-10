/**
 * Twilio SMS provider — send(), lookup(), webhook verify.
 */

import { httpClient } from '../../core/http.js';
import { wrapProviderError, ConfigurationError } from '../../core/errors.js';
import { verifyTwilioWebhook } from '../webhooks/verify.js';

const MESSAGES_URL = (accountSid) =>
  `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
const LOOKUP_URL = (phone) =>
  `https://lookups.twilio.com/v1/PhoneNumbers/${encodeURIComponent(phone)}`;

function client(accountSid, authToken) {
  return httpClient({
    timeout: 15_000,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
}

/** URL-encode a plain object. */
function encode(obj) {
  return Object.entries(obj)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
}

/**
 * Send an SMS.
 * @param {{ to: string, from: string, body: string, mediaUrl?: string, signal?: AbortSignal }} params
 * @param {{ accountSid: string, authToken: string }} credentials
 */
export async function send({ to, from, body, mediaUrl, signal } = {}, { accountSid, authToken } = {}) {
  if (!accountSid || !authToken) {
    throw new ConfigurationError('[twilio] Missing accountSid or authToken', { provider: 'twilio' });
  }
  try {
    const http = httpClient({ timeout: 15_000, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
    const { data } = await http.post(
      MESSAGES_URL(accountSid),
      encode({ To: to, From: from, Body: body, ...(mediaUrl && { MediaUrl: mediaUrl }) }),
      { auth: { username: accountSid, password: authToken }, signal }
    );
    return {
      sid: data.sid,
      status: data.status,
      to: data.to,
      from: data.from,
      body: data.body,
      direction: data.direction,
      price: data.price,
      dateSent: data.date_sent,
    };
  } catch (err) {
    throw wrapProviderError(err, 'twilio');
  }
}

/**
 * Look up a phone number for carrier/type info.
 * @param {{ phone: string, type?: string[], signal?: AbortSignal }} params
 */
export async function lookup({ phone, type = ['carrier', 'caller-name'], signal } = {}, { accountSid, authToken } = {}) {
  if (!accountSid || !authToken) {
    throw new ConfigurationError('[twilio] Missing accountSid or authToken', { provider: 'twilio' });
  }
  try {
    const http = httpClient({ timeout: 15_000 });
    const { data } = await http.get(LOOKUP_URL(phone), {
      params: { Type: type },
      auth: { username: accountSid, password: authToken },
      signal,
    });
    return data;
  } catch (err) {
    throw wrapProviderError(err, 'twilio');
  }
}

/**
 * List messages sent/received from the account.
 */
export async function listMessages({ to, from, dateSent, limit = 20, signal } = {}, { accountSid, authToken } = {}) {
  if (!accountSid || !authToken) {
    throw new ConfigurationError('[twilio] Missing accountSid or authToken', { provider: 'twilio' });
  }
  try {
    const http = httpClient({ timeout: 15_000 });
    const { data } = await http.get(MESSAGES_URL(accountSid), {
      params: { To: to, From: from, DateSent: dateSent, PageSize: limit },
      auth: { username: accountSid, password: authToken },
      signal,
    });
    return data;
  } catch (err) {
    throw wrapProviderError(err, 'twilio');
  }
}

/**
 * Verify a Twilio webhook request signature.
 * @param {{ url: string, params: object, signature: string, authToken: string }} params
 * @returns {boolean}
 */
export function verifyWebhook({ url, params, signature, authToken }) {
  return verifyTwilioWebhook({ url, params, signature, authToken });
}
