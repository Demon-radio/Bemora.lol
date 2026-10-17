import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();

const BASE = 'https://api.kraken.com/0/public';

/**
 * Fetch the ticker snapshot for a trading pair.
 * @param {Object} params
 * @param {string} [params.pair=XBTUSD] - Kraken pair name
 * @returns {Promise<Object>} normalized ticker data
 */
export async function ticker({ pair = 'XBTUSD' } = {}) {
  const cacheKey = `kraken:ticker:${pair}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/Ticker`, { params: { pair } });
    const key = Object.keys(data.result)[0];
    const t = data.result[key];
    const result = {
      pair,
      last: +t.c[0],
      bid: +t.b[0],
      ask: +t.a[0],
      high: +t.h[1],
      low: +t.l[1],
      volume: +t.v[1],
      vwap: +t.p[1],
      trades: +t.t[1],
      _cached: false,
    };
    cache.set(cacheKey, result, 30);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'kraken');
  }
}

/**
 * Fetch OHLC candles for a trading pair.
 * @param {Object} params
 * @param {string} [params.pair=XBTUSD] - Kraken pair name
 * @param {number} [params.interval=60] - candle interval in minutes
 * @returns {Promise<Object>} normalized OHLC candles
 */
export async function ohlc({ pair = 'XBTUSD', interval = 60 } = {}) {
  const cacheKey = `kraken:ohlc:${pair}:${interval}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/OHLC`, { params: { pair, interval } });
    const candles = data.result[pair] || data.result[Object.keys(data.result).find((k) => k !== 'last')] || [];
    const result = {
      pair,
      interval,
      candles: candles.map((a) => ({
        time: +a[0],
        open: +a[1],
        high: +a[2],
        low: +a[3],
        close: +a[4],
        vwap: +a[5],
        volume: +a[6],
        count: +a[7],
      })),
      _cached: false,
    };
    cache.set(cacheKey, result, 60);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'kraken');
  }
}

/**
 * Fetch recent trades for a trading pair.
 * @param {Object} params
 * @param {string} [params.pair=XBTUSD] - Kraken pair name
 * @param {number} [params.count=10] - max number of trades to return
 * @returns {Promise<Object>} normalized trades array
 */
export async function trades({ pair = 'XBTUSD', count = 10 } = {}) {
  const cacheKey = `kraken:trades:${pair}:${count}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/Trades`, { params: { pair, count } });
    const result = {
      pair,
      trades: (data.result[pair] || []).slice(0, count).map((t) => ({
        price: +t.price,
        volume: +t.vol,
        time: +t.time,
        side: t.type,
      })),
      _cached: false,
    };
    cache.set(cacheKey, result, 30);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'kraken');
  }
}
