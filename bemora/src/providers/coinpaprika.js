import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();

const BASE = 'https://api.coinpaprika.com/v1';

/**
 * Fetch the top coins ranked by market capitalization.
 * @param {Object} params
 * @param {number} [params.limit=10] - max number of tickers to return
 * @returns {Promise<Object>} normalized tickers array
 */
export async function tickers({ limit = 10 } = {}) {
  const cacheKey = `coinpaprika:tickers:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/tickers`, { params: { limit } });
    const result = {
      tickers: data.slice(0, limit).map((t) => ({
        id: t.id,
        name: t.name,
        symbol: t.symbol,
        rank: t.rank,
        price: t.price_usd,
        change24h: t.percent_change_24h,
        marketCap: t.market_cap_usd,
      })),
      _cached: false,
    };
    cache.set(cacheKey, result, 60);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'coinpaprika');
  }
}

/**
 * Fetch details for a single coin by its Coinpaprika id.
 * @param {Object} params
 * @param {string} params.id - Coinpaprika coin id
 * @returns {Promise<Object>} normalized coin details
 */
export async function ticker({ id } = {}) {
  const cacheKey = `coinpaprika:ticker:${id}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/tickers/${encodeURIComponent(id)}`);
    const result = {
      id: data.id,
      name: data.name,
      symbol: data.symbol,
      rank: data.rank,
      price: data.price_usd,
      change1h: data.percent_change_1h,
      change24h: data.percent_change_24h,
      change7d: data.percent_change_7d,
      marketCap: data.market_cap_usd,
      volume24h: data.volume_24h,
      _cached: false,
    };
    cache.set(cacheKey, result, 60);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'coinpaprika');
  }
}

/**
 * Fetch global cryptocurrency market statistics.
 * @returns {Promise<Object>} normalized global market stats
 */
export async function global() {
  const cacheKey = 'coinpaprika:global';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/global`);
    const result = {
      marketCap: data.market_cap_usd,
      volume24h: data.volume_24h_usd,
      btcDominance: data.bitcoin_dominance_percentage,
      coins: data.cryptocurrencies_number,
      _cached: false,
    };
    cache.set(cacheKey, result, 300);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'coinpaprika');
  }
}

/**
 * Search currencies by query string.
 * @param {Object} params
 * @param {string} params.query - search term
 * @returns {Promise<Object>} query plus matching currencies
 */
export async function search({ query } = {}) {
  const cacheKey = `coinpaprika:search:${query}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/search`, {
      params: { q: query, c: 'currencies', limit: 10 },
    });
    const result = {
      query,
      results: (data.currencies || []).map((c) => ({
        id: c.id,
        name: c.name,
        symbol: c.symbol,
        rank: c.rank,
      })),
      _cached: false,
    };
    cache.set(cacheKey, result, 300);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'coinpaprika');
  }
}

/**
 * Fetch exchanges ranked by Coinpaprika.
 * @param {Object} params
 * @param {number} [params.limit=10] - max number of exchanges to return
 * @returns {Promise<Object>} normalized exchanges array
 */
export async function exchanges({ limit = 10 } = {}) {
  const cacheKey = `coinpaprika:exchanges:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/exchanges`, { params: { limit } });
    const result = {
      exchanges: data.slice(0, limit).map((e) => ({
        id: e.id,
        name: e.name,
        rank: e.rank,
        active: e.active,
      })),
      _cached: false,
    };
    cache.set(cacheKey, result, 600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'coinpaprika');
  }
}
