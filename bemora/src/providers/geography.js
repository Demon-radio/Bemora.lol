import axios from 'axios';
import * as cache from '../core/cache.js';

export async function getCountryInfo({ country }) {
  const cacheKey = `geography:country:${country}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data } = await axios.get(`https://restcountries.com/v3.1/name/${encodeURIComponent(country)}`);
  const result = { country: data[0], _cached: false };
  cache.set(cacheKey, result, 86400);
  return result;
}

export async function getAllCountries() {
  const cacheKey = 'geography:countries:all';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data } = await axios.get('https://restcountries.com/v3.1/all');
  const result = { countries: data, _cached: false };
  cache.set(cacheKey, result, 86400);
  return result;
}

export async function getCapitalCity({ country }) {
  const { country: cntry } = await getCountryInfo({ country });
  return { capital: cntry.capital?.[0] || null };
}
