/**
 * bemora — Zero API Keys Demo
 * Everything in this file works with NO registration at all.
 *
 * Run: node examples/zero-key-demo.js
 */
import Bemora, { BinanceStream } from 'bemora';

const api = new Bemora(); // no keys passed — still works for 50+ features!

console.log('\n══════════════════════════════════════════════');
console.log('  bemora — ZERO KEYS DEMO');
console.log('══════════════════════════════════════════════\n');

// ─────────────────────────────────────────────
// 1. SMART WEATHER — works without ANY key
//    Tries OWM (if key exists) → wttr.in (free)
// ─────────────────────────────────────────────
console.log('🌤  Smart Weather (no key needed)...');
const weather = await api.smart.weather({ city: 'Cairo' });
console.log(`   ${weather._provider}: ${weather.temperature_c || weather.temperature}°C — ${weather.description || weather.condition}`);

// ─────────────────────────────────────────────
// 2. FREE WEATHER — Open-Meteo (100% free, no key)
// ─────────────────────────────────────────────
console.log('\n🌡  Open-Meteo Weather by coordinates...');
const openMeteo = await api.free.weather({ lat: 30.06, lon: 31.24 }); // Cairo
console.log(`   ${openMeteo.temperature}°C — ${openMeteo.condition}`);

// ─────────────────────────────────────────────
// 3. WTTR.IN — free weather by city name
// ─────────────────────────────────────────────
console.log('\n🌍  wttr.in weather...');
const wttr = await api.free.wttr({ city: 'Cairo', format: 'short' });
console.log(`   ${wttr.summary}`);

// ─────────────────────────────────────────────
// 4. FREE CURRENCY — exchangerate.host (no key)
// ─────────────────────────────────────────────
console.log('\n💱  Free exchange rates (no key)...');
const fx = await api.free.exchangeRates({ base: 'USD', symbols: ['EGP', 'EUR', 'GBP', 'SAR', 'AED'] });
console.log('   USD rates:', fx.rates);

// ─────────────────────────────────────────────
// 5. BINANCE TICKER — no key, real-time price
// ─────────────────────────────────────────────
console.log('\n🪙  Binance ticker (no key)...');
const btc = await api.free.binanceTicker({ symbol: 'BTCUSDT' });
console.log(`   BTC: $${btc.price.toLocaleString()} (${btc.change_24h > 0 ? '+' : ''}${btc.change_24h}% 24h)`);

const cryptos = await api.free.binanceTickers({ symbols: ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'DOGEUSDT'] });
cryptos.forEach((c) => console.log(`   ${c.symbol}: $${c.price?.toLocaleString()}`));

// ─────────────────────────────────────────────
// 6. RSS FEEDS — no key, no registration
// ─────────────────────────────────────────────
console.log('\n📰  BBC News RSS (no key)...');
const bbc = await api.rss.fetch({ source: 'bbc-world', limit: 5 });
bbc.items.forEach((a) => console.log(`   • ${a.title}`));

console.log('\n📡  Al Jazeera RSS...');
const aj = await api.rss.fetch({ source: 'aljazeera', limit: 3 });
aj.items.forEach((a) => console.log(`   • ${a.title}`));

console.log('\n📊  Aggregate 3 news sources...');
const merged = await api.rss.aggregate({
  sources: ['bbc-world', 'hn-top', 'mit-tech'],
  limit: 5,
  sortBy: 'published',
});
merged.items.slice(0, 8).forEach((a) => console.log(`   [${a.source}] ${a.title}`));

// ─────────────────────────────────────────────
// 7. SMART NEWS — tries API first, falls back to RSS
// ─────────────────────────────────────────────
console.log('\n🔀  Smart News (API → BBC → AJ → Google)...');
const smartNews = await api.smart.news({ topic: 'technology', limit: 5 });
console.log(`   Source used: ${smartNews._provider}`);

