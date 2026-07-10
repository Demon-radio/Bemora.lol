import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';
import { logger } from '../core/logger.js';

const http = httpClient();

export async function getGoldPrice({ currency = 'USD' } = {}, apiKey) {
  const cacheKey = `gold:price:${currency}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  try {
    const { data } = await http.get(`https://www.goldapi.io/api/XAU/${currency}`, {
      headers: { 'x-access-token': apiKey },
    });

    const result = {
      metal: 'Gold (XAU)',
      currency,
      price_per_troy_oz: data.price,
      price_per_gram: data.price_gram_24k,
      price_gram_22k: data.price_gram_22k,
      price_gram_21k: data.price_gram_21k,
      price_gram_18k: data.price_gram_18k,
      change: data.ch,
      change_percent: data.chp,
      updated_at: data.timestamp,
      _cached: false,
    };

    cache.set(cacheKey, result, 300);
    logger.info(`Gold price fetched in ${currency}`);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'gold');
  }
}

export async function getSilverPrice({ currency = 'USD' } = {}, apiKey) {
  const cacheKey = `silver:price:${currency}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  try {
    const { data } = await http.get(`https://www.goldapi.io/api/XAG/${currency}`, {
      headers: { 'x-access-token': apiKey },
    });

    const result = {
      metal: 'Silver (XAG)',
      currency,
      price_per_troy_oz: data.price,
      price_per_gram: data.price_gram_24k,
      change: data.ch,
      change_percent: data.chp,
      updated_at: data.timestamp,
      _cached: false,
    };

    cache.set(cacheKey, result, 300);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'gold');
  }
}
