/**
 * "Smart" layer — bemora's cross-provider auto-failover namespace.
 *
 * This is the piece a raw copy of public-apis.org can never give you: instead
 * of picking one upstream per category and hoping it stays up, `api.smart.*`
 * races/chains multiple independent free providers for the same category and
 * transparently falls back — down to a stale cache — so a single upstream
 * outage never becomes a caller-visible outage.
 *
 * Built entirely on top of existing bemora primitives (`core/fallback.js`),
 * which previously had only one real consumer (rss.js) despite the whole
 * chain being written for exactly this purpose.
 */
import { fallbackChain, aggregate } from '../core/fallback.js';
import * as weather from './weather.js';
import * as pub from './public-apis.js';
import * as currencyhistory from './currencyhistory.js';
import * as currency from './currency.js';
import * as crypto from './crypto.js';
import * as location from './location.js';
import * as news from './news.js';
import * as rss from './rss.js';
import * as ip from './ip.js';
import * as translate from './translate.js';
import * as utils from './utils.js';

const CRYPTO_SYMBOL_MAP = { bitcoin: 'BTC', ethereum: 'ETH', solana: 'SOL', dogecoin: 'DOGE' };

/**
 * Weather with automatic failover across three independent, unaffiliated
 * sources: OpenWeatherMap (if a key is configured) -> wttr.in (no key) ->
 * Open-Meteo via Nominatim geocoding (no key) -> last known-good cache.
 * @param {{ city: string, units?: string }} params
 * @param {string} [apiKey] - OpenWeatherMap key, optional
 */
export async function weatherAnyProvider({ city, units = 'metric' }, apiKey) {
  const chain = [];
  if (apiKey) {
    chain.push({ name: 'openweathermap', fn: () => weather.getCurrentWeather({ city, units }, apiKey) });
  }
  chain.push(
    { name: 'wttr.in', fn: () => pub.wttrWeather({ city, format: 'full' }) },
    {
      name: 'open-meteo',
      fn: async () => {
        const geo = await location.geocode({ address: city });
        const { lat, lon } = geo.results?.[0] || {};
        return pub.openMeteoWeather({ lat, lon, units: units === 'imperial' ? 'fahrenheit' : 'celsius' });
      },
    },
  );

  return fallbackChain(`smart:weather:${city}:${units}`, chain, 600);
}

/**
 * Top headlines with automatic failover: NewsAPI (if a key is configured) ->
 * BBC World RSS -> Al Jazeera RSS -> Google News RSS -> last known-good cache.
 * @param {{ topic?: string, limit?: number }} params
 * @param {string} [apiKey] - NewsAPI key, optional
 */
export async function newsAnyProvider({ topic, limit = 10 } = {}, apiKey) {
  const chain = [];
  if (apiKey) {
    chain.push({ name: 'newsapi', fn: () => news.searchNews({ q: topic || 'world', pageSize: limit }, apiKey) });
  }
  chain.push(
    { name: 'bbc-world-rss', fn: () => rss.fetchFeed({ source: 'bbc-world', limit }) },
    { name: 'aljazeera-rss', fn: () => rss.fetchFeed({ source: 'aljazeera', limit }) },
    { name: 'google-news-rss', fn: () => rss.fetchFeed({ source: 'google-news', limit }) },
  );

  return fallbackChain(`smart:news:${topic || 'world'}:${limit}`, chain, 600);
}

/**
 * Currency exchange rates with automatic failover across independent,
 * unaffiliated free providers: frankfurter.app (ECB) -> exchangerate-api
 * (if a key is configured) -> last known-good cached reading.
 * @param {{ base?: string, symbols?: string[] }} params
 * @param {string} [apiKey] - ExchangeRate-API key, optional
 */
