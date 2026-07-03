import axios from 'axios';
import * as cache from '../core/cache.js';

const BASE = 'https://disease.sh/v3/covid-19';

export async function getGlobal() {
  const cacheKey = 'covid:global';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  const { data } = await axios.get(`${BASE}/all`);
  const result = {
    cases: data.cases,
    deaths: data.deaths,
    recovered: data.recovered,
    active: data.active,
    todayCases: data.todayCases,
    todayDeaths: data.todayDeaths,
    updated: data.updated,
    _cached: false,
  };
  cache.set(cacheKey, result, 3600);
  return result;
}

export async function getCountry({ country }) {
  const cacheKey = `covid:country:${country}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  const { data } = await axios.get(`${BASE}/countries/${encodeURIComponent(country)}`);
  const result = {
    country: data.country,
    cases: data.cases,
    deaths: data.deaths,
    recovered: data.recovered,
    active: data.active,
    critical: data.critical,
    casesPerOneMillion: data.casesPerOneMillion,
    population: data.population,
    _cached: false,
  };
  cache.set(cacheKey, result, 3600);
  return result;
}

export async function getHistorical({ country = 'all', days = 30 } = {}) {
  const url = country === 'all' ? `${BASE}/historical/all` : `${BASE}/historical/${encodeURIComponent(country)}`;
  const { data } = await axios.get(url, { params: { lastdays: days } });
  const timeline = data.timeline || data;
  return { country, days, timeline };
}

export async function getTopCountries({ limit = 10 } = {}) {
  const cacheKey = `covid:top:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  const { data } = await axios.get(`${BASE}/countries`, { params: { sort: 'cases' } });
  const result = { countries: data.slice(0, limit).map((c) => ({ country: c.country, cases: c.cases, deaths: c.deaths, active: c.active })), _cached: false };
  cache.set(cacheKey, result, 3600);
  return result;
}
