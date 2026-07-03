import axios from 'axios';
import * as cache from '../core/cache.js';

const BASE = 'https://restcountries.com/v3.1';

/**
 * Get country by name (Free, no key)
 * @param {{ name: string }} params
 */
export async function byName({ name }) {
  const cacheKey = `countries:name:${name}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data } = await axios.get(`${BASE}/name/${encodeURIComponent(name)}`);
  const result = { countries: data.map(format), _cached: false };
  cache.set(cacheKey, result, 86400);
  return result;
}

/**
 * Get country by ISO code (e.g. 'EG', 'US')
 * @param {{ code: string }} params
 */
export async function byCode({ code }) {
  const cacheKey = `countries:code:${code.toUpperCase()}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data } = await axios.get(`${BASE}/alpha/${code}`);
  const result = { countries: data.map(format), _cached: false };
  cache.set(cacheKey, result, 86400);
  return result;
}

/**
 * Get countries in a region (africa, americas, asia, europe, oceania)
 * @param {{ region: string }} params
 */
export async function byRegion({ region }) {
  const cacheKey = `countries:region:${region}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data } = await axios.get(`${BASE}/region/${region}`);
  const result = { countries: data.map(format), _cached: false };
  cache.set(cacheKey, result, 86400);
  return result;
}

/**
 * Get all countries
 */
export async function all() {
  const cacheKey = 'countries:all';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data } = await axios.get(`${BASE}/all`);
  const result = { countries: data.map(format), total: data.length, _cached: false };
  cache.set(cacheKey, result, 86400);
  return result;
}

function format(c) {
  return {
    name: c.name?.common,
    official_name: c.name?.official,
    code: c.cca2,
    code3: c.cca3,
    capital: c.capital?.[0],
    region: c.region,
    subregion: c.subregion,
    population: c.population,
    area: c.area,
    currencies: Object.entries(c.currencies || {}).map(([k, v]) => ({
      code: k, name: v.name, symbol: v.symbol,
    })),
    languages: Object.values(c.languages || {}),
    flag: c.flag,
    flag_url: c.flags?.png,
    timezones: c.timezones,
    calling_codes: c.idd?.root
      ? c.idd.suffixes?.map((s) => c.idd.root + s) || [c.idd.root]
      : [],
    lat: c.latlng?.[0],
    lon: c.latlng?.[1],
    landlocked: c.landlocked,
  };
}
