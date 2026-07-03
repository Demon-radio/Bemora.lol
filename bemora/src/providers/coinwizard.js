import axios from 'axios';
import * as cache from '../core/cache.js';

const BASE = 'https://api.coingecko.com/api/v3';

export async function coinInfo({ id }) {
  const cacheKey = `coinwizard:info:${id}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  const { data } = await axios.get(`${BASE}/coins/${encodeURIComponent(id)}`, {
    params: { localization: false, tickers: false, community_data: false, developer_data: false },
  });
  const result = {
    id: data.id,
    symbol: data.symbol,
    name: data.name,
    description: data.description?.en?.split('. ')[0],
    homepage: data.links?.homepage?.[0],
    market_cap_rank: data.market_cap_rank,
    price_usd: data.market_data?.current_price?.usd,
    ath_usd: data.market_data?.ath?.usd,
    atl_usd: data.market_data?.atl?.usd,
    price_change_24h_pct: data.market_data?.price_change_percentage_24h,
    circulating_supply: data.market_data?.circulating_supply,
    total_supply: data.market_data?.total_supply,
    max_supply: data.market_data?.max_supply,
    _cached: false,
  };
  cache.set(cacheKey, result, 300);
  return result;
}

export async function marketChart({ id, days = 7, vsCurrency = 'usd' }) {
  const cacheKey = `coinwizard:chart:${id}:${days}:${vsCurrency}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  const { data } = await axios.get(`${BASE}/coins/${encodeURIComponent(id)}/market_chart`, {
    params: { vs_currency: vsCurrency, days },
  });
  const result = {
    id, days, vs_currency: vsCurrency,
    prices: data.prices?.map(([t, p]) => ({ time: new Date(t).toISOString(), price: p })),
    market_caps: data.market_caps?.map(([t, m]) => ({ time: new Date(t).toISOString(), market_cap: m })),
    _cached: false,
  };
  cache.set(cacheKey, result, 600);
  return result;
}

export async function ohlc({ id, days = 7, vsCurrency = 'usd' }) {
  const { data } = await axios.get(`${BASE}/coins/${encodeURIComponent(id)}/ohlc`, { params: { vs_currency: vsCurrency, days } });
  return { id, days, vs_currency: vsCurrency, candles: data.map(([t, o, h, l, c]) => ({ time: new Date(t).toISOString(), open: o, high: h, low: l, close: c })) };
}

export async function globalMarket() {
  const cacheKey = 'coinwizard:global';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  const { data } = await axios.get(`${BASE}/global`);
  const d = data.data;
  const result = {
    active_cryptocurrencies: d.active_cryptocurrencies,
    markets: d.markets,
    total_market_cap_usd: d.total_market_cap?.usd,
    total_volume_usd: d.total_volume?.usd,
    market_cap_change_pct_24h: d.market_cap_change_percentage_24h_usd,
    btc_dominance: d.market_cap_percentage?.btc,
    eth_dominance: d.market_cap_percentage?.eth,
    _cached: false,
  };
  cache.set(cacheKey, result, 300);
  return result;
}

export async function exchanges({ limit = 10 } = {}) {
  const cacheKey = `coinwizard:exchanges:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  const { data } = await axios.get(`${BASE}/exchanges`, { params: { per_page: limit, page: 1 } });
  const result = { exchanges: data.map((e) => ({ name: e.name, trust_score: e.trust_score, trust_score_rank: e.trust_score_rank, trade_volume_24h_btc: e.trade_volume_24h_btc, country: e.country, url: e.url })), _cached: false };
  cache.set(cacheKey, result, 3600);
  return result;
}

export async function categories({ limit = 15 } = {}) {
  const cacheKey = `coinwizard:categories:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  const { data } = await axios.get(`${BASE}/coins/categories`);
  const result = { categories: data.slice(0, limit).map((c) => ({ name: c.name, market_cap: c.market_cap, market_cap_change_24h: c.market_cap_change_24h, top_3_coins: c.top_3_coins })), _cached: false };
  cache.set(cacheKey, result, 3600);
  return result;
}

export async function gainersLosers({ limit = 10, vsCurrency = 'usd' } = {}) {
  const cacheKey = `coinwizard:movers:${limit}:${vsCurrency}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  const { data } = await axios.get(`${BASE}/coins/markets`, {
    params: { vs_currency: vsCurrency, order: 'market_cap_desc', per_page: 100, page: 1, price_change_percentage: '24h' },
  });
  const sorted = [...data].sort((a, b) => (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0));
  const result = {
    gainers: sorted.slice(0, limit).map((c) => ({ id: c.id, symbol: c.symbol, name: c.name, price: c.current_price, change_24h_pct: c.price_change_percentage_24h })),
    losers: sorted.slice(-limit).reverse().map((c) => ({ id: c.id, symbol: c.symbol, name: c.name, price: c.current_price, change_24h_pct: c.price_change_percentage_24h })),
    _cached: false,
  };
  cache.set(cacheKey, result, 300);
  return result;
}

export async function searchCoins({ query }) {
  const { data } = await axios.get(`${BASE}/search`, { params: { query } });
  return {
    coins: data.coins?.slice(0, 10).map((c) => ({ id: c.id, symbol: c.symbol, name: c.name, market_cap_rank: c.market_cap_rank })),
    exchanges: data.exchanges?.slice(0, 5).map((e) => ({ id: e.id, name: e.name })),
  };
}

export async function convertCoin({ id, amount = 1, vsCurrency = 'usd' }) {
  const { data } = await axios.get(`${BASE}/simple/price`, { params: { ids: id, vs_currencies: vsCurrency } });
  const price = data[id]?.[vsCurrency];
  if (price === undefined) throw new Error(`Unable to find price for "${id}" in "${vsCurrency}"`);
  return { id, amount, vs_currency: vsCurrency, unit_price: price, total: parseFloat((price * amount).toFixed(8)) };
}

export async function supportedCoinsList() {
  const cacheKey = 'coinwizard:list';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  const { data } = await axios.get(`${BASE}/coins/list`);
  const result = { count: data.length, coins: data.slice(0, 200) , _cached: false };
  cache.set(cacheKey, result, 86400);
  return result;
}
