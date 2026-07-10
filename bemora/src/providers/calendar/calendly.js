/**
 * Calendly provider — get user, event types, scheduled events, cancel events.
 */

import { httpClient } from '../../core/http.js';
import { wrapProviderError, ConfigurationError } from '../../core/errors.js';

const BASE = 'https://api.calendly.com';

function client(apiKey) {
  return httpClient({ timeout: 15_000, headers: { Authorization: `Bearer ${apiKey}` } });
}

/**
 * Get the authenticated user.
 */
export async function getUser({ signal } = {}, apiKey) {
  if (!apiKey) throw new ConfigurationError('[calendly] Missing apiKey', { provider: 'calendly' });
  try {
    const { data } = await client(apiKey).get(`${BASE}/users/me`, { signal });
    return data.resource;
  } catch (err) {
    throw wrapProviderError(err, 'calendly');
  }
}

/**
 * List event types for a user.
 * @param {{ userUri?: string, active?: boolean, signal?: AbortSignal }} params
 */
export async function listEventTypes({ userUri, active = true, signal } = {}, apiKey) {
  if (!apiKey) throw new ConfigurationError('[calendly] Missing apiKey', { provider: 'calendly' });
  try {
    const user = userUri || (await getUser({ signal }, apiKey))?.uri;
    const { data } = await client(apiKey).get(`${BASE}/event_types`, {
      params: { user, active },
      signal,
    });
    return { collection: data.collection };
  } catch (err) {
    throw wrapProviderError(err, 'calendly');
  }
}

/**
 * List scheduled events.
 * @param {{ userUri?: string, status?: 'active'|'canceled', minStartTime?: string, maxStartTime?: string, count?: number, signal?: AbortSignal }} params
 */
export async function listEvents({ userUri, status, minStartTime, maxStartTime, count = 20, signal } = {}, apiKey) {
  if (!apiKey) throw new ConfigurationError('[calendly] Missing apiKey', { provider: 'calendly' });
  try {
    const user = userUri || (await getUser({ signal }, apiKey))?.uri;
    const { data } = await client(apiKey).get(`${BASE}/scheduled_events`, {
      params: { user, status, min_start_time: minStartTime, max_start_time: maxStartTime, count },
      signal,
    });
    return { collection: data.collection, pagination: data.pagination };
  } catch (err) {
    throw wrapProviderError(err, 'calendly');
  }
}

/**
 * Get a scheduled event by UUID.
 */
export async function getEvent({ uuid, signal } = {}, apiKey) {
  if (!apiKey) throw new ConfigurationError('[calendly] Missing apiKey', { provider: 'calendly' });
  try {
    const { data } = await client(apiKey).get(`${BASE}/scheduled_events/${uuid}`, { signal });
    return data.resource;
  } catch (err) {
    throw wrapProviderError(err, 'calendly');
  }
}

/**
 * Cancel a scheduled event.
 */
export async function cancelEvent({ uuid, reason = 'Canceled via API', signal } = {}, apiKey) {
  if (!apiKey) throw new ConfigurationError('[calendly] Missing apiKey', { provider: 'calendly' });
  try {
    const { data } = await client(apiKey).post(`${BASE}/scheduled_events/${uuid}/cancellation`, { reason }, { signal });
    return data.resource;
  } catch (err) {
    throw wrapProviderError(err, 'calendly');
  }
}

/**
 * List invitees for a scheduled event.
 */
export async function listInvitees({ uuid, status, signal } = {}, apiKey) {
  if (!apiKey) throw new ConfigurationError('[calendly] Missing apiKey', { provider: 'calendly' });
  try {
    const { data } = await client(apiKey).get(`${BASE}/scheduled_events/${uuid}/invitees`, {
      params: { status },
      signal,
    });
    return { collection: data.collection };
  } catch (err) {
    throw wrapProviderError(err, 'calendly');
  }
}