// ─────────────────────────────────────────────
// 8. SMART CRYPTO — CoinGecko → Binance fallback
// ─────────────────────────────────────────────
console.log('\n🔄  Smart Crypto (CoinGecko → Binance fallback)...');
const smartBTC = await api.smart.crypto({ coin: 'bitcoin' });
console.log(`   Source: ${smartBTC._provider}`);

// ─────────────────────────────────────────────
// 9. REALTIME WEBSOCKET — live Binance stream
// ─────────────────────────────────────────────
console.log('\n📡  Real-time Binance WebSocket (5 updates)...');
const stream = api.realtime.binance(['btcusdt', 'ethusdt']);
let count = 0;
await new Promise((resolve) => {
  stream.on('price', (data) => {
    console.log(`   [live] ${data.symbol}: $${data.price.toLocaleString()} (${data.change_24h}%)`);
    if (++count >= 5) { stream.close(); resolve(); }
  });
});

// ─────────────────────────────────────────────
// 10. MONITOR & ALERT — watch any condition
// ─────────────────────────────────────────────
console.log('\n🔔  Monitor: alert when BTC changes more than 1%...');
api.monitor.watch('btc-1pct', {
  interval: 30000,
  fetch: () => api.free.binanceTicker({ symbol: 'BTCUSDT' }),
  condition: (data) => Math.abs(data.change_24h) > 1,
  onTrigger: (data) => console.log(`   🚨 ALERT: BTC ${data.change_24h}% 24h change!`),
  once: true,
});
console.log('   Monitor running... (will alert on 1% change)');
api.monitor.stop('btc-1pct');

// ─────────────────────────────────────────────
// 11. EXPORT — save data to multiple formats
// ─────────────────────────────────────────────
console.log('\n💾  Export BTC data to JSON + CSV + HTML...');
const exported = await api.export.exportAll({
  data: cryptos,
  dir: './exports',
  name: 'crypto-prices',
  formats: ['json', 'csv', 'html'],
});
console.log('   Exported:', exported.exported.map((e) => e.path));

// ─────────────────────────────────────────────
// 12. ALWAYS-FREE APIs
// ─────────────────────────────────────────────
console.log('\n🌍  Countries (no key)...');
const egypt = await api.countries.byCode({ code: 'EG' });
const eg = egypt.countries[0];
console.log(`   ${eg.flag} ${eg.name} | Capital: ${eg.capital} | Pop: ${eg.population?.toLocaleString()}`);
console.log(`   Languages: ${eg.languages?.join(', ')}`);
console.log(`   Currency: ${eg.currencies?.map((c) => `${c.name} (${c.symbol})`).join(', ')}`);

console.log('\n🌐  Translate (no key)...');
const trans = await api.translate.many({
  text: 'Good morning',
  from: 'en',
  targets: ['ar', 'fr', 'es', 'de'],
});
Object.entries(trans).forEach(([lang, text]) => console.log(`   ${lang}: ${text}`));

console.log('\n📍  Geocode (no key)...');
const geo = await api.location.geocode({ address: 'Pyramids of Giza, Egypt' });
const place = geo.results[0];
console.log(`   ${place.display_name}`);
console.log(`   lat: ${place.lat}, lon: ${place.lon}`);

console.log('\n🎲  Trivia (no key)...');
const trivia = await api.utils.trivia({ amount: 2, difficulty: 'easy' });
trivia.questions.forEach((q, i) => console.log(`   Q${i + 1}: ${q.question} → ${q.correct_answer}`));

console.log('\n📖  Word definition (no key)...');
const def = await api.utils.define({ word: 'serendipity' });
console.log(`   "${def.word}" [${def.phonetic}]`);
console.log(`   ${def.meanings[0]?.definitions[0]?.definition}`);

console.log('\n✅  Done! Everything above ran with ZERO API keys.\n');
console.log('   Available RSS sources:', api.rss.sources().join(', '));
