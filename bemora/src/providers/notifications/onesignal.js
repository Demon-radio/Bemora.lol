/**
 * OneSignal push notifications provider.
 */

import { httpClient } from '../../core/http.js';
import { wrapProviderError, ConfigurationError } from '../../core/errors.js';

const BASE = 'https://onesignal.com/api/v1';

function client(apiKey) {
  return httpClient({ timeout: 15_000, headers: { Authorization: `Basic ${apiKey}`, 'Content-Type': 'application/json' } });
}

/**
 * Send a push notification.
 * @param {{ appId: string, headings?: object, contents: object, playerIds?: string[], segments?: string[], filters?: object[], data?: object, signal?: AbortSignal }} params
 * @param {string} apiKey - OneSignal REST API key
 */
export async function send({ appId, headings, contents, playerIds, segments, filters, data, url, signal } = {}, apiKey) {
  if (!apiKey) throw new ConfigurationError('[onesignal] Missing apiKey', { provider: 'onesignal' });
  if (!appId) throw new ConfigurationError('[onesignal] Missing appId', { provider: 'onesignal' });
  try {
    const body = {
      app_id: appId,
      contents,
      ...(headings && { headings }),
      ...(playerIds && { include_player_ids: playerIds }),
      ...(segments && { included_segments: segments }),
      ...(filters && { filters }),
      ...(data && { data }),
      ...(url && { url }),
    };
    const { data: res } = await client(apiKey).post(`${BASE}/notifications`, body, { signal });
    return { id: res.id, recipients: res.recipients, errors: res.errors };
  } catch (err) {
    throw wrapProviderError(err, 'onesignal');
  }
}

/**
 * Cancel a scheduled notification.
 */
export async function cancel({ appId, notificationId, signal } = {}, apiKey) {
  if (!apiKey) throw new ConfigurationError('[onesignal] Missing apiKey', { provider: 'onesignal' });
  try {
    const { data } = await client(apiKey).delete(`${BASE}/notifications/${notificationId}?app_id=${appId}`, { signal });
    return data;
  } catch (err) {
    throw wrapProviderError(err, 'onesignal');
  }
}

/**
 * Get notification stats.
 */
export async function getNotification({ appId, notificationId, signal } = {}, apiKey) {
  if (!apiKey) throw new ConfigurationError('[onesignal] Missing apiKey', { provider: 'onesignal' });
  try {
    const { data } = await client(apiKey).get(`${BASE}/notifications/${notificationId}?app_id=${appId}`, { signal });
    return data;
  } catch (err) {
    throw wrapProviderError(err, 'onesignal');
  }
}

/**
 * Add/update a device (player).
 */
export async function addDevice({ appId, deviceType, identifier, tags, signal } = {}, apiKey) {
  if (!apiKey) throw new ConfigurationError('[onesignal] Missing apiKey', { provider: 'onesignal' });
  try {
    const { data } = await client(apiKey).post(`${BASE}/players`, {
      app_id: appId, device_type: deviceType, identifier, tags,
    }, { signal });
    return data;
  } catch (err) {
    throw wrapProviderError(err, 'onesignal');
  }
}
