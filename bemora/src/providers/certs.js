import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();

const BASE = 'https://crt.sh';

/**
 * Search certificate transparency logs for a domain.
 * @param {Object} params
 * @param {string} params.domain - domain to search
 * @param {number} [params.limit=20] - max number of certificates to return
 * @returns {Promise<Object>} deduped certificate list
 */
export async function search({ domain, limit = 20 } = {}) {
  const cacheKey = `crt-sh:search:${domain}:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/`, { params: { q: domain, output: 'json' } });
    const map = new Map();
    for (const r of Array.isArray(data) ? data : []) {
      map.set(r.common_name, {
        issuer: r.issuer_name,
        commonName: r.common_name,
        validFrom: r.not_before,
        validTo: r.not_after,
        serial: r.serial_number,
      });
    }
    const result = { domain, certificates: Array.from(map.values()).slice(0, limit), _cached: false };
    cache.set(cacheKey, result, 600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'crt-sh');
  }
}
