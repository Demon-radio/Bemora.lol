import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();

/**
 * Fetch the spot price for a trading pair.
 * @param {Object} params
 * @param {string} [params.pair]
 */
export async function spot({ pair = 'BTC-USD' }) {
  const cacheKey = `coinbase:spot:${pair}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(
      `https://api.coinbase.com/v2/prices/${encodeURIComponent(pair)}/spot`
    );
    const result = {
      pair,
      base: data.data.base,
      currency: data.data.currency,
      amount: parseFloat(data.data.amount),
      _cached: false,
    };
    cache.set(cacheKey, result, 60);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'coinbase');
  }
}

/**
 * Fetch exchange rates for a base currency.
 * @param {Object} params
 * @param {string} [params.currency]
 */
export async function exchangeRates({ currency = 'BTC' }) {
  const cacheKey = `coinbase:exchangeRates:${currency}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get('https://api.coinbase.com/v2/exchange-rates', {
      params: { currency },
    });
    const result = {
      currency: data.data.currency,
      rates: data.data.rates,
      _cached: false,
    };
    cache.set(cacheKey, result, 3600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'coinbase');
  }
}
