/**
 * urlscan.io security provider — scan URLs, retrieve results, search.
 */

import { httpClient } from '../../core/http.js';
import { wrapProviderError, ConfigurationError } from '../../core/errors.js';

const BASE = 'https://urlscan.io/api/v1';

function client(apiKey) {
  return httpClient({
    timeout: 30_000,
    headers: {
      'Content-Type': 'application/json',
      ...(apiKey && { 'API-Key': apiKey }),
    },
  });
}

/**
 * Submit a URL for scanning.
 * @param {{ url: string, visibility?: 'public'|'unlisted'|'private', tags?: string[], signal?: AbortSignal }} params
 * @param {string} apiKey
 */
export async function scan({ url, visibility = 'public', tags = [], signal } = {}, apiKey) {
  if (!apiKey) throw new ConfigurationError('[urlscan] Missing apiKey', { provider: 'urlscan' });
  try {
    const { data } = await client(apiKey).post(`${BASE}/scan/`, { url, visibility, tags }, { signal });
    return {
      uuid: data.uuid,
      result: data.result,
      api: data.api,
      visibility: data.visibility,
      url: data.url,
    };
  } catch (err) {
    throw wrapProviderError(err, 'urlscan');
  }
}

/**
 * Get scan result by UUID.
 * @param {{ uuid: string, signal?: AbortSignal }} params
 */
export async function getResult({ uuid, signal } = {}, apiKey) {
  try {
    const { data } = await client(apiKey).get(`${BASE}/result/${uuid}/`, { signal });
    return {
      verdicts: data.verdicts,
      malicious: data.verdicts?.overall?.malicious,
      score: data.verdicts?.overall?.score,
      categories: data.verdicts?.overall?.categories,
      brands: data.verdicts?.overall?.brands,
      page: {
        url: data.page?.url,
        domain: data.page?.domain,
        ip: data.page?.ip,
        country: data.page?.country,
        title: data.page?.title,
      },
      screenshotUrl: `https://urlscan.io/screenshots/${uuid}.png`,
    };
  } catch (err) {
    throw wrapProviderError(err, 'urlscan');
  }
}

/**
 * Search past scans.
 * @param {{ query: string, size?: number, signal?: AbortSignal }} params
 */
export async function search({ query, size = 10, signal } = {}, apiKey) {
  try {
    const { data } = await client(apiKey).get(`${BASE}/search/`, { params: { q: query, size }, signal });
    return { results: data.results, total: data.total };
  } catch (err) {
    throw wrapProviderError(err, 'urlscan');
  }
}
