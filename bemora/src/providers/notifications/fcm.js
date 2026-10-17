/**
 * Firebase Cloud Messaging (FCM) provider — send push notifications via FCM HTTP v1 API.
 */

import { httpClient } from '../../core/http.js';
import { wrapProviderError, ConfigurationError } from '../../core/errors.js';

const FCM_ENDPOINT = (projectId) => `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;

/**
 * Send a notification to a device token, topic, or condition.
 * @param {{ projectId: string, token?: string, topic?: string, condition?: string, notification?: object, data?: object, android?: object, apns?: object, signal?: AbortSignal }} params
 * @param {string} accessToken - Google OAuth2 access token with Firebase Messaging scope
 */
export async function send({ projectId, token, topic, condition, notification, data, android, apns, webpush, signal } = {}, accessToken) {
  if (!accessToken) throw new ConfigurationError('[fcm] Missing accessToken (OAuth2 token with Firebase scope)', { provider: 'fcm' });
  if (!projectId) throw new ConfigurationError('[fcm] Missing projectId', { provider: 'fcm' });
  try {
    const message = {
      ...(token && { token }),
      ...(topic && { topic }),
      ...(condition && { condition }),
      ...(notification && { notification }),
      ...(data && { data }),
      ...(android && { android }),
      ...(apns && { apns }),
      ...(webpush && { webpush }),
    };
    const { data: res } = await httpClient({
      timeout: 15_000,
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    }).post(FCM_ENDPOINT(projectId), { message }, { signal });
    return { messageId: res.name, success: true };
  } catch (err) {
    throw wrapProviderError(err, 'fcm');
  }
}

/**
 * Send to multiple tokens via batching (up to 500 tokens).
 */
export async function sendMulticast({ projectId, tokens, notification, data, android, apns, signal } = {}, accessToken) {
  if (!accessToken) throw new ConfigurationError('[fcm] Missing accessToken', { provider: 'fcm' });
  const results = await Promise.all(
    tokens.map((token) =>
      send({ projectId, token, notification, data, android, apns, signal }, accessToken)
        .then((r) => ({ token, ...r }))
        .catch((err) => ({ token, success: false, error: err.message }))
    )
  );
  return {
    successCount: results.filter((r) => r.success).length,
    failureCount: results.filter((r) => !r.success).length,
    results,
  };
}
