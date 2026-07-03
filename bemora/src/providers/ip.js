import axios from 'axios';
import * as cache from '../core/cache.js';

/**
 * Get full intelligence for an IP address (Free, no key)
 * @param {{ ip?: string }} params — omit or pass 'me' for current IP
 */
export async function lookup({ ip = '' } = {}) {
  const target = ip === 'me' || !ip ? '' : ip;
  const cacheKey = `ip:lookup:${target || 'me'}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const url = target
    ? `http://ip-api.com/json/${target}?fields=status,message,continent,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query`
    : `http://ip-api.com/json/?fields=status,message,continent,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query`;

  const { data } = await axios.get(url);

  if (data.status === 'fail') throw new Error(`IP lookup failed: ${data.message}`);

  const result = {
    ip: data.query,
    continent: data.continent,
    country: data.country,
    country_code: data.countryCode,
    region: data.regionName,
    city: data.city,
    zip: data.zip,
    lat: data.lat,
    lon: data.lon,
    timezone: data.timezone,
    isp: data.isp,
    org: data.org,
    as: data.as,
    _cached: false,
  };

  cache.set(cacheKey, result, 3600);
  return result;
}

/**
 * Batch lookup multiple IPs at once (Free)
 * @param {{ ips: string[] }} params
 */
export async function batchLookup({ ips }) {
  const { data } = await axios.post(
    'http://ip-api.com/batch?fields=query,country,countryCode,city,lat,lon,timezone,isp,org',
    ips.map((q) => ({ query: q }))
  );
  return data.map((d) => ({
    ip: d.query, country: d.country, country_code: d.countryCode,
    city: d.city, lat: d.lat, lon: d.lon, timezone: d.timezone, isp: d.isp,
  }));
}
