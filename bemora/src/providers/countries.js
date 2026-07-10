
import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();
const COUNTRIES_URL = 'https://raw.githubusercontent.com/mledoze/countries/master/dist/countries.json';

let _allCountriesCache = null;
async function getAllCountriesRaw() {
  if (!_allCountriesCache) {
    try {
      const { data } = await http.get(COUNTRIES_URL);
      _allCountriesCache = data;
    } catch (err) {
      throw wrapProviderError(err, 'countries');
    }
  }
  return _allCountriesCache;
}

/**
 * Get country by name (Free, no key)
 * @param {{ name: string }} params
 */
export async function byName({ name }) {
  const cacheKey = `countries:name:${name}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    // Return array with .countries property for backward compatibility
    const arr = [...cached.countries];
    arr.countries = cached.countries;
    arr._cached = true;
    return arr;
  }

  const allCountries = await getAllCountriesRaw();
  const data = allCountries.filter(c => 
    c.name.common.toLowerCase().includes(name.toLowerCase()) ||
    (c.name.official && c.name.official.toLowerCase().includes(name.toLowerCase()))
  );
  const countries = data.map(format);
  const result = [...countries];
  result.countries = countries;
  result._cached = false;
  cache.set(cacheKey, { countries, _cached: false }, 86400);
  return result;
}

/**
 * Get country by ISO code (e.g. 'EG', 'US')
 * @param {{ code: string }} params
 */
export async function byCode({ code }) {
  const cacheKey = `countries:code:${code.toUpperCase()}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    const arr = [...cached.countries];
    arr.countries = cached.countries;
    arr._cached = true;
    return arr;
  }

  const allCountries = await getAllCountriesRaw();
  const data = allCountries.filter(c => 
    c.cca2 === code.toUpperCase() || c.cca3 === code.toUpperCase()
  );
  const countries = data.map(format);
  const result = [...countries];
  result.countries = countries;
  result._cached = false;
  cache.set(cacheKey, { countries, _cached: false }, 86400);
  return result;
}

/**
 * Get countries in a region (africa, americas, asia, europe, oceania)
 * @param {{ region: string }} params
 */
export async function byRegion({ region }) {
  const cacheKey = `countries:region:${region}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    const arr = [...cached.countries];
    arr.countries = cached.countries;
    arr._cached = true;
    return arr;
  }

  const allCountries = await getAllCountriesRaw();
  const data = allCountries.filter(c => 
    c.region.toLowerCase() === region.toLowerCase()
  );
  const countries = data.map(format);
  const result = [...countries];
  result.countries = countries;
  result._cached = false;
  cache.set(cacheKey, { countries, _cached: false }, 86400);
  return result;
}

/**
 * Get all countries
 */
export async function all() {
  const cacheKey = 'countries:all';
  const cached = cache.get(cacheKey);
  if (cached) {
    const arr = [...cached.countries];
    arr.countries = cached.countries;
    arr.total = cached.total;
    arr._cached = true;
    return arr;
  }

  const allCountries = await getAllCountriesRaw();
  const countries = allCountries.map(format);
  const result = [...countries];
  result.countries = countries;
  result.total = allCountries.length;
  result._cached = false;
  cache.set(cacheKey, { countries, total: allCountries.length, _cached: false }, 86400);
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
