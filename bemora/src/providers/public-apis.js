import axios from 'axios';
import * as cache from '../core/cache.js';
import { USER_AGENT } from '../core/headers.js';

/**
 * Open-Meteo — completely free weather, no key, no registration
 * https://open-meteo.com
 *
 * @param {{ lat: number, lon: number, units?: 'celsius'|'fahrenheit' }} params
 */
export async function openMeteoWeather({ lat, lon, units = 'celsius' }) {
  const cacheKey = `pub:weather:${lat}:${lon}:${units}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data } = await axios.get('https://api.open-meteo.com/v1/forecast', {
    params: {
      latitude: lat, longitude: lon,
      current_weather: true,
      hourly: 'temperature_2m,relativehumidity_2m,windspeed_10m,weathercode',
      temperature_unit: units,
      timezone: 'auto',
      forecast_days: 1,
    },
  });

  const c = data.current_weather;
  const WMO_CODES = {
    0:'Clear sky', 1:'Mainly clear', 2:'Partly cloudy', 3:'Overcast',
    45:'Foggy', 51:'Light drizzle', 61:'Light rain', 71:'Light snow',
    80:'Rain showers', 95:'Thunderstorm',
  };

  const result = {
    provider: 'open-meteo',
    lat: data.latitude, lon: data.longitude,
    timezone: data.timezone,
    temperature: c.temperature,
    wind_speed: c.windspeed,
    condition: WMO_CODES[c.weathercode] || `WMO ${c.weathercode}`,
    units,
    _cached: false,
  };

  cache.set(cacheKey, result, 600);
  return result;
}

/**
 * wttr.in — weather in one line (no key)
 * @param {{ city: string, format?: 'short'|'full' }} params
 */
export async function wttrWeather({ city, format = 'short' }) {
  const cacheKey = `pub:wttr:${city}:${format}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  if (format === 'short') {
    const { data } = await axios.get(`https://wttr.in/${encodeURIComponent(city)}?format=%l:+%C+%t+💧%h+💨%w`, {
      headers: { 'User-Agent': USER_AGENT },
    });
    const result = { city, summary: data.trim(), provider: 'wttr.in', _cached: false };
    cache.set(cacheKey, result, 600);
    return result;
  }

  const { data } = await axios.get(`https://wttr.in/${encodeURIComponent(city)}?format=j1`, {
    headers: { 'User-Agent': USER_AGENT },
  });

  const cur = data.current_condition?.[0];
  const result = {
    city, provider: 'wttr.in',
    temperature_c: cur?.temp_C,
    temperature_f: cur?.temp_F,
    feels_like_c: cur?.FeelsLikeC,
    humidity: cur?.humidity,
    description: cur?.weatherDesc?.[0]?.value,
    wind_kmph: cur?.windspeedKmph,
    visibility_km: cur?.visibility,
    uv_index: cur?.uvIndex,
    _cached: false,
  };

  cache.set(cacheKey, result, 600);
  return result;
}

/**
 * exchangerate.host — free currency API, no key
 * @param {{ base?: string, symbols?: string[] }} params
 */
export async function freeExchangeRates({ base = 'USD', symbols = [] } = {}) {
  const cacheKey = `pub:fx:${base}:${symbols.join(',')}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const params = { base };
  if (symbols.length) params.symbols = symbols.join(',');

  const { data } = await axios.get('https://api.exchangerate.host/latest', { params });

  let rates = data.rates || {};
  if (symbols.length) {
    rates = Object.fromEntries(Object.entries(rates).filter(([k]) => symbols.includes(k)));
  }

  const result = { provider: 'exchangerate.host', base, date: data.date, rates, _cached: false };
  cache.set(cacheKey, result, 3600);
  return result;
}

/**
 * OpenLigaDB — free football data for German leagues (no key)
 * @param {{ league?: string, season?: number }} params
 * league: 'bl1' (Bundesliga), 'bl2', 'bl3'
 */
export async function openLigaFixtures({ league = 'bl1', season } = {}) {
  const cacheKey = `pub:football:${league}:${season}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const url = season
    ? `https://api.openligadb.de/getmatchdata/${league}/${season}`
    : `https://api.openligadb.de/getmatchdata/${league}`;

  const { data } = await axios.get(url);

  const result = {
    provider: 'openligadb',
    league,
    matches: data.slice(0, 20).map((m) => ({
      id: m.MatchID,
      date: m.MatchDateTime,
      home: m.Team1?.TeamName,
      away: m.Team2?.TeamName,
      score: m.MatchIsFinished
        ? `${m.MatchResults?.[0]?.PointsTeam1 ?? '?'} - ${m.MatchResults?.[0]?.PointsTeam2 ?? '?'}`
        : 'upcoming',
      finished: m.MatchIsFinished,
    })),
    _cached: false,
  };

  cache.set(cacheKey, result, 300);
  return result;
}

/**
 * MetalPriceAPI — free metals endpoint (limited, no key)
 * Fallback when GoldAPI key is missing
 */
export async function freeMetalPrice({ metal = 'XAU', currency = 'USD' } = {}) {
  const cacheKey = `pub:metal:${metal}:${currency}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  // Use frankfurter.app with gold commodity approximation
  const { data } = await axios.get(
    `https://api.frankfurter.app/latest?from=${metal}&to=${currency}`
  );

  const result = {
    provider: 'frankfurter.app',
    metal,
    currency,
    rate: data.rates?.[currency],
    date: data.date,
    _cached: false,
  };

  cache.set(cacheKey, result, 600);
  return result;
}

/**
 * Binance public ticker — real-time crypto prices (no key)
 * @param {{ symbol: string }} params — e.g. 'BTCUSDT', 'ETHUSDT'
 */
export async function binanceTicker({ symbol }) {
  const cacheKey = `pub:binance:${symbol}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data } = await axios.get('https://api.binance.com/api/v3/ticker/24hr', {
    params: { symbol: symbol.toUpperCase() },
  });

  const result = {
    provider: 'binance',
    symbol: data.symbol,
    price: parseFloat(data.lastPrice),
    change_24h: parseFloat(data.priceChangePercent),
    high_24h: parseFloat(data.highPrice),
    low_24h: parseFloat(data.lowPrice),
    volume_24h: parseFloat(data.volume),
    _cached: false,
  };

  cache.set(cacheKey, result, 30);
  return result;
}

/**
 * Binance multiple tickers at once
 * @param {{ symbols: string[] }} params
 */
export async function binanceTickers({ symbols }) {
  const results = await Promise.allSettled(
    symbols.map((s) => binanceTicker({ symbol: s }))
  );
  return results.map((r, i) =>
    r.status === 'fulfilled' ? r.value : { symbol: symbols[i], error: r.reason?.message }
  );
}
