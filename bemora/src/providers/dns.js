import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient({ headers: { Accept: 'application/dns-json' } });
const CLOUDFLARE = 'https://cloudflare-dns.com/dns-query';
const GOOGLE = 'https://dns.google/resolve';

const STATUS = {
  0: 'NOERROR',
  1: 'FORMERR',
  2: 'SERVFAIL',
  3: 'NXDOMAIN',
  4: 'NOTIMP',
  5: 'REFUSED',
  6: 'YXDOMAIN',
  7: 'YXRRSET',
  8: 'NXRRSET',
  9: 'NOTAUTH',
  10: 'NOTZONE',
};

/**
 * Query DNS-over-HTTPS, trying Cloudflare first and Google as fallback.
 * @param {string} name
 * @param {string} type
 * @returns {Promise<Object>}
 */
async function query(name, type) {
  try {
    const { data } = await http.get(CLOUDFLARE, { params: { name, type } });
    return data;
  } catch (primaryErr) {
    try {
      const { data } = await http.get(GOOGLE, { params: { name, type } });
      return data;
    } catch (fallbackErr) {
      throw wrapProviderError(fallbackErr, 'dns');
    }
  }
}

/**
 * Resolve a DNS record via DNS-over-HTTPS.
 * @param {Object} params
 * @param {string} params.name
 * @param {string} [params.type] - A | AAAA | CNAME | MX | TXT | NS | SRV
 * @returns {Promise<Object>}
 */
export async function resolve({ name, type = 'A' }) {
  const cacheKey = `dns:resolve:${name}:${type}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const data = await query(name, type);
    const result = {
      name,
      type,
      status: STATUS[data.Status] || 'UNKNOWN',
      answers: (data.Answer || []).map((a) => ({
        name: a.name,
        type: a.type,
        ttl: a.TTL,
        data: a.data,
      })),
      _cached: false,
    };
    cache.set(cacheKey, result, 300);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'dns');
  }
}

/**
 * Resolve A records for a hostname.
 * @param {Object} params
 * @param {string} params.name
 * @returns {Promise<Object>}
 */
export async function a({ name }) {
  const { answers } = await resolve({ name, type: 'A' });
  return { name, type: 'A', records: answers.map((r) => r.data) };
}

/**
 * Resolve AAAA records for a hostname.
 * @param {Object} params
 * @param {string} params.name
 * @returns {Promise<Object>}
 */
export async function aaaa({ name }) {
  const { answers } = await resolve({ name, type: 'AAAA' });
  return { name, type: 'AAAA', records: answers.map((r) => r.data) };
}

/**
 * Resolve CNAME records for a hostname.
 * @param {Object} params
 * @param {string} params.name
 * @returns {Promise<Object>}
 */
export async function cname({ name }) {
  const { answers } = await resolve({ name, type: 'CNAME' });
  return { name, type: 'CNAME', records: answers.map((r) => r.data) };
}

/**
 * Resolve MX records for a domain.
 * @param {Object} params
 * @param {string} params.name
 * @returns {Promise<Object>}
 */
export async function mx({ name }) {
  const { answers } = await resolve({ name, type: 'MX' });
  return { name, type: 'MX', records: answers.map((r) => r.data) };
}

/**
 * Resolve TXT records for a domain.
 * @param {Object} params
 * @param {string} params.name
 * @returns {Promise<Object>}
 */
export async function txt({ name }) {
  const { answers } = await resolve({ name, type: 'TXT' });
  return { name, type: 'TXT', records: answers.map((r) => r.data) };
}

/**
 * Resolve NS records for a domain.
 * @param {Object} params
 * @param {string} params.name
 * @returns {Promise<Object>}
 */
export async function ns({ name }) {
  const { answers } = await resolve({ name, type: 'NS' });
  return { name, type: 'NS', records: answers.map((r) => r.data) };
}

/**
 * Resolve SRV records for a service.
 * @param {Object} params
 * @param {string} params.name
 * @returns {Promise<Object>}
 */
export async function srv({ name }) {
  const { answers } = await resolve({ name, type: 'SRV' });
  return { name, type: 'SRV', records: answers.map((r) => r.data) };
}
