/**
 * Cloudflare Cache API provider — purge, check, and manage CDN cache.
 */

import { httpClient } from '../../core/http.js';
import { wrapProviderError, ConfigurationError } from '../../core/errors.js';
import { buildHeaders } from '../../core/signing/cloudflare.js';

const BASE = 'https://api.cloudflare.com/client/v4';

function client(creds) {
  return httpClient({ timeout: 15_000, headers: { ...buildHeaders(creds), 'Content-Type': 'application/json' } });
}

/**
 * Purge specific files from cache.
 * @param {{ zoneId: string, files: string[], signal?: AbortSignal }} params
 */
export async function purgeFiles({ zoneId, files, signal } = {}, creds = {}) {
  if (!zoneId) throw new ConfigurationError('[cf-cache] Missing zoneId', { provider: 'cf-cache' });
  try {
    const { data } = await client(creds).post(`${BASE}/zones/${zoneId}/purge_cache`, { files }, { signal });
    return { id: data.result?.id, success: data.success };
  } catch (err) {
    throw wrapProviderError(err, 'cf-cache');
  }
}

/**
 * Purge cache by tags.
 */
export async function purgeTags({ zoneId, tags, signal } = {}, creds = {}) {
  if (!zoneId) throw new ConfigurationError('[cf-cache] Missing zoneId', { provider: 'cf-cache' });
  try {
    const { data } = await client(creds).post(`${BASE}/zones/${zoneId}/purge_cache`, { tags }, { signal });
    return { id: data.result?.id, success: data.success };
  } catch (err) {
    throw wrapProviderError(err, 'cf-cache');
  }
}

/**
 * Purge cache by URL prefixes.
 */
export async function purgePrefixes({ zoneId, prefixes, signal } = {}, creds = {}) {
  if (!zoneId) throw new ConfigurationError('[cf-cache] Missing zoneId', { provider: 'cf-cache' });
  try {
    const { data } = await client(creds).post(`${BASE}/zones/${zoneId}/purge_cache`, { prefixes }, { signal });
    return { id: data.result?.id, success: data.success };
  } catch (err) {
    throw wrapProviderError(err, 'cf-cache');
  }
}

/**
 * Purge everything in a zone's cache (use with caution).
 */
export async function purgeAll({ zoneId, signal } = {}, creds = {}) {
  if (!zoneId) throw new ConfigurationError('[cf-cache] Missing zoneId', { provider: 'cf-cache' });
  try {
    const { data } = await client(creds).post(`${BASE}/zones/${zoneId}/purge_cache`, { purge_everything: true }, { signal });
    return { id: data.result?.id, success: data.success };
  } catch (err) {
    throw wrapProviderError(err, 'cf-cache');
  }
}

/**
 * Get cache settings for a zone.
 */
export async function getSettings({ zoneId, signal } = {}, creds = {}) {
  if (!zoneId) throw new ConfigurationError('[cf-cache] Missing zoneId', { provider: 'cf-cache' });
  try {
    const { data } = await client(creds).get(`${BASE}/zones/${zoneId}/settings/cache_level`, { signal });
    return data.result;
  } catch (err) {
    throw wrapProviderError(err, 'cf-cache');
  }
}

/**
 * Set cache level (bypass | basic | simplified | aggressive | cache_everything).
 */
export async function setCacheLevel({ zoneId, level, signal } = {}, creds = {}) {
  if (!zoneId) throw new ConfigurationError('[cf-cache] Missing zoneId', { provider: 'cf-cache' });
  try {
    const { data } = await client(creds).patch(`${BASE}/zones/${zoneId}/settings/cache_level`, { value: level }, { signal });
    return data.result;
  } catch (err) {
    throw wrapProviderError(err, 'cf-cache');
  }
}
