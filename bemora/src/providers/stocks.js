import * as cache from '../core/cache.js';
import { httpClient } from '../core/http.js';
import { ValidationError, wrapProviderError } from '../core/errors.js';

const http = httpClient();
const BASE = 'https://www.alphavantage.co/query';

/**
 * Get stock quote (Alpha Vantage — free 25 requests/day)
 * Free key: https://www.alphavantage.co/support/#api-key
 * @param {{ symbol: string }} params
 * @param {string} apiKey
 */
export async function getQuote({ symbol }, apiKey) {
  const cacheKey = `stocks:quote:${symbol}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  try {
    const { data } = await http.get(BASE, {
      params: { function: 'GLOBAL_QUOTE', symbol, apikey: apiKey },
    });

    const q = data['Global Quote'];
    if (!q || !q['01. symbol']) throw new ValidationError(`No data for symbol: ${symbol}`, { provider: 'stocks' });

    const result = {
      symbol: q['01. symbol'],
      price: parseFloat(q['05. price']),
      open: parseFloat(q['02. open']),
      high: parseFloat(q['03. high']),
      low: parseFloat(q['04. low']),
      volume: parseInt(q['06. volume']),
      previous_close: parseFloat(q['08. previous close']),
      change: parseFloat(q['09. change']),
      change_percent: q['10. change percent'],
      latest_trading_day: q['07. latest trading day'],
      _cached: false,
    };

    cache.set(cacheKey, result, 300);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'stocks');
  }
}

/**
 * Search for stocks by keyword
 * @param {{ query: string }} params
 * @param {string} apiKey
 */
export async function searchStocks({ query }, apiKey) {
  const cacheKey = `stocks:search:${query}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  try {
    const { data } = await http.get(BASE, {
      params: { function: 'SYMBOL_SEARCH', keywords: query, apikey: apiKey },
    });

    const result = {
      matches: (data.bestMatches || []).map((m) => ({
        symbol: m['1. symbol'],
        name: m['2. name'],
        type: m['3. type'],
        region: m['4. region'],
        currency: m['8. currency'],
        match_score: m['9. matchScore'],
      })),
      _cached: false,
    };

    cache.set(cacheKey, result, 86400);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'stocks');
  }
}

/**
 * Get company overview
 * @param {{ symbol: string }} params
 * @param {string} apiKey
 */
export async function getOverview({ symbol }, apiKey) {
  const cacheKey = `stocks:overview:${symbol}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  try {
    const { data } = await http.get(BASE, {
      params: { function: 'OVERVIEW', symbol, apikey: apiKey },
    });

    if (!data.Symbol) throw new ValidationError(`No overview for: ${symbol}`, { provider: 'stocks' });

    const result = {
      symbol: data.Symbol,
      name: data.Name,
      description: data.Description,
      exchange: data.Exchange,
      currency: data.Currency,
      country: data.Country,
      sector: data.Sector,
      industry: data.Industry,
      market_cap: data.MarketCapitalization,
      pe_ratio: data.PERatio,
      eps: data.EPS,
      dividend_yield: data.DividendYield,
      week_52_high: data['52WeekHigh'],
      week_52_low: data['52WeekLow'],
      _cached: false,
    };

    cache.set(cacheKey, result, 3600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'stocks');
  }
}
