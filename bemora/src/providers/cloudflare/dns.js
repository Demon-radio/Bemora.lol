/**
 * Cloudflare DNS provider — list zones, create/update/delete DNS records.
 */

import { httpClient } from '../../core/http.js';
import { wrapProviderError, ConfigurationError } from '../../core/errors.js';
import { buildHeaders } from '../../core/signing/cloudflare.js';

const BASE = 'https://api.cloudflare.com/client/v4';

function client(creds) {
  return httpClient({ timeout: 15_000, headers: { ...buildHeaders(creds), 'Content-Type': 'application/json' } });
}

/**
 * List DNS zones.
 */
export async function listZones({ name, page = 1, perPage = 50, signal } = {}, creds = {}) {
  try {
    const { data } = await client(creds).get(`${BASE}/zones`, { params: { name, page, per_page: perPage }, signal });
    return { zones: data.result, total: data.result_info?.total_count };
  } catch (err) {
    throw wrapProviderError(err, 'cf-dns');
  }
}

/**
 * List DNS records for a zone.
 */
export async function listRecords({ zoneId, type, name, page = 1, perPage = 100, signal } = {}, creds = {}) {
  if (!zoneId) throw new ConfigurationError('[cf-dns] Missing zoneId', { provider: 'cf-dns' });
  try {
    const { data } = await client(creds).get(`${BASE}/zones/${zoneId}/dns_records`, {
      params: { type, name, page, per_page: perPage },
      signal,
    });
    return { records: data.result, total: data.result_info?.total_count };
  } catch (err) {
    throw wrapProviderError(err, 'cf-dns');
  }
}

/**
 * Create a DNS record.
 */
export async function createRecord({ zoneId, type, name, content, ttl = 1, proxied = false, priority, signal } = {}, creds = {}) {
  if (!zoneId) throw new ConfigurationError('[cf-dns] Missing zoneId', { provider: 'cf-dns' });
  try {
    const body = { type, name, content, ttl, proxied, ...(priority !== undefined && { priority }) };
    const { data } = await client(creds).post(`${BASE}/zones/${zoneId}/dns_records`, body, { signal });
    return data.result;
  } catch (err) {
    throw wrapProviderError(err, 'cf-dns');
  }
}

/**
 * Update a DNS record.
 */
export async function updateRecord({ zoneId, recordId, type, name, content, ttl, proxied, signal } = {}, creds = {}) {
  if (!zoneId || !recordId) throw new ConfigurationError('[cf-dns] Missing zoneId or recordId', { provider: 'cf-dns' });
  try {
    const body = { type, name, content, ttl, proxied };
    const { data } = await client(creds).put(`${BASE}/zones/${zoneId}/dns_records/${recordId}`, body, { signal });
    return data.result;
  } catch (err) {
    throw wrapProviderError(err, 'cf-dns');
  }
}

/**
 * Delete a DNS record.
 */
export async function deleteRecord({ zoneId, recordId, signal } = {}, creds = {}) {
  if (!zoneId || !recordId) throw new ConfigurationError('[cf-dns] Missing zoneId or recordId', { provider: 'cf-dns' });
  try {
    const { data } = await client(creds).delete(`${BASE}/zones/${zoneId}/dns_records/${recordId}`, { signal });
    return { id: data.result?.id, deleted: true };
  } catch (err) {
    throw wrapProviderError(err, 'cf-dns');
  }
}

/**
 * Purge cache for URLs.
 */
export async function purgeCache({ zoneId, files, tags, prefixes, signal } = {}, creds = {}) {
  if (!zoneId) throw new ConfigurationError('[cf-dns] Missing zoneId', { provider: 'cf-dns' });
  try {
    const { data } = await client(creds).post(
      `${BASE}/zones/${zoneId}/purge_cache`,
      { ...(files && { files }), ...(tags && { tags }), ...(prefixes && { prefixes }) },
      { signal }
    );
    return { id: data.result?.id, success: data.success };
  } catch (err) {
    throw wrapProviderError(err, 'cf-dns');
  }
}
