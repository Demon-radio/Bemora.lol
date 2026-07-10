import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();
const BASE = 'https://disease.sh/v3/covid-19';

export async function getGlobal() {
  const cacheKey = 'covid:global';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/all`);
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
  } catch (err) {
    throw wrapProviderError(err, 'covid');
  }
}

export async function getCountry({ country }) {
  const cacheKey = `covid:country:${country}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/countries/${encodeURIComponent(country)}`);
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
  } catch (err) {
    throw wrapProviderError(err, 'covid');
  }
}

export async function getHistorical({ country = 'all', days = 30 } = {}) {
  const url = country === 'all' ? `${BASE}/historical/all` : `${BASE}/historical/${encodeURIComponent(country)}`;
  try {
    const { data } = await http.get(url, { params: { lastdays: days } });
    const timeline = data.timeline || data;
    return { country, days, timeline };
  } catch (err) {
    throw wrapProviderError(err, 'covid');
  }
}

export async function getTopCountries({ limit = 10 } = {}) {
  const cacheKey = `covid:top:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/countries`, { params: { sort: 'cases' } });
    const result = { countries: data.slice(0, limit).map((c) => ({ country: c.country, cases: c.cases, deaths: c.deaths, active: c.active })), _cached: false };
    cache.set(cacheKey, result, 3600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'covid');
  }
}
