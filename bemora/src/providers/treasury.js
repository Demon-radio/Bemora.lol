import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();

const BASE = 'https://api.fiscaldata.treasury.gov/services/api/fiscal_service';

/**
 * Fetch US Treasury average interest rates.
 * @param {Object} params
 * @param {number} [params.limit]
 */
export async function averageInterestRates({ limit = 10 }) {
  const cacheKey = `treasury:averageInterestRates:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/v2/accounting/od/avg_interest_rates`, {
      params: { 'page[size]': limit },
    });
    const result = {
      count: data.meta?.total_count,
      rates: data.data,
      _cached: false,
    };
    cache.set(cacheKey, result, 86400);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'treasury');
  }
}

/**
 * Fetch the US national debt to the penny.
 * @param {Object} params
 * @param {number} [params.limit]
 */
export async function debtToPenny({ limit = 10 }) {
  const cacheKey = `treasury:debtToPenny:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/v2/accounting/od/debt_to_penny`, {
      params: { 'page[size]': limit },
    });
    const result = {
      count: data.meta?.total_count,
      records: data.data,
      _cached: false,
    };
    cache.set(cacheKey, result, 86400);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'treasury');
  }
}

/**
 * Fetch US Treasury rates of exchange.
 * @param {Object} params
 * @param {number} [params.limit]
 */
export async function exchangeRates({ limit = 10 }) {
  const cacheKey = `treasury:exchangeRates:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/v1/accounting/od/rates_of_exchange`, {
      params: { 'page[size]': limit },
    });
    const result = {
      count: data.meta?.total_count,
      rates: data.data,
      _cached: false,
    };
    cache.set(cacheKey, result, 86400);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'treasury');
  }
}
