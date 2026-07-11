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
import { fallbackChain } from '../core/fallback.js';
import * as weather from './weather.js';
import * as pub from './public-apis.js';
import * as currencyhistory from './currencyhistory.js';
import * as crypto from './crypto.js';

/**
 * Weather with automatic failover: OpenWeatherMap (if a key is configured)
 * -> wttr.in (no key) -> last known-good cached reading.
 * @param {{ city: string, units?: string }} params
 * @param {string} [apiKey] - OpenWeatherMap key, optional
 */
export async function weatherAnyProvider({ city, units = 'metric' }, apiKey) {
  const chain = [];
  if (apiKey) {
    chain.push({ name: 'openweathermap', fn: () => weather.getCurrentWeather({ city, units }, apiKey) });
  }
  chain.push({ name: 'wttr.in', fn: () => pub.wttrWeather({ city, format: 'full' }) });

  return fallbackChain(`smart:weather:${city}:${units}`, chain, 600);
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
    const { getRates } = await import('./currency.js');
    chain.push({ name: 'exchangerate-api', fn: () => getRates({ base, symbols }, apiKey) });
  }

  return fallbackChain(`smart:currency:${base}:${symbols.join(',')}`, chain, 1800);
}

/**
 * Crypto price with automatic failover: CoinGecko -> Binance public ticker
 * -> last known-good cached reading.
 * @param {{ id: string, symbol: string, currency?: string }} params
 * id: CoinGecko coin id (e.g. 'bitcoin'). symbol: exchange ticker (e.g. 'BTC').
 */
export async function cryptoPriceAnyProvider({ id, symbol, currency = 'usd' }) {
  const chain = [
    { name: 'coingecko', fn: () => crypto.getPrice({ coins: [id], currency }) },
    { name: 'binance', fn: () => pub.binanceTicker({ symbol: `${symbol.toUpperCase()}${currency.toUpperCase()}` }) },
  ];

  return fallbackChain(`smart:crypto:${id}:${symbol}:${currency}`, chain, 60);
}
