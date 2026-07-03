import axios from 'axios';
import * as cache from '../core/cache.js';

export async function getLatestRates({ base = 'USD', symbols } = {}) {
  const params = { from: base };
  if (symbols) params.to = Array.isArray(symbols) ? symbols.join(',') : symbols;
  const { data } = await axios.get('https://api.frankfurter.app/latest', { params });
  return { base: data.base, date: data.date, rates: data.rates };
}

export async function getHistoricalRates({ date, base = 'USD', symbols } = {}) {
  const params = { from: base };
  if (symbols) params.to = Array.isArray(symbols) ? symbols.join(',') : symbols;
  const { data } = await axios.get(`https://api.frankfurter.app/${date}`, { params });
  return { base: data.base, date: data.date, rates: data.rates };
}

export async function getTimeSeries({ startDate, endDate, base = 'USD', symbols } = {}) {
  const cacheKey = `currencyhistory:series:${startDate}:${endDate}:${base}:${symbols}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const params = { from: base };
  if (symbols) params.to = Array.isArray(symbols) ? symbols.join(',') : symbols;
  const { data } = await axios.get(`https://api.frankfurter.app/${startDate}..${endDate}`, { params });
  const result = { base: data.base, startDate: data.start_date, endDate: data.end_date, rates: data.rates, _cached: false };
  cache.set(cacheKey, result, 3600);
  return result;
}
