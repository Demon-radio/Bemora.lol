
import axios from 'axios';
import * as cache from '../core/cache.js';

const COUNTRIES_URL = 'https://raw.githubusercontent.com/mledoze/countries/master/dist/countries.json';

let _allCountriesCache = null;
async function getAllCountriesRaw() {
  if (!_allCountriesCache) {
    const { data } = await axios.get(COUNTRIES_URL);
    _allCountriesCache = data;
  }
  return _allCountriesCache;
}

export async function getCountryInfo({ country }) {
  const cacheKey = `geography:country:${country}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const allCountries = await getAllCountriesRaw();
  const data = allCountries.find(c => 
    c.name.common.toLowerCase().includes(country.toLowerCase()) ||
    (c.name.official && c.name.official.toLowerCase().includes(country.toLowerCase()))
  );
  const result = { country: data, _cached: false };
  cache.set(cacheKey, result, 86400);
  return result;
}

export async function getAllCountries() {
  const cacheKey = 'geography:countries:all';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const allCountries = await getAllCountriesRaw();
  const result = { countries: allCountries, _cached: false };
  cache.set(cacheKey, result, 86400);
  return result;
}

export async function getCapitalCity({ country }) {
  const { country: cntry } = await getCountryInfo({ country });
  return { capital: cntry.capital?.[0] || null };
}
