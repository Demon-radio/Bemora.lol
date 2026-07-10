import { httpClient } from '../core/http.js';
import { ValidationError, wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();

export async function lookup({ ip = '', signal } = {}) {
  const target = ip === 'me' || !ip ? '' : ip;
  const cacheKey = `ip:lookup:${target || 'me'}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const url = target
    ? `http://ip-api.com/json/${target}?fields=status,message,continent,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query`
    : `http://ip-api.com/json/?fields=status,message,continent,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query`;

  try {
    const { data } = await http.get(url, { signal });

    if (data.status === 'fail') throw new ValidationError(`IP lookup failed: ${data.message}`, { provider: 'ip' });

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
  } catch (err) {
    if (err instanceof ValidationError) throw err;
    throw wrapProviderError(err, 'ip');
  }
}

export async function batchLookup({ ips }) {
  try {
    const { data } = await http.post(
      'http://ip-api.com/batch?fields=query,country,countryCode,city,lat,lon,timezone,isp,org',
      ips.map((q) => ({ query: q }))
    );
    return data.map((d) => ({
      ip: d.query, country: d.country, country_code: d.countryCode,
      city: d.city, lat: d.lat, lon: d.lon, timezone: d.timezone, isp: d.isp,
    }));
  } catch (err) {
    throw wrapProviderError(err, 'ip');
  }
}
