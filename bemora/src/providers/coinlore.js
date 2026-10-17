import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();

const BASE = 'https://api.coinlore.net/api';

/**
 * Fetch a page of cryptocurrency tickers.
 * @param {Object} params
 * @param {number} [params.start=0] - pagination offset
 * @param {number} [params.limit=10] - max number of tickers to return
 * @returns {Promise<Object>} normalized tickers array
 */
export async function tickers({ start = 0, limit = 10 } = {}) {
  const cacheKey = `coinlore:tickers:${start}:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/tickers/`, { params: { start, limit } });
    const result = {
      tickers: (data.data || []).map((c) => ({
        id: c.id,
        symbol: c.symbol,
        name: c.name,
        rank: +c.rank,
        price: +c.price_usd,
        change24h: +c.percent_change_24h,
        marketCap: +c.market_cap_usd,
      })),
      _cached: false,
    };
    cache.set(cacheKey, result, 60);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'coinlore');
  }
}

/**
 * Fetch global cryptocurrency market statistics.
 * @returns {Promise<Object>} normalized global market stats
 */
export async function global() {
  const cacheKey = 'coinlore:global';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/global/`);
    const result = {
      coins: +data[0].coins_count,
      marketCap: +data[0].total_mcap,
      volume24h: +data[0].total_volume,
      btcDominance: +data[0].btc_d,
      _cached: false,
    };
    cache.set(cacheKey, result, 300);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'coinlore');
  }
}

/**
 * Fetch details for a single coin by its Coinlore id.
 * @param {Object} params
 * @param {string} params.id - Coinlore coin id
 * @returns {Promise<Object>} normalized coin details
 */
export async function coin({ id } = {}) {
  const cacheKey = `coinlore:coin:${id}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/ticker/`, { params: { id } });
    const c = data[0];
    const result = {
      id: c.id,
      symbol: c.symbol,
      name: c.name,
      rank: +c.rank,
      price: +c.price_usd,
      change1h: +c.percent_change_1h,
      change24h: +c.percent_change_24h,
      change7d: +c.percent_change_7d,
      marketCap: +c.market_cap_usd,
      volume24h: +c.volume24h,
      _cached: false,
    };
    cache.set(cacheKey, result, 60);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'coinlore');
  }
}
