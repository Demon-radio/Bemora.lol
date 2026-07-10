import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';
import { logger } from '../core/logger.js';

const http = httpClient();
const BASE = 'https://api.coingecko.com/api/v3';

/**
 * Get crypto price(s)
 * @param {Object} params
 * @param {string|string[]} params.coins - e.g. 'bitcoin' or ['bitcoin','ethereum']
 * @param {string} [params.currency] - e.g. 'usd'
 * @returns {Promise<Object>}
 */
export async function getPrice({ coins, currency = 'usd', signal }) {
  const ids = Array.isArray(coins) ? coins.join(',') : coins;
  const cacheKey = `crypto:price:${ids}:${currency}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  try {
    const { data } = await http.get(`${BASE}/simple/price`, {
      params: {
        ids,
        vs_currencies: currency,
        include_24hr_change: true,
        include_market_cap: true,
      },
      signal,
    });

    const result = {
      currency,
      prices: Object.entries(data).map(([coin, values]) => ({
        coin,
        price: values[currency],
        market_cap: values[`${currency}_market_cap`],
        change_24h: values[`${currency}_24h_change`],
      })),
      _cached: false,
    };

    cache.set(cacheKey, result, 60);
    logger.info(`Crypto prices fetched: ${ids}`);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'crypto');
  }
}

/**
 * Get trending coins
 * @returns {Promise<Object>}
 */
export async function getTrending() {
  const cacheKey = 'crypto:trending';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  try {
    const { data } = await http.get(`${BASE}/search/trending`);

    const result = {
      trending: data.coins.map((c) => ({
        name: c.item.name,
        symbol: c.item.symbol,
        market_cap_rank: c.item.market_cap_rank,
        thumb: c.item.thumb,
        score: c.item.score,
      })),
      _cached: false,
    };

    cache.set(cacheKey, result, 300);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'crypto');
  }
}

/**
 * Get top coins by market cap
 * @param {Object} params
 * @param {string} [params.currency]
 * @param {number} [params.limit]
 * @returns {Promise<Object>}
 */
export async function getTopCoins({ currency = 'usd', limit = 20 } = {}) {
  const cacheKey = `crypto:top:${currency}:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  try {
    const { data } = await http.get(`${BASE}/coins/markets`, {
      params: {
        vs_currency: currency,
        order: 'market_cap_desc',
        per_page: limit,
        page: 1,
        sparkline: false,
      },
    });

    const result = {
      currency,
      coins: data.map((c) => ({
        rank: c.market_cap_rank,
        name: c.name,
        symbol: c.symbol.toUpperCase(),
        price: c.current_price,
        market_cap: c.market_cap,
        change_24h: c.price_change_percentage_24h,
        image: c.image,
      })),
      _cached: false,
    };

    cache.set(cacheKey, result, 300);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'crypto');
  }
}
