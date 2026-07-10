import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();

export async function getStockQuote({ symbol }) {
  const cacheKey = `finance:stock:${symbol}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  try {
    const { data } = await http.get(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`);
    const result = { quote: data.chart.result[0], _cached: false };
    cache.set(cacheKey, result, 300);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'finance');
  }
}

export async function getCryptoPrice({ coin }) {
  const cacheKey = `finance:crypto:${coin}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  try {
    const { data } = await http.get('https://api.coingecko.com/api/v3/simple/price', {
      params: { ids: coin, vs_currencies: 'usd' },
    });
    const result = { price: data, _cached: false };
    cache.set(cacheKey, result, 60);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'finance');
  }
}
