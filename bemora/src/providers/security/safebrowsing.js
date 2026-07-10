/**
 * Google Safe Browsing API — check URLs for malware, phishing, social engineering.
 */

import { httpClient } from '../../core/http.js';
import { wrapProviderError, ConfigurationError } from '../../core/errors.js';

const BASE = 'https://safebrowsing.googleapis.com/v4';

/**
 * Check one or more URLs against Google Safe Browsing.
 * @param {{ urls: string[], signal?: AbortSignal }} params
 * @param {string} apiKey
 * @returns {{ safe: boolean, threats: Array<{ url, threatType, platformType }> }}
 */
export async function checkUrls({ urls, signal } = {}, apiKey) {
  if (!apiKey) throw new ConfigurationError('[safebrowsing] Missing apiKey', { provider: 'safebrowsing' });
  try {
    const body = {
      client: { clientId: 'bemora-enterprise', clientVersion: '1.0' },
      threatInfo: {
        threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'],
        platformTypes: ['ANY_PLATFORM'],
        threatEntryTypes: ['URL'],
        threatEntries: urls.map((u) => ({ url: u })),
      },
    };
    const { data } = await httpClient({ timeout: 10_000 }).post(`${BASE}/threatMatches:find?key=${apiKey}`, body, { signal });
    const threats = (data.matches || []).map((m) => ({
      url: m.threat.url,
      threatType: m.threatType,
      platformType: m.platformType,
    }));
    return { safe: threats.length === 0, threats, checked: urls.length };
  } catch (err) {
    throw wrapProviderError(err, 'safebrowsing');
  }
}

/**
 * Check a single URL.
 */
export async function checkUrl({ url, signal } = {}, apiKey) {
  const { safe, threats } = await checkUrls({ urls: [url], signal }, apiKey);
  return { url, safe, threats };
}
