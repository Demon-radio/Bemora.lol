<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:6366f1,100:8b5cf6&height=200&section=header&text=bemora&fontSize=64&fontColor=ffffff&animation=fadeIn&fontAlignY=38&desc=100+%20tools%20for%20AI%20agents%20and%20apps&descAlignY=60&descSize=18" width="100%" />

<br />

[![version](https://img.shields.io/badge/version-1.0.0--alpha.2-6366f1?style=for-the-badge)](package.json)
[![license](https://img.shields.io/badge/license-MIT-06b6d4?style=for-the-badge)](LICENSE)
[![node](https://img.shields.io/badge/node-%3E%3D18-10b981?style=for-the-badge)](package.json)
[![CI](https://img.shields.io/badge/CI-passing-22c55e?style=for-the-badge)](.github/workflows/ci.yml)
[![upstream](https://img.shields.io/badge/upstream-bemora%203.6.0-8b5cf6?style=for-the-badge)](https://github.com/Demon-radio/Bemora.lol)

<div style="background:#fff3cd;padding:16px;border-radius:8px;margin:16px 0;border:1px solid #ffc107;">
⚠️ <strong>Transparency Note:</strong>
<ul style="margin:8px 0 0 24px;">
<li>This is an <strong>alpha release</strong> — not for mission‑critical use yet!</li>
<li>Currently maintained by a single person (see "Contributing" if you want to help!)</li>
<li>We're working on a third‑party security audit — stay tuned!</li>
</ul>
</div>

<br />

# 🚀 100+ tools for your AI agent in one install

Add bemora to **Cursor**, **Claude Desktop**, or **Windsurf** and your AI gets access to **100+ APIs** with zero config! Perfect for building AI agents, chatbots, internal tools, and more.

[Quick Start](#-quick-start) · [MCP Setup (10 sec)](#-mcp-server-for-cursor--claude) · [All 30+ APIs](#-all-apis) · [AI Agent Docs](#-ai-agent-power)

---

# 🏆 Why bemora?

**For AI agents:** Replace 30+ SDKs with one npm install — structured errors, auto‑retry, PII redaction, cost tracking, circuit breakers, and an MCP server built‑in.

**For apps:** Same great unified API you love, now with production‑grade features for teams.

---

## 100+ APIs, zero boilerplate

Weather · Currency · News · Images · Football · Crypto · Gold · Research  
Location · IP · Countries · Translation · Movies · Food · Space · Stocks  
Music · Social · GitHub · Hacker News · AI (Groq + OpenAI) · Utils  
Islamic (Quran, Azkar, Prayer) · Memes · Animals · Gaming  
Universities · Nutrition (barcode lookup) · Natural Disasters · Blockchain (BTC/ETH) · Web Tools · World Bank Indicators  
**Smart Layer ⭐ — automatic cross-provider failover, unique to bemora**

</div>

---

## Why bemora?

Every project ends up like this:

```bash
npm install axios openweathermap newsapi unsplash-js coingecko-api \
  movie-db translate-api ip-lookup restcountries ...
```

Each with different interfaces, different error shapes, different caching.

**bemora replaces all of them:**

```bash
npm install bemora
```

```js
import Bemora from 'bemora';
const api = new Bemora();

// 100+ APIs. Same interface. Every time.
await api.weather.current({ city: 'Cairo' });
await api.translate.text({ text: 'Hello', from: 'en', to: 'ar' });
await api.movies.trending();
await api.space.apod();
await api.ai.chat({ messages: [{ role: 'user', content: 'What is the capital of Egypt?' }] });
await api.social.githubTrending();
await api.food.random();
await api.utils.define({ word: 'serendipity' });

// Enterprise-only: payments, auth, storage, AI streaming, vector DBs, webhooks
await api.payments.stripe.charge({ amount: 5000, currency: 'usd', source: 'tok_visa' });
await api.auth.clerk.verifySession({ sessionToken });
await api.storage.s3.presignedPutUrl({ bucket: 'uploads', key: 'file.pdf' });
for await (const chunk of api.ai.anthropicStream({ messages })) console.log(chunk);
await api.webhooks.verify('stripe', { payload, signature, secret });
```

---

## 🚀 Quick Start

```bash
npm install bemora
```

Copy `.env.example` → `.env` and fill in your keys (most are free):

```env
BEMORA_WEATHER_KEY=...
BEMORA_NEWS_KEY=...
BEMORA_GROQ_KEY=...       # Free at console.groq.com
# ... see .env.example for all
```

```js
import Bemora from 'bemora';
const api = new Bemora(); // auto-reads from .env

const weather = await api.weather.current({ city: 'Cairo' });
console.log(`${weather.city}: ${weather.temperature}°C`);
```

---

## 📦 All APIs

### ✅ Providers with no API key needed (100% free, no signup)

| Namespace | Provider | What you get |
|-----------|----------|-------------|
| `api.location` | OpenStreetMap / Nominatim | Geocoding, reverse geocode, distance |
| `api.ip` | ip-api.com | IP lookup, batch lookup |
| `api.countries` | restcountries.com | Country info, flags, currencies, languages |
| `api.translate` | MyMemory | Translate text, detect language (1k words/day) |
| `api.crypto` | CoinGecko | Prices, trending, top by market cap |
| `api.food` | TheMealDB | Recipes, random meals, categories |
| `api.space.issPosition` | Open Notify | ISS real-time position |
| `api.music.artist` | MusicBrainz | Artist info, discography |
| `api.music.itunes` | iTunes Search | Songs, albums, artists, previews |
| `api.search` | DuckDuckGo + Wikipedia | Instant answers, full-text search |
| `api.social.githubUser` | GitHub API | User profiles, repos, trending |
| `api.social.hackerNews` | Hacker News | Top stories |
| `api.utils.qr` | qrserver.com | QR code generation |
| `api.utils.shorten` | is.gd | URL shortener |
| `api.utils.time` | WorldTimeAPI | Current time per timezone |
| `api.utils.holidays` | Nager.Date | Public holidays by country |
| `api.utils.quote` | quotable.io | Random quotes |
| `api.utils.define` | Dictionary API | Word definitions, phonetics, audio |
| `api.utils.trivia` | Open Trivia DB | Trivia questions |
| `api.utils.color` | The Color API | Color info from HEX |
| `api.research.wikipedia` | Wikipedia | Search + full article summaries |
| `api.research.books` | Open Library | Book search |
| `api.university` | Hipolabs | University search by name/country |
| `api.nutrition` | Open Food Facts | Barcode lookup, nutrition grades, product search |
| `api.disasters` | NASA EONET | Active wildfires, storms, floods, and other Earth events |
| `api.blockchain` | blockchain.info / BlockCypher / Owlracle | BTC network stats, address balances, ETH gas price |
| `api.webtools` | Google Favicons / thum.io / Microlink | Favicons, screenshots, link-preview metadata |
| `api.worldbank` | World Bank Open Data | GDP, population, and other country indicators |
| `api.smart` ⭐ | bemora (cross-provider) | Auto-failover across independent free providers — see below |

### 🔑 Providers with a free API key (sign up once, 2 minutes)

| Namespace | Provider | Free Limit | Get Key |
|-----------|----------|-----------|---------|
| `api.weather` | OpenWeatherMap | 1,000/day | [openweathermap.org](https://openweathermap.org/api) |
| `api.currency` | ExchangeRate-API | 1,500/month | [exchangerate-api.com](https://www.exchangerate-api.com) |
| `api.news` | NewsAPI | 100/day | [newsapi.org](https://newsapi.org/register) |
| `api.images` | Unsplash | 50/hour | [unsplash.com/developers](https://unsplash.com/developers) |
| `api.images.pexels` | Pexels | 200/hour | [pexels.com/api](https://www.pexels.com/api) |
| `api.football` | API-Football | 100/day | [api-football.com](https://dashboard.api-football.com/register) |
| `api.gold` | GoldAPI | 100/month | [goldapi.io](https://www.goldapi.io) |
| `api.space` | NASA | 1,000/hour | [api.nasa.gov](https://api.nasa.gov) |
| `api.movies` | TMDB | Unlimited | [themoviedb.org](https://www.themoviedb.org/settings/api) |
| `api.stocks` | Alpha Vantage | 25/day | [alphavantage.co](https://www.alphavantage.co/support/#api-key) |
| `api.ai.groq` | Groq (FREE!) | Generous free tier | [console.groq.com](https://console.groq.com) |
| `api.ai.openai` | OpenAI | Pay-per-use | [platform.openai.com](https://platform.openai.com) |

---

## 📖 Complete API Reference

<details>
<summary><strong>🌤 Weather</strong></summary>

```js
// Current conditions
await api.weather.current({ city: 'Cairo', units: 'metric' });

// 5-day forecast
await api.weather.forecast({ city: 'London' });

// ENRICHED: weather + air quality + UV index in one call
await api.enriched.weather({ city: 'Cairo' });
// → temperature, uv_index, uv_risk, air_quality.aqi, air_quality.pm2_5, sunrise, sunset ...

// Compare multiple cities
await api.enriched.compareCities({ cities: ['Cairo', 'Dubai', 'London', 'Paris', 'Tokyo'] });
```
</details>

<details>
<summary><strong>💱 Currency & Finance</strong></summary>

```js
await api.currency.convert({ from: 'USD', to: 'EGP', amount: 1000 });
await api.currency.rates({ base: 'USD', symbols: ['EGP', 'EUR', 'GBP', 'SAR', 'AED'] });

// Stocks
await api.stocks.quote({ symbol: 'AAPL' });
await api.stocks.search({ query: 'Tesla' });
await api.stocks.overview({ symbol: 'MSFT' });

// Full market snapshot (crypto + gold + FX in one call)
await api.combined.marketSnapshot({ currency: 'USD' });
```
</details>

<details>
<summary><strong>🪙 Crypto</strong></summary>

```js
await api.crypto.price({ coins: 'bitcoin' });
await api.crypto.price({ coins: ['bitcoin', 'ethereum', 'solana', 'dogecoin'] });
await api.crypto.top({ limit: 20, currency: 'usd' });
await api.crypto.trending();
```
</details>

<details>
<summary><strong>🥇 Gold & Silver</strong></summary>

```js
await api.gold.price({ currency: 'USD' });
// → price_per_troy_oz, price_gram_24k, price_gram_22k, price_gram_21k, price_gram_18k
await api.gold.price({ currency: 'EGP' });
await api.gold.silver({ currency: 'USD' });
```
</details>

<details>
<summary><strong>📰 News</strong></summary>

```js
await api.news.headlines({ country: 'eg', category: 'technology' });
await api.news.search({ q: 'artificial intelligence', language: 'en', pageSize: 10 });

// News + Wikipedia context merged
await api.combined.newsDigest({ topic: 'Climate Change', language: 'en' });
```
</details>

<details>
<summary><strong>🖼 Images</strong></summary>

```js
await api.images.search({ query: 'pyramids', perPage: 10, orientation: 'landscape' });
await api.images.random({ query: 'nature' });
await api.images.pexels({ query: 'cairo street' });
```
</details>

<details>
<summary><strong>📍 Location & Maps</strong></summary>

```js
// Geocode: address → coordinates (free, no key)
await api.location.geocode({ address: 'Pyramids of Giza, Egypt' });
// → { lat: 29.9792, lon: 31.1342, display_name: '...' }

// Reverse geocode: coordinates → address
await api.location.reverse({ lat: 29.9792, lon: 31.1342 });

// Distance between two points (pure math, no API)
api.location.distance({
  from: { lat: 30.06, lon: 31.24 },
  to: { lat: 25.69, lon: 32.64 },
  unit: 'km'
});
// → { distance: 582.3, unit: 'km' }
```
</details>

<details>
<summary><strong>🌐 IP Intelligence</strong></summary>

```js
// Look up current IP
await api.ip.lookup();
await api.ip.lookup({ ip: 'me' });

// Look up specific IP
await api.ip.lookup({ ip: '8.8.8.8' });
// → country, city, timezone, ISP, lat, lon ...

// Batch look up multiple IPs
await api.ip.batchLookup({ ips: ['8.8.8.8', '1.1.1.1', '208.67.222.222'] });
```
</details>

<details>
<summary><strong>🗺 Countries</strong></summary>

```js
await api.countries.byName({ name: 'Egypt' });
await api.countries.byCode({ code: 'EG' });
await api.countries.byRegion({ region: 'africa' });
await api.countries.all();
// → name, capital, population, area, currencies, languages, flag, timezone, calling_codes ...
```
</details>

<details>
<summary><strong>🌍 Translation</strong></summary>

```js
// Translate (free, no key — 1000 words/day)
await api.translate.text({ text: 'Hello World', from: 'en', to: 'ar' });
// → { translated: 'مرحبا بالعالم', quality: 0.85 }

// Translate to many languages at once
await api.translate.many({
  text: 'Good morning',
  from: 'en',
  targets: ['ar', 'fr', 'de', 'es', 'zh', 'ja', 'ru']
});

// Detect language
await api.translate.detect({ text: 'Bonjour le monde' });
// → { detected: 'fr' }
```
</details>

<details>
<summary><strong>🎬 Movies & TV</strong></summary>

```js
await api.movies.search({ query: 'Inception', year: 2010 });
await api.movies.details({ id: 27205 }); // → cast, trailer URL, budget, revenue ...
await api.movies.trending({ window: 'week' });
await api.movies.tv({ query: 'Breaking Bad' });
```
</details>

<details>
<summary><strong>🍕 Food & Recipes</strong></summary>

```js
await api.food.search({ name: 'Shawarma' });
await api.food.random();
await api.food.byCategory({ category: 'Chicken' });
await api.food.categories();
// → full ingredients list, instructions, YouTube video link
```
</details>

<details>
<summary><strong>⚽ Football</strong></summary>

```js
await api.football.fixtures();
await api.football.fixtures({ date: '2026-07-10' });
await api.football.standings({ league: 39, season: 2025 }); // 39 = Premier League
await api.football.standings({ league: 203, season: 2025 }); // 203 = Egyptian Premier League
await api.football.teams({ name: 'Zamalek' });
```
</details>

<details>
<summary><strong>🚀 Space & NASA</strong></summary>

```js
// Astronomy Picture of the Day (free NASA key)
await api.space.apod();
await api.space.apod({ date: '2024-01-01' });

// Mars Rover photos
await api.space.mars({ rover: 'curiosity', sol: 1000 });

// Near-Earth asteroids
await api.space.asteroids();
// → hazardous, diameter, miss distance, velocity

// ISS live position (no key)
await api.space.issPosition();
// → { lat: 48.2, lon: -23.4, timestamp: ... }
```
</details>

<details>
<summary><strong>📈 Stocks</strong></summary>

```js
await api.stocks.quote({ symbol: 'AAPL' });
await api.stocks.quote({ symbol: 'GOOGL' });
await api.stocks.search({ query: 'saudi aramco' });
await api.stocks.overview({ symbol: 'TSLA' });
// → PE ratio, EPS, market cap, 52-week high/low
```
</details>

<details>
<summary><strong>🎵 Music</strong></summary>

```js
// MusicBrainz (free, no key)
await api.music.artist({ name: 'Amr Diab' });
await api.music.album({ query: 'Nour El Ain', artist: 'Amr Diab' });

// iTunes Search (free, no key)
await api.music.itunes({ term: 'Fairuz', media: 'music', limit: 10 });
// → artist, track, album, preview_url (30s audio), artwork
```
</details>

<details>
<summary><strong>💻 Social & Developer</strong></summary>

```js
await api.social.githubUser({ username: 'torvalds' });
await api.social.githubRepo({ owner: 'facebook', repo: 'react' });
// → stars, forks, language, topics, open issues

await api.social.githubTrending({ language: 'javascript', since: 'daily' });
await api.social.hackerNews({ limit: 10 });
await api.social.productHunt();
```
</details>

<details>
<summary><strong>🤖 AI</strong></summary>

```js
// Groq — ultra-fast, FREE tier (Llama 3, Mixtral)
await api.ai.groq({
  messages: [{ role: 'user', content: 'Explain quantum computing in 2 sentences' }],
  model: 'llama3-8b-8192'
});

// OpenAI — GPT-4o
await api.ai.openai({
  messages: [{ role: 'user', content: 'Write a haiku about Cairo' }],
  model: 'gpt-4o-mini'
});

// Smart router — tries Groq first, falls back to OpenAI
await api.ai.chat({
  system: 'You are a helpful assistant.',
  messages: [{ role: 'user', content: 'What is the population of Egypt?' }]
});

// Generate image with DALL-E 3
await api.ai.imagine({ prompt: 'A cat wearing a pharaoh crown in ancient Egypt' });

// Text embeddings
await api.ai.embed({ input: 'machine learning in Arabic' });
```
</details>

<details>
<summary><strong>🛠 Utilities</strong></summary>

```js
// QR Code (no key)
api.utils.qr({ text: 'https://bemora.dev', size: 300 });
// → { qr_url: 'https://api.qrserver.com/...' }

// URL shortener (no key)
await api.utils.shorten({ url: 'https://very-long-url.com/path' });

// Time & Timezones (no key)
await api.utils.time({ timezone: 'Africa/Cairo' });
await api.utils.timezones();

// Public Holidays (no key)
await api.utils.holidays({ country: 'EG', year: 2026 });

// Quotes (no key)
await api.utils.quote();
await api.utils.quote({ tag: 'technology' });

// Dictionary (no key)
await api.utils.define({ word: 'ephemeral' });
// → phonetic, audio URL, definitions, synonyms, antonyms

// Trivia (no key)
await api.utils.trivia({ amount: 10, difficulty: 'medium', type: 'multiple' });

// Color info (no key)
await api.utils.color({ hex: 'FF5733' });
// → name: "Cinnabar", rgb, hsl, cmyk, image URL
```
</details>

<details>
<summary><strong>🔍 Search</strong></summary>

```js
// DuckDuckGo Instant Answer (no key)
await api.search.instant({ query: 'population of Egypt' });
// → answer, abstract, related topics, infobox

// Wikipedia full-text search (no key)
await api.search.web({ query: 'Cairo history', language: 'ar', limit: 5 });
```
</details>

---

## ⚡ Advanced Features

### 🧠 Smart Layer — the feature a raw API list can't give you

Copying entries out of a public API directory gets you one upstream per
category, with one point of failure. `api.smart.*` is bemora's own
cross-provider auto-failover layer: each call races/chains multiple
**independent** free providers for the same category and falls back all the
way to the last known-good cached value if every provider is down —
completely transparent to the caller.

```js
// Tries OpenWeatherMap (if you configured a key) → wttr.in → cached reading.
// You always get a result object back; you never have to write retry logic.
const weather = await api.smart.weather({ city: 'Cairo' });
console.log(weather._provider); // which provider actually answered

// Tries frankfurter.app (ECB) → ExchangeRate-API (if keyed) → cached reading.
const fx = await api.smart.currency({ base: 'USD', symbols: ['EUR'] });

// Tries CoinGecko → Binance public ticker → cached reading.
const btc = await api.smart.cryptoPrice({ id: 'bitcoin', symbol: 'BTC' });
```

Every `smart.*` response includes `_provider` (who actually answered) and, on
a full outage, `_stale: true` (served from cache) instead of throwing — so a
single upstream going down never becomes a caller-visible outage.

### Batch — run 10 calls in parallel, get 1 result object

```js
import { batch } from 'bemora';

const data = await batch([
  { id: 'weather',  fn: () => api.weather.current({ city: 'Cairo' }) },
  { id: 'bitcoin',  fn: () => api.crypto.price({ coins: 'bitcoin' }) },
  { id: 'gold',     fn: () => api.gold.price() },
  { id: 'news',     fn: () => api.news.headlines({ country: 'eg' }) },
  { id: 'iss',      fn: () => api.space.issPosition() },
  { id: 'apod',     fn: () => api.space.apod() },
  { id: 'trending', fn: () => api.social.githubTrending() },
]);

// All resolved in parallel, failures return { error } not crashes
console.log(data.weather.temperature, data.bitcoin.prices[0].price);
```

### Event System

```js
api.on('request',    ({ provider }) => monitor.track(provider));
api.on('cache:hit',  ({ provider }) => console.log('⚡ Instant:', provider));
api.on('error',      ({ provider, error }) => alerting.send(provider, error));
api.on('*',          ({ event, payload }) => logger.log(event, payload));
```

### Plugin System — extend with any provider

```js
const myPlugin = {
  name: 'prayer-times',
  install(api) {
    api.prayerTimes = {
      async today({ city }) {
        const res = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${city}&country=EG`);
        return (await res.json()).data.timings;
      }
    };
  }
};

api.use(myPlugin);
await api.prayerTimes.today({ city: 'Cairo' });
```

### Health Check

```js
const health = await api.health();
// ✅ openweathermap: 94ms
// ✅ coingecko: 148ms
// ❌ newsapi: offline
```

### Rate Limit Awareness

```js
const limits = api.rateLimits();
limits.filter(l => l.warning).forEach(l =>
  console.warn(`⚠️ ${l.provider}: ${l.used}/${l.limit} per ${l.window}`)
);
```

### Auto-retry with Exponential Backoff

```js
const api = new Bemora(keys, { retries: 3 }); // retry 3 times before throwing
```

---

### 🔌 Circuit Breaker

Dead providers are detected automatically and short-circuited — no more 30-second cascades.

```js
// Check all circuit states
api.circuits.status();
// [{ provider: 'coingecko', state: 'OPEN', failures: 5, openedAt: ... }, ...]

// Force a circuit open (e.g. planned maintenance)
api.circuits.open('coingecko');

// Reset a circuit manually after a fix
api.circuits.close('coingecko');
api.circuits.reset('coingecko'); // delete entry entirely

// Configure thresholds globally
const api = new Bemora(keys, {
  circuitBreaker: {
    failureThreshold: 5,   // consecutive failures before OPEN  (default 5)
    successThreshold: 2,   // successful probes needed to CLOSE  (default 2)
    openDuration: 60_000,  // ms to wait before probing          (default 60 000)
  }
});
```

When a circuit is OPEN, `api.crypto.price(...)` throws a `CircuitBreakerError` immediately — no network call is made. After `openDuration` elapses, one probe request is allowed through (HALF_OPEN). Two successful probes close the circuit.

---

### ⏱ Per-Provider Timeouts

```js
const api = new Bemora(keys, {
  timeout: 10_000,          // global default 10 s
  timeouts: {
    anime: 60_000,          // Jikan is known slow
    coingecko: 5_000,
    nasa: 30_000,
  }
});
```

A `TimeoutError` is thrown (and counted as a failure for the circuit breaker) if the provider doesn't respond in time.

---

### 🚫 AbortController / Signal Support

```js
const ac = new AbortController();
setTimeout(() => ac.abort(), 3000); // cancel after 3 s

const result = await api.crypto.price({ coins: 'bitcoin', signal: ac.signal });
```

Pass `signal` as a property in the first argument of any method. Retries are cancelled immediately when the signal fires.

---

### 📊 Metrics & Observability

```js
// All providers
const all = api.getMetrics();
// [{ provider, requests, errors, errorRate, cacheHits, cacheHitRate,
//    latency: { p50, p95, p99, min, max, avg, samples } }, ...]

// Single provider
const cg = api.getMetrics('coingecko');

// Prometheus text exposition (mount on /metrics)
import express from 'express';
app.get('/metrics', (_req, res) => {
  res.type('text/plain').send(api.metricsPrometheus());
});
```

---

### 🏢 Multi-Tenant Key Management

```js
// Hot-rotate a key without restarting
api.setKey('openai', 'sk-new-key-...');
api.setKey('groq', 'gsk-new-key-...');

// Scoped instance per tenant — inherits global options
const acmeCorp = api.forTenant('acme-corp', {
  openaiKey: 'sk-acme-...',
  groqKey:   'gsk-acme-...',
});
await acmeCorp.ai.chat({ messages: [{ role: 'user', content: 'Hello' }] });
```

---

### 📝 Structured JSON Logging

```bash
# Switch to JSON output for Datadog / ELK / CloudWatch
BEMORA_LOG_FORMAT=json node app.js
# {"ts":"2026-07-05T12:00:00.000Z","level":"info","msg":"coingecko OK (82ms)","provider":"coingecko","latencyMs":82}

# Custom transport
import { logger } from 'bemora/logger';
logger.setTransport((entry) => datadogLogger.log(entry));

# Log levels: silent | error | warn | info | debug
BEMORA_LOG_LEVEL=debug node app.js
```

---

### 🗄 Cache Headers

```js
const api = new Bemora(keys, { cacheHeaders: true });

const result = await api.ip.lookup({ ip: '8.8.8.8' });
// result._cacheStatus   → 'HIT' | 'MISS'
// result._cacheControl  → 'max-age=300, stale-while-revalidate=60'
// result._xCacheStatus  → 'HIT' | 'MISS'
// result._etag          → '"ip-api-300"'
```

Useful when wrapping bemora behind a REST API — forward these headers in your HTTP response to enable edge caching.

---

### 🔍 Response Schema Validation

```js
// Opt-in validation — throws ValidationError on unexpected shape
const api = new Bemora(keys, { validateResponses: true });

try {
  await api.crypto.price({ coins: 'bitcoin' });
} catch (e) {
  if (e instanceof ValidationError) {
    console.error('CoinGecko changed their response format!', e.errors);
  }
}
```

Schemas are defined in `src/core/validate.js`. Providers with schemas: `ip.lookup`, `countries.byName`, `weather.current`, `crypto.price`, `search.web`, `space.iss`, `translate.text`, `food.random`, `food.search`, `social.hackernews`, `location.geocode`, `utils.holidays`, `comics.xkcd`.

---

## 🤖 AI Agent Power

bemora is designed to be the data layer for AI agents. Give your agent access to everything:

```js
import Bemora from 'bemora';
const api = new Bemora();

// Your agent can now:
const tools = {
  getWeather:     ({ city }) => api.weather.current({ city }),
  convertCurrency: ({ from, to, amount }) => api.currency.convert({ from, to, amount }),
  searchNews:     ({ topic }) => api.news.search({ q: topic }),
  searchImages:   ({ query }) => api.images.search({ query }),
  getGoldPrice:   () => api.gold.price(),
  getCrypto:      ({ coin }) => api.crypto.price({ coins: coin }),
  lookupIP:       ({ ip }) => api.ip.lookup({ ip }),
  translateText:  ({ text, to }) => api.translate.text({ text, from: 'auto', to }),
  findMovie:      ({ title }) => api.movies.search({ query: title }),
  getRecipe:      ({ name }) => api.food.search({ name }),
  spacePhoto:     () => api.space.apod(),
  getStockPrice:  ({ symbol }) => api.stocks.quote({ symbol }),
  githubInfo:     ({ username }) => api.social.githubUser({ username }),
  defineWord:     ({ word }) => api.utils.define({ word }),
  searchWiki:     ({ query }) => api.research.wikipedia({ query }),
  getCountry:     ({ name }) => api.countries.byName({ name }),
  chat:           ({ message }) => api.ai.chat({ messages: [{ role: 'user', content: message }] }),
};
```

---

## 🖥 MCP Server (Cursor / Claude / Windsurf / Claude Desktop)

Add bemora to your AI editor — the AI gets **100+ tools** natively!

### For Cursor / Claude Desktop:

#### **`~/.cursor/mcp.json`** (macOS/Linux) or **`%APPDATA%\Cursor\User\mcp.json`** (Windows):
```json
{
  "mcpServers": {
    "bemora": {
      "command": "npx",
    "args": ["-y", "bemora@3.2.1", "bemora-mcp"]
    }
  }
}
```

### For Claude Desktop:

#### **`~/.claude/claude_desktop_config.json`** (macOS)
```json
{
  "mcpServers": {
    "bemora": {
      "command": "npx",
    "args": ["-y", "bemora@3.2.1", "bemora-mcp"],
      "env": {
        "BEMORA_WEATHER_KEY":  "...",
        "BEMORA_NEWS_KEY":     "...",
        "BEMORA_GROQ_KEY":     "...",
        "BEMORA_MOVIES_KEY":   "...",
        "BEMORA_NASA_KEY":     "...",
        "BEMORA_GOLD_KEY":     "..."
      }
    }
  }
}
```

### What's new in MCP Server:
✅ **100+ tools** (all providers auto-discovered!**
✅ **User-friendly API key errors with instructions
✅ **Response trimming** to save context
✅ **Clear tool descriptions** so AI knows when to use which
✅ **Smart fallback tools** (no key needed!)
✅ **All new providers** (Islamic, gaming, memes, animals, space, etc.)


---

## 🖥 CLI

```bash
npm install -g bemora

bemora weather Cairo
bemora convert 500 USD EGP
bemora crypto bitcoin ethereum
bemora gold --currency EGP
bemora news eg --category technology
bemora images "pyramids egypt"
bemora football --date 2026-07-10
bemora wikipedia "النيل" --lang ar
bemora books "arabic literature"
```

---

## 🔌 Write a Plugin (10 lines)

```js
// bemora-plugin-prayer-times.js
export default {
  name: 'prayerTimes',
  install(api) {
    api.prayerTimes = {
      async today({ city, country = 'EG' }) {
        const res = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${city}&country=${country}&method=5`);
        const { data } = await res.json();
        return data.timings;
      }
    };
  }
};

// Usage
import prayerPlugin from 'bemora-plugin-prayer-times';
api.use(prayerPlugin);
await api.prayerTimes.today({ city: 'Cairo' });
// → { Fajr: '03:47', Dhuhr: '12:07', Asr: '15:37', Maghrib: '18:58', Isha: '20:28' }
```

Publish your plugin as `bemora-plugin-<name>` on npm.

---

## 📁 Project Structure

```
bemora/
├── src/
│   ├── index.js              ← Main class
│   ├── cli.js                ← CLI tool
│   ├── core/
│   │   ├── cache.js          ← Auto caching (pluggable adapter)
│   │   ├── circuit.js        ← Circuit breaker (CLOSED/OPEN/HALF_OPEN)
│   │   ├── metrics.js        ← p50/p95/p99 latency + error rates + Prometheus
│   │   ├── retry.js          ← Exponential backoff + AbortSignal
│   │   ├── dedup.js          ← Request deduplication
│   │   ├── events.js         ← Event system
│   │   ├── health.js         ← Provider health checks (real keys)
│   │   ├── ratelimit.js      ← Rate limit tracker + enforcement
│   │   ├── validate.js       ← Zod response schemas (13 providers)
│   │   ├── logger.js         ← Structured JSON + chalk dual-mode
│   │   ├── interceptors.js   ← Request/response interceptors
│   │   ├── middleware.js     ← next()-style middleware chain
│   │   ├── monitor.js        ← Watch + alert system
│   │   ├── batch.js          ← Parallel batch runner
│   │   ├── stale.js          ← Stale-while-revalidate
│   │   └── plugins.js        ← Plugin system (bemora-plugin-* convention)
│   ├── providers/
│   │   ├── weather.js        ← OpenWeatherMap
│   │   ├── currency.js       ← ExchangeRate-API
│   │   ├── news.js           ← NewsAPI
│   │   ├── images.js         ← Unsplash + Pexels
│   │   ├── football.js       ← API-Football
│   │   ├── crypto.js         ← CoinGecko
│   │   ├── gold.js           ← GoldAPI
│   │   ├── research.js       ← Wikipedia + Open Library
│   │   ├── location.js       ← OpenStreetMap/Nominatim
│   │   ├── ip.js             ← ip-api.com
│   │   ├── countries.js      ← restcountries.com
│   │   ├── translate.js      ← MyMemory
│   │   ├── movies.js         ← TMDB
│   │   ├── food.js           ← TheMealDB
│   │   ├── space.js          ← NASA + ISS
│   │   ├── stocks.js         ← Alpha Vantage
│   │   ├── music.js          ← MusicBrainz + iTunes
│   │   ├── social.js         ← GitHub + HN + Product Hunt
│   │   ├── ai.js             ← Groq + OpenAI
│   │   ├── search.js         ← DuckDuckGo + Wikipedia
│   │   ├── utils.js          ← QR + timezone + holidays + quotes + dictionary + trivia + colors
│   │   ├── enriched.js       ← Weather + AQI + UV (merged)
│   │   └── combined.js       ← Market snapshot + News digest (merged)
│   ├── mcp-server/index.js   ← MCP for Cursor/Claude
│   └── types/index.d.ts      ← TypeScript definitions
├── examples/
│   ├── basic-usage.js
│   ├── advanced-features.js
│   └── with-mcp.js
├── .env.example
└── package.json
```

---

## 🤝 Contributing

1. Fork → `git checkout -b feature/my-provider`
2. Add `src/providers/my-provider.js`
3. Export in `src/index.js` under `this.myProvider = ...`
4. Add example in `examples/`
5. Open a PR ✅

---

## 🔄 Migrating from upstream bemora

`bemora` is a production-hardened internal fork of
[bemora 3.6.0](https://github.com/Demon-radio/Bemora.lol). The public API is
fully backward-compatible — every `api.<namespace>.<method>()` call works
exactly as before. The only changes callers need to make are:

### 1 — Change the package name

```diff
-npm install bemora
+npm install bemora
```

```diff
-import Bemora from 'bemora';
+import Bemora from 'bemora';
```

### 2 — Update error imports (if you catch structured errors)

The error class names are unchanged, but four Bemora-prefixed aliases are now
also exported for code that prefers the long-form names:

```js
// Both of these now work:
import { ProviderError }       from 'bemora';
import { BemoraProviderError } from 'bemora';   // alias
```

### 3 — Removed "fun" providers

The following providers were removed because they have no business use case.
If you need them, install the upstream client directly (`npm install bemora`):

- `chucknorris`, `kanye`, `rickmorty`, `harrypotter`, `starwars`,
  `pokemon`, `dadjokes`, `bored`, `memes`, `zodiac`, `advice`,
  `randomuser`, `fun`

### 4 — New enterprise-only namespaces

These namespaces are new in the enterprise fork (no upstream equivalent):

| Namespace | What it adds |
|-----------|--------------|
| `api.payments.stripe` / `.paypal` | Charges, subscriptions, refunds, webhook verify |
| `api.email.sendgrid` / `.ses` / `.resend` | Transactional email + batch + webhook verify |
| `api.sms.twilio` | Send, lookup, webhook verify |
| `api.auth.clerk` / `.auth0` / `.jwt` | Session verify, user management, JWT helpers |
| `api.storage.s3` / `.r2` / `.gcs` | Presigned URLs, upload, download, delete |
| `api.ai.anthropic` / `api.ai.anthropicStream` etc. | Anthropic, Gemini, Cohere, Mistral, Together, Perplexity with streaming — merged into the existing `api.ai` namespace |
| `api.vectordb.*` | Pinecone, Qdrant, Weaviate, pgvector — upsert, query, delete |
| `api.webhooks` | Unified verify + inbound router for Stripe, Twilio, GitHub, Clerk, Resend |
| `api.observability.*` | Sentry, OpenTelemetry auto-span |
| `api.security.*` | HIBP, VirusTotal, Safe Browsing, URLScan |
| `api.cloudflare.*` | DNS, R2, Cache, Workers |
| `api.costs.snapshot()` | Per-provider / per-tenant LLM cost tracking |
| `api.withTenant(id, keys)` | Per-customer key isolation |
| `api.circuits.*` | Circuit breaker state + manual control |

---

## 📄 License

MIT — see [LICENSE](LICENSE)

---

<div align="center">

**Enterprise-hardened. Production-ready. Internally maintained.**

</div>
