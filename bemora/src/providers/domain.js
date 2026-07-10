import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import dns from 'dns/promises';
import * as cache from '../core/cache.js';

const http = httpClient();

export async function whois({ domain }) {
  const cacheKey = `domain:whois:${domain}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`https://rdap.org/domain/${encodeURIComponent(domain)}`);
    const result = {
      domain,
      handle: data.handle,
      status: data.status,
      nameservers: data.nameservers?.map((n) => n.ldhName),
      events: data.events?.map((e) => ({ action: e.eventAction, date: e.eventDate })),
      _cached: false,
    };
    cache.set(cacheKey, result, 3600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'domain');
  }
}

export async function dnsRecords({ domain, type = 'A' }) {
  const records = await dns.resolve(domain, type);
  return { domain, type, records };
}

export async function resolveIp({ domain }) {
  const addresses = await dns.resolve4(domain).catch(() => []);
  const addresses6 = await dns.resolve6(domain).catch(() => []);
  return { domain, ipv4: addresses, ipv6: addresses6 };
}
