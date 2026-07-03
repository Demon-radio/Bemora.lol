/**
 * Combined / smart endpoints that merge data from multiple providers.
 * These don't exist in ANY other library.
 */

import axios from 'axios';
import * as cache from '../core/cache.js';

/**
 * Get a complete market snapshot:
 * Top 10 crypto + gold + silver + top currency rates — all in one call.
 *
 * @param {Object} params
 * @param {string} [params.currency]
 * @param {string} goldKey
 * @param {string} currencyKey
 * @returns {Promise<Object>}
 */
export async function getMarketSnapshot({ currency = 'USD' } = {}, goldKey, currencyKey) {
  const cacheKey = `combined:market:${currency}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const cur = currency.toLowerCase();

  const [cryptoRes, goldRes, fxRes] = await Promise.allSettled([
    axios.get('https://api.coingecko.com/api/v3/coins/markets', {
      params: { vs_currency: cur, order: 'market_cap_desc', per_page: 10, page: 1, sparkline: false },
    }),
    axios.get(`https://www.goldapi.io/api/XAU/${currency}`, {
      headers: { 'x-access-token': goldKey },
    }),
    axios.get(`https://v6.exchangerate-api.com/v6/${currencyKey}/latest/${currency}`),
  ]);

  const crypto = cryptoRes.status === 'fulfilled'
    ? cryptoRes.value.data.map((c) => ({
        name: c.name, symbol: c.symbol.toUpperCase(),
        price: c.current_price, change_24h: c.price_change_percentage_24h,
      }))
    : null;

  const goldData = goldRes.status === 'fulfilled' ? goldRes.value.data : null;
  const fxData = fxRes.status === 'fulfilled' ? fxRes.value.data?.conversion_rates : null;

  const result = {
    currency,
    generated_at: new Date().toISOString(),
    crypto: crypto || [],
    gold: goldData ? {
      price_per_oz: goldData.price,
      price_per_gram_24k: goldData.price_gram_24k,
      change: goldData.ch,
      change_percent: goldData.chp,
    } : null,
    silver: goldData ? { price_per_oz: goldData.price * 0.013 } : null,
    top_fx_rates: fxData
      ? Object.fromEntries(
          ['EUR', 'GBP', 'JPY', 'CNY', 'EGP', 'SAR', 'AED', 'CAD', 'AUD', 'CHF']
            .filter((k) => k !== currency && fxData[k])
            .map((k) => [k, fxData[k]])
        )
      : null,
    _cached: false,
  };

  cache.set(cacheKey, result, 300);
  return result;
}

/**
 * Smart news digest — get news + related Wikipedia summary for the top story.
 * @param {Object} params
 * @param {string} params.topic
 * @param {string} [params.language]
 * @param {string} newsKey
 * @returns {Promise<Object>}
 */
export async function getNewsDigest({ topic, language = 'en' }, newsKey) {
  const cacheKey = `combined:digest:${topic}:${language}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const [newsRes, wikiRes] = await Promise.allSettled([
    axios.get('https://newsapi.org/v2/everything', {
      params: { q: topic, language, sortBy: 'publishedAt', pageSize: 5, apiKey: newsKey },
    }),
    axios.get(
      `https://${language}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topic)}`
    ),
  ]);

  const articles = newsRes.status === 'fulfilled'
    ? newsRes.value.data.articles.map((a) => ({
        title: a.title, source: a.source.name,
        url: a.url, image: a.urlToImage, publishedAt: a.publishedAt,
      }))
    : [];

  const wiki = wikiRes.status === 'fulfilled' ? {
    title: wikiRes.value.data.title,
    summary: wikiRes.value.data.extract,
    url: wikiRes.value.data.content_urls?.desktop?.page,
    image: wikiRes.value.data.thumbnail?.source,
  } : null;

  const result = { topic, language, articles, wikipedia_context: wiki, _cached: false };
  cache.set(cacheKey, result, 900);
  return result;
}
