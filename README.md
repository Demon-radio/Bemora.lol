<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:6366f1,100:8b5cf6&height=200&section=header&text=bemora&fontSize=80&fontColor=ffffff&animation=fadeIn&fontAlignY=38&desc=The%20only%20API%20library%20your%20AI%20agent%20will%20ever%20need&descAlignY=60&descSize=18" width="100%" />

<br/>

[![npm version](https://img.shields.io/npm/v/bemora?style=for-the-badge&color=6366f1)](https://www.npmjs.com/package/bemora)
[![npm downloads](https://img.shields.io/npm/dm/bemora?style=for-the-badge&color=8b5cf6)](https://www.npmjs.com/package/bemora)
[![license](https://img.shields.io/npm/l/bemora?style=for-the-badge&color=06b6d4)](LICENSE)
[![node](https://img.shields.io/node/v/bemora?style=for-the-badge&color=10b981)](package.json)
[![GitHub stars](https://img.shields.io/github/stars/Demon-radio/Bemora.lol?style=for-the-badge&color=f59e0b)](https://github.com/Demon-radio/Bemora.lol/stargazers)

<br/>

**85+ API categories. 300+ methods. One library. Zero frustration.**

Weather · Currency · News · Images · Football · Crypto (+ Coin Wizard) · Gold · Research  
Location · IP · Countries · Translation · Movies · Food · Space · Stocks  
Music · Social · GitHub · Hacker News · AI (Groq + OpenAI) · Pokémon · Star Wars  
Rick and Morty · Harry Potter · COVID-19 · Earthquakes · Air Quality · Astronomy  
Postal Codes · Breweries · Sports · Domain Lookup · Utils · and 60+ more

<br/>

[Quick Start](#-quick-start) · [All 85+ APIs](#-all-apis) · [Coin Wizard](#-coin-wizard) · [Advanced Features](#-advanced-features) · [AI Agent Power](#-ai-agent-power) · [MCP Server](#-mcp-server) · [CLI](#-cli)

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

// 85+ APIs. Same interface. Every time.
await api.weather.current({ city: 'Cairo' });
await api.translate.text({ text: 'Hello', from: 'en', to: 'ar' });
await api.movies.trending();
await api.space.apod();
await api.ai.chat({ messages: [{ role: 'user', content: 'What is the capital of Egypt?' }] });
await api.social.githubTrending();
await api.food.random();
await api.utils.define({ word: 'serendipity' });
await api.coinWizard.info({ id: 'bitcoin' });
await api.pokemon.get({ name: 'pikachu' });
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
| `api.coinWizard` | CoinGecko | Deep crypto: charts, OHLC, global stats, gainers/losers, converter |
| `api.pokemon` | PokéAPI | Pokémon stats, abilities, types, moves |
| `api.rickmorty` | Rick and Morty API | Characters, episodes, locations |
| `api.starwars` | SWAPI | People, planets, starships, films |
| `api.harrypotter` | HP API | Characters, houses, wands, patronuses |
| `api.covid` | disease.sh | Global + per-country COVID-19 stats |
| `api.earthquake` | USGS | Recent earthquakes by magnitude/region |
| `api.airquality` | Open-Meteo | Real-time air quality (AQI, PM2.5, PM10) |
| `api.astronomy` | Sunrise-Sunset.org | Sunrise, sunset, solar noon, day length |
| `api.postal` | Zippopotam.us | Postal/zip code → city, state, coordinates |
| `api.predict` | Agify/Genderize/Nationalize | Predict age, gender, nationality from a name |
| `api.brewery` | Open Brewery DB | Search breweries by city, state, type |
| `api.chucknorris` | Chuck Norris API | Random Chuck Norris jokes |
| `api.bored` | Bored API + fallback | Random activity suggestions |
| `api.sportsdb` | TheSportsDB | Search teams, players, events |
| `api.baseball` | MLB Stats API | MLB teams, schedules, scores |
| `api.hockey` | NHL API | NHL standings, player lookup |
| `api.domain` | RDAP / WHOIS-like | Domain availability + registration info |
| `api.placeholder` | Multiple | Placeholder images, avatars, lorem ipsum |
| `api.weatheralerts` | NWS | Active US weather alerts by state |

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
<summary><strong>🧙 Coin Wizard — deep crypto toolkit</strong></summary>

```js
// Full coin profile: description, links, market data, all-time high/low
await api.coinWizard.info({ id: 'bitcoin' });

// Historical price chart (days: 1, 7, 30, 90, 365, 'max')
await api.coinWizard.chart({ id: 'ethereum', days: 30, currency: 'usd' });

// OHLC candlestick data
await api.coinWizard.ohlc({ id: 'bitcoin', days: 7 });

// Global crypto market overview
await api.coinWizard.global();
// → total_market_cap, total_volume, btc_dominance, active_cryptocurrencies

// Exchanges ranked by trust score
await api.coinWizard.exchanges({ limit: 10 });

// All coin categories (DeFi, Layer 1, Meme, etc.)
await api.coinWizard.categories();

// Top gainers & losers in the last 24h
await api.coinWizard.gainersLosers({ limit: 10 });

// Fuzzy search for any coin, exchange, or category
await api.coinWizard.search({ query: 'doge' });

// Convert between any two assets (crypto or fiat)
await api.coinWizard.convert({ from: 'bitcoin', to: 'usd', amount: 2.5 });

// Paginated list of all supported coins
await api.coinWizard.list({ page: 1, perPage: 50 });
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

<details>
<summary><strong>🎮 Fun & Pop Culture</strong></summary>

```js
// Pokémon (no key)
await api.pokemon.get({ name: 'pikachu' });

// Rick and Morty (no key)
await api.rickmorty.random();
await api.rickmorty.character({ id: 1 });

// Star Wars (no key)
await api.starwars.person({ id: 1 });
await api.starwars.planet({ id: 1 });

// Harry Potter (no key)
await api.harrypotter.random();
await api.harrypotter.getCharacters({ house: 'gryffindor' });

// Chuck Norris jokes + Bored activity suggestions (no key)
await api.chucknorris.random();
await api.bored.activity();
```
</details>

<details>
<summary><strong>🌍 Science, Health & Places</strong></summary>

```js
// Global + per-country COVID-19 stats (no key)
await api.covid.global();
await api.covid.country({ country: 'egypt' });

// Recent earthquakes worldwide (no key)
await api.earthquake.recent({ limit: 10 });

// Real-time air quality (no key)
await api.airquality.current({ lat: 30.04, lon: 31.24 });

// Sunrise / sunset / day length (no key)
await api.astronomy.sunriseSunset({ lat: 36.7, lon: -119.7 });

// Postal / zip code lookup (no key)
await api.postal.lookup({ country: 'us', postalCode: '90210' });

// Active US weather alerts (no key)
await api.weatheralerts.active({ state: 'CA' });

// Nearby breweries (no key)
await api.brewery.random();
```
</details>

<details>
<summary><strong>🔮 Name Prediction & Sports</strong></summary>

```js
// Predict age, gender, and nationality from a name (no key)
await api.predict.all({ name: 'michael' });

// Search sports teams/players/events (no key)
await api.sportsdb.searchTeam({ name: 'Arsenal' });

// MLB teams & schedule (no key)
await api.baseball.mlbTeams();

// NHL standings & player lookup (no key)
await api.hockey.nhlTeams();
```
</details>

---

## ⚡ Advanced Features

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

## 🖥 MCP Server (Cursor / Claude / Windsurf)

Add bemora to your AI editor — the AI can call all 85+ APIs natively:

**`~/.cursor/mcp.json`**
```json
{
  "mcpServers": {
    "bemora": {
      "command": "npx",
      "args": ["bemora-mcp"],
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
│   │   ├── cache.js          ← Auto caching
│   │   ├── retry.js          ← Exponential backoff
│   │   ├── dedup.js          ← Request deduplication
│   │   ├── events.js         ← Event system
│   │   ├── health.js         ← Provider health checks
│   │   ├── ratelimit.js      ← Rate limit tracker
│   │   ├── batch.js          ← Parallel batch runner
│   │   ├── stale.js          ← Stale-while-revalidate
│   │   └── plugins.js        ← Plugin system
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
│   │   ├── combined.js       ← Market snapshot + News digest (merged)
│   │   ├── coinwizard.js     ← CoinGecko deep crypto toolkit
│   │   ├── pokemon.js        ← PokéAPI
│   │   ├── rickmorty.js      ← Rick and Morty API
│   │   ├── starwars.js       ← SWAPI
│   │   ├── harrypotter.js    ← HP API
│   │   ├── covid.js          ← disease.sh
│   │   ├── earthquake.js     ← USGS
│   │   ├── airquality.js     ← Open-Meteo
│   │   ├── astronomy.js      ← Sunrise-Sunset.org
│   │   ├── postal.js         ← Zippopotam.us
│   │   ├── predict.js        ← Agify/Genderize/Nationalize
│   │   ├── brewery.js        ← Open Brewery DB
│   │   ├── sportsdb.js       ← TheSportsDB
│   │   ├── baseball.js       ← MLB Stats API
│   │   ├── hockey.js         ← NHL API
│   │   └── ... 60+ more providers
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

## 📄 License

MIT © [Demon-radio](https://github.com/Demon-radio)

---

<div align="center">

**Built for vibe coders, AI builders, and developers who just want things to work.**

If bemora saved you time → ⭐ Star it. It helps others find it.

</div>
