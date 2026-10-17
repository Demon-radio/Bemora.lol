import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();

const BASE = 'https://api.nbp.pl/api';

/**
 * Fetch an exchange rate table from the National Bank of Poland.
 * @param {Object} params
 * @param {string} [params.table=A] - NBP table code
 * @returns {Promise<Object>} normalized exchange rate table
 */
export async function table({ table = 'A' } = {}) {
  const cacheKey = `nbp:table:${table}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/exchangerates/tables/${encodeURIComponent(table)}/`, {
      params: { format: 'json' },
    });
    const t = data[0] || {};
    const result = {
      table: t.table,
      number: t.no,
      effectiveDate: t.effectiveDate,
      rates: (t.rates || []).map((r) => ({
        code: r.code,
        currency: r.currency,
        mid: r.mid,
      })),
      _cached: false,
    };
    cache.set(cacheKey, result, 3600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'nbp');
  }
}

/**
 * Fetch a single currency's exchange rate from an NBP table.
 * @param {Object} params
 * @param {string} [params.code=USD] - currency code
 * @param {string} [params.table=A] - NBP table code
 * @returns {Promise<Object>} normalized exchange rate
 */
export async function rate({ code = 'USD', table = 'A' } = {}) {
  const cacheKey = `nbp:rate:${table}:${code}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(
      `${BASE}/exchangerates/rates/${encodeURIComponent(table)}/${encodeURIComponent(code)}/`,
      { params: { format: 'json' } }
    );
    const r = (data.rates || [])[0] || {};
    const result = {
      code: data.code,
      currency: data.currency,
      rate: r.mid,
      number: r.no,
      effectiveDate: r.effectiveDate,
      _cached: false,
    };
    cache.set(cacheKey, result, 3600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'nbp');
  }
}

/**
 * Fetch the National Bank of Poland gold price.
 * @returns {Promise<Object>} gold price and date
 */
export async function gold() {
  const cacheKey = 'nbp:gold';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/cint/gold/`, { params: { format: 'json' } });
    const g = data[0] || {};
    const result = { date: g.data, price: g.cena, _cached: false };
    cache.set(cacheKey, result, 3600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'nbp');
  }
}
