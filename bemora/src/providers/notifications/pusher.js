/**
 * Pusher Channels provider — trigger events, authenticate channels.
 */

import { httpClient } from '../../core/http.js';
import { wrapProviderError, ConfigurationError } from '../../core/errors.js';
import { createHmac, createHash } from 'node:crypto';

function sign(secret, str) {
  return createHmac('sha256', secret).update(str).digest('hex');
}

function md5(str) {
  return createHash('md5').update(str).digest('hex');
}

/**
 * Trigger an event on one or more channels.
 * @param {{ appId: string, key: string, secret: string, cluster?: string, channels: string|string[], event: string, data: object|string, signal?: AbortSignal }} params
 */
export async function trigger({ appId, key, secret, cluster = 'mt1', channels, event, data, signal } = {}) {
  if (!appId || !key || !secret) throw new ConfigurationError('[pusher] Missing appId, key, or secret', { provider: 'pusher' });
  try {
    const channelList = Array.isArray(channels) ? channels : [channels];
    const body = JSON.stringify({
      name: event,
      channels: channelList,
      data: typeof data === 'string' ? data : JSON.stringify(data),
    });
    const bodyMd5 = md5(body);
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const path = `/apps/${appId}/events`;
    const qs = `auth_key=${key}&auth_timestamp=${timestamp}&auth_version=1.0&body_md5=${bodyMd5}`;
    const stringToSign = `POST\n${path}\n${qs}`;
    const authSignature = sign(secret, stringToSign);
    const url = `https://api-${cluster}.pusher.com${path}?${qs}&auth_signature=${authSignature}`;
    const { data: res } = await httpClient({ timeout: 15_000 }).post(url, body, {
      headers: { 'Content-Type': 'application/json' },
      signal,
    });
    return { success: true, ...res };
  } catch (err) {
    throw wrapProviderError(err, 'pusher');
  }
}

/**
 * Authenticate a private or presence channel subscription.
 * Call from your server when Pusher requests auth for a private-* or presence-* channel.
 * @param {{ socketId: string, channel: string, key: string, secret: string, userData?: object }} params
 */
export function authenticateChannel({ socketId, channel, key, secret, userData } = {}) {
  if (!key || !secret) throw new ConfigurationError('[pusher] Missing key or secret', { provider: 'pusher' });
  const stringToSign = userData
    ? `${socketId}:${channel}:${JSON.stringify(userData)}`
    : `${socketId}:${channel}`;
  const signature = sign(secret, stringToSign);
  const auth = `${key}:${signature}`;
  return { auth, ...(userData && { channel_data: JSON.stringify(userData) }) };
}

/**
 * Get channel info.
 */
export async function getChannel({ appId, key, secret, cluster = 'mt1', channel, attributes = [], signal } = {}) {
  if (!appId || !key || !secret) throw new ConfigurationError('[pusher] Missing credentials', { provider: 'pusher' });
  try {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const path = `/apps/${appId}/channels/${channel}`;
    const info = attributes.join(',');
    const qs = `auth_key=${key}&auth_timestamp=${timestamp}&auth_version=1.0${info ? `&info=${info}` : ''}`;
    const sig = sign(secret, `GET\n${path}\n${qs}`);
    const url = `https://api-${cluster}.pusher.com${path}?${qs}&auth_signature=${sig}`;
    const { data } = await httpClient({ timeout: 10_000 }).get(url, { signal });
    return data;
  } catch (err) {
    throw wrapProviderError(err, 'pusher');
  }
}
