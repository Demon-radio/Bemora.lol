/**
 * VirusTotal security provider — scan URLs, files, and check reports.
 */

import { httpClient } from '../../core/http.js';
import { wrapProviderError, ConfigurationError } from '../../core/errors.js';

const BASE = 'https://www.virustotal.com/api/v3';

function client(apiKey) {
  return httpClient({ timeout: 30_000, headers: { 'x-apikey': apiKey } });
}

/**
 * Scan a URL with VirusTotal.
 * @param {{ url: string, signal?: AbortSignal }} params
 * @param {string} apiKey
 */
export async function scanUrl({ url, signal } = {}, apiKey) {
  if (!apiKey) throw new ConfigurationError('[virustotal] Missing apiKey', { provider: 'virustotal' });
  try {
    const body = new URLSearchParams({ url });
    const { data } = await client(apiKey).post(`${BASE}/urls`, body.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      signal,
    });
    return { analysisId: data.data?.id, type: data.data?.type };
  } catch (err) {
    throw wrapProviderError(err, 'virustotal');
  }
}

/**
 * Get URL analysis report.
 * @param {{ urlId: string, signal?: AbortSignal }} params - urlId is base64url of the URL
 */
export async function getUrlReport({ urlId, signal } = {}, apiKey) {
  if (!apiKey) throw new ConfigurationError('[virustotal] Missing apiKey', { provider: 'virustotal' });
  try {
    const { data } = await client(apiKey).get(`${BASE}/urls/${urlId}`, { signal });
    return {
      id: data.data?.id,
      stats: data.data?.attributes?.last_analysis_stats,
      results: data.data?.attributes?.last_analysis_results,
      reputation: data.data?.attributes?.reputation,
      categories: data.data?.attributes?.categories,
    };
  } catch (err) {
    throw wrapProviderError(err, 'virustotal');
  }
}

/**
 * Get analysis results (polls a queued analysis).
 */
export async function getAnalysis({ analysisId, signal } = {}, apiKey) {
  if (!apiKey) throw new ConfigurationError('[virustotal] Missing apiKey', { provider: 'virustotal' });
  try {
    const { data } = await client(apiKey).get(`${BASE}/analyses/${analysisId}`, { signal });
    return {
      status: data.data?.attributes?.status,
      stats: data.data?.attributes?.stats,
      results: data.data?.attributes?.results,
    };
  } catch (err) {
    throw wrapProviderError(err, 'virustotal');
  }
}

/**
 * Get a file report by SHA256/MD5/SHA1 hash.
 */
export async function getFileReport({ hash, signal } = {}, apiKey) {
  if (!apiKey) throw new ConfigurationError('[virustotal] Missing apiKey', { provider: 'virustotal' });
  try {
    const { data } = await client(apiKey).get(`${BASE}/files/${hash}`, { signal });
    return {
      id: data.data?.id,
      name: data.data?.attributes?.meaningful_name,
      stats: data.data?.attributes?.last_analysis_stats,
      reputation: data.data?.attributes?.reputation,
      typeDescription: data.data?.attributes?.type_description,
    };
  } catch (err) {
    throw wrapProviderError(err, 'virustotal');
  }
}

/**
 * Get an IP address report.
 */
export async function getIpReport({ ip, signal } = {}, apiKey) {
  if (!apiKey) throw new ConfigurationError('[virustotal] Missing apiKey', { provider: 'virustotal' });
  try {
    const { data } = await client(apiKey).get(`${BASE}/ip_addresses/${ip}`, { signal });
    return {
      reputation: data.data?.attributes?.reputation,
      stats: data.data?.attributes?.last_analysis_stats,
      asOwner: data.data?.attributes?.as_owner,
      country: data.data?.attributes?.country,
      network: data.data?.attributes?.network,
    };
  } catch (err) {
    throw wrapProviderError(err, 'virustotal');
  }
}