export async function currencyAnyProvider({ base = 'USD', symbols = [] } = {}, apiKey) {
  const chain = [
    { name: 'frankfurter.app', fn: () => currencyhistory.getLatestRates({ base, symbols }) },
  ];
  if (apiKey) {
    chain.push({ name: 'exchangerate-api', fn: () => currency.getRates({ base, symbols }, apiKey) });
  }

  return fallbackChain(`smart:currency:${base}:${symbols.join(',')}`, chain, 1800);
}

/**
 * Crypto price with automatic failover: CoinGecko -> Binance public ticker
 * -> last known-good cached reading.
 * @param {{ id: string, symbol?: string, currency?: string }} params
 * id: CoinGecko coin id (e.g. 'bitcoin'). symbol: exchange ticker base (e.g. 'BTC'), inferred from id when omitted.
 */
export async function cryptoPriceAnyProvider({ id, symbol, currency: vs = 'usd' }) {
  const tickerSymbol = symbol || CRYPTO_SYMBOL_MAP[id] || id.toUpperCase();
  const chain = [
    { name: 'coingecko', fn: () => crypto.getPrice({ coins: [id], currency: vs }) },
    { name: 'binance', fn: () => pub.binanceTicker({ symbol: `${tickerSymbol.toUpperCase()}${vs.toUpperCase()}` }) },
  ];

  return fallbackChain(`smart:crypto:${id}:${tickerSymbol}:${vs}`, chain, 60);
}

/**
 * IP geolocation with a stale-cache safety net (currently backed by a single
 * no-key provider — ip-api.com — but structured as a chain so a second
 * independent provider can be added without changing the call site).
 * @param {{ ip?: string }} params
 */
export async function ipAnyProvider({ ip: ipAddress = '' } = {}) {
  const chain = [{ name: 'ip-api.com', fn: () => ip.lookup({ ip: ipAddress }) }];
  return fallbackChain(`smart:ip:${ipAddress || 'self'}`, chain, 1800);
}

/**
 * Text translation with a stale-cache safety net (currently backed by
 * MyMemory; structured as a chain so a second independent provider can be
 * added without changing the call site).
 * @param {{ text: string, from?: string, to: string }} params
 */
export async function translateAnyProvider({ text, from = 'auto', to }) {
  const chain = [{ name: 'mymemory', fn: () => translate.translate({ text, from, to }) }];
  return fallbackChain(`smart:translate:${from}:${to}:${text}`, chain, 86400);
}

/**
 * Public holidays with a stale-cache safety net (currently backed by
 * Nager.Date; structured as a chain so a second independent provider can be
 * added without changing the call site).
 * @param {{ country: string, year?: number }} params
 */
export async function holidaysAnyProvider({ country, year = new Date().getFullYear() }) {
  const chain = [{ name: 'nager.date', fn: () => utils.getHolidays({ country, year }) }];
  return fallbackChain(`smart:holidays:${country}:${year}`, chain, 86400);
}

/**
 * Cross-checks live temperature for a city across every reachable no-key
 * source and returns the averaged reading plus each individual value — a
 * sanity check no single-provider wrapper can offer.
 * @param {{ city: string }} params
 * @param {string} [apiKey] - OpenWeatherMap key, optional
 */
export async function weatherAggregate({ city }, apiKey) {
  const geo = await location.geocode({ address: city }).catch(() => null);
  const sources = [
    { name: 'wttr.in', fn: () => pub.wttrWeather({ city, format: 'full' }).then((d) => ({ temperature: parseFloat(d.temperature_c) })) },
  ];
  if (geo?.results?.[0]) {
    const { lat, lon } = geo.results[0];
    sources.push({ name: 'open-meteo', fn: () => pub.openMeteoWeather({ lat, lon }).then((d) => ({ temperature: d.temperature })) });
  }
  if (apiKey) {
    sources.push({ name: 'openweathermap', fn: () => weather.getCurrentWeather({ city }, apiKey).then((d) => ({ temperature: d.temperature })) });
  }
  return aggregate(sources, { strategy: 'average', field: 'temperature' });
}
