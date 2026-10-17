import Bemora, { batch } from 'bemora';

const api = new Bemora({
  weatherKey:  process.env.BEMORA_WEATHER_KEY,
  currencyKey: process.env.BEMORA_CURRENCY_KEY,
  newsKey:     process.env.BEMORA_NEWS_KEY,
  goldKey:     process.env.BEMORA_GOLD_KEY,
});

// ─────────────────────────────────────────────
// 1. EVENT SYSTEM — know exactly what's happening
// ─────────────────────────────────────────────
api.on('cache:hit',  ({ provider }) => console.log(`⚡ Cache hit: ${provider}`));
api.on('error',      ({ provider, error }) => console.error(`❌ ${provider}: ${error}`));
api.on('*',          ({ event }) => console.log(`[event] ${event}`));

// ─────────────────────────────────────────────
// 2. BATCH — run multiple API calls in parallel
// ─────────────────────────────────────────────
const results = await batch([
  { id: 'cairo',   fn: () => api.weather.current({ city: 'Cairo' }) },
  { id: 'london',  fn: () => api.weather.current({ city: 'London' }) },
  { id: 'bitcoin', fn: () => api.crypto.price({ coins: 'bitcoin' }) },
  { id: 'gold',    fn: () => api.gold.price({ currency: 'USD' }) },
]);

console.log('Cairo temp:', results.cairo.temperature);
console.log('London temp:', results.london.temperature);
console.log('BTC price:', results.bitcoin.prices[0].price);
console.log('Gold per oz:', results.gold.price_per_troy_oz);

// ─────────────────────────────────────────────
// 3. ENRICHED WEATHER — weather + air quality + UV index
// ─────────────────────────────────────────────
const enriched = await api.enriched.weather({ city: 'Cairo' });
console.log(`
  City:         ${enriched.city}
  Temp:         ${enriched.temperature}°C
  UV Index:     ${enriched.uv_index} (${enriched.uv_risk})
  Air Quality:  AQI ${enriched.air_quality?.aqi} — ${enriched.air_quality?.label}
  PM2.5:        ${enriched.air_quality?.pm2_5} μg/m³
  Sunrise:      ${enriched.sunrise}
`);

// ─────────────────────────────────────────────
// 4. COMPARE CITIES — weather for multiple cities at once
// ─────────────────────────────────────────────
const cities = await api.enriched.compareCities({
  cities: ['Cairo', 'Dubai', 'London', 'New York', 'Tokyo'],
});
cities.forEach((c) => console.log(`${c.city}: ${c.temperature}°C (${c.condition})`));

// ─────────────────────────────────────────────
// 5. MARKET SNAPSHOT — crypto + gold + FX in one shot
// ─────────────────────────────────────────────
const market = await api.combined.marketSnapshot({ currency: 'USD' });
console.log('Top crypto:', market.crypto.map((c) => `${c.symbol} $${c.price}`));
console.log('Gold:', market.gold.price_per_oz);
console.log('EGP rate:', market.top_fx_rates?.EGP);

// ─────────────────────────────────────────────
// 6. NEWS DIGEST — news + Wikipedia context together
// ─────────────────────────────────────────────
const digest = await api.combined.newsDigest({ topic: 'Artificial Intelligence' });
console.log('Wiki summary:', digest.wikipedia_context?.summary?.slice(0, 200));
console.log('Top article:', digest.articles[0]?.title);

// ─────────────────────────────────────────────
// 7. PLUGIN SYSTEM — extend with your own provider
// ─────────────────────────────────────────────
const stocksPlugin = {
  name: 'stocks',
  install(api) {
    api.stocks = {
      price: async ({ symbol }) => {
        // integrate your own stock API here
        return { symbol, note: 'plug in your stock provider here' };
      },
    };
  },
};

api.use(stocksPlugin);
console.log('Plugins:', api.plugins()); // ['stocks']
const stock = await api.stocks.price({ symbol: 'AAPL' });
console.log(stock);

// ─────────────────────────────────────────────
// 8. HEALTH CHECK — ping all providers
// ─────────────────────────────────────────────
const health = await api.health();
health.forEach((h) => {
  const icon = h.status === 'online' ? '✅' : '❌';
  console.log(`${icon} ${h.provider}: ${h.responseTime || 'offline'}`);
});

// ─────────────────────────────────────────────
// 9. RATE LIMIT AWARENESS
// ─────────────────────────────────────────────
const limits = api.rateLimits();
limits.forEach((l) => {
  if (l.warning) console.warn(`⚠️  ${l.provider}: ${l.used}/${l.limit} (${l.window}) — approaching limit!`);
});
