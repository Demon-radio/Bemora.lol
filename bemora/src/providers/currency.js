import axios from 'axios';
import * as cache from '../core/cache.js';
import { logger } from '../core/logger.js';

/**
 * Get exchange rates
 * @param {Object} params
 * @param {string} [params.base] - Base currency (default USD)
 * @param {string[]} [params.symbols] - Target currencies
 * @param {string} apiKey - ExchangeRate-API key
 * @returns {Promise<Object>}
 */
export async function getRates({ base = 'USD', symbols = [] }, apiKey) {
  const cacheKey = `currency:rates:${base}:${symbols.join(',')}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const url = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${base}`;
  const { data } = await axios.get(url);

  let rates = data.conversion_rates;
  if (symbols.length > 0) {
    rates = Object.fromEntries(
      Object.entries(rates).filter(([k]) => symbols.includes(k))
    );
  }

  const result = {
    base,
    date: data.time_last_update_utc,
    rates,
    _cached: false,
  };

  cache.set(cacheKey, result, 3600);
  logger.info(`Exchange rates fetched for base ${base}`);
  return result;
}

/**
 * Convert currency amount
 * @param {Object} params
 * @param {string} params.from
 * @param {string} params.to
 * @param {number} params.amount
 * @param {string} apiKey
 * @returns {Promise<Object>}
 */
export async function convert({ from, to, amount }, apiKey) {
  const cacheKey = `currency:convert:${from}:${to}`;
  let rates = cache.get(cacheKey);

  if (!rates) {
    const url = `https://v6.exchangerate-api.com/v6/${apiKey}/pair/${from}/${to}`;
    const { data } = await axios.get(url);
    rates = data.conversion_rate;
    cache.set(cacheKey, rates, 3600);
  }

  const converted = amount * rates;
  logger.info(`Converted ${amount} ${from} → ${to}`);

  return {
    from,
    to,
    amount,
    rate: rates,
    result: parseFloat(converted.toFixed(4)),
    _cached: false,
  };
}
