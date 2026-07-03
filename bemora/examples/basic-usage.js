import Bemora from 'bemora';

// Initialize with your free API keys
const api = new Bemora({
  weatherKey: 'your_openweathermap_key',
  currencyKey: 'your_exchangerate_api_key',
  newsKey: 'your_newsapi_key',
  unsplashKey: 'your_unsplash_key',
  pexelsKey: 'your_pexels_key',
  footballKey: 'your_apifootball_key',
  goldKey: 'your_goldapi_key',
});

// ────────────────────────────────────
// WEATHER
// ────────────────────────────────────
const weather = await api.weather.current({ city: 'Cairo' });
console.log(`Cairo: ${weather.temperature}°C, ${weather.description}`);

const forecast = await api.weather.forecast({ city: 'London' });
console.log(`London forecast: ${forecast.forecast.length} entries`);

// ────────────────────────────────────
// CURRENCY
// ────────────────────────────────────
const conversion = await api.currency.convert({ from: 'USD', to: 'EGP', amount: 100 });
console.log(`100 USD = ${conversion.result} EGP`);

const rates = await api.currency.rates({ base: 'USD', symbols: ['EGP', 'EUR', 'GBP'] });
console.log('Rates:', rates.rates);

// ────────────────────────────────────
// NEWS
// ────────────────────────────────────
const headlines = await api.news.headlines({ country: 'us', category: 'technology' });
console.log(`Top news: ${headlines.articles[0].title}`);

const searchResult = await api.news.search({ q: 'artificial intelligence', pageSize: 5 });
console.log(`Found ${searchResult.total} AI articles`);

// ────────────────────────────────────
// IMAGES
// ────────────────────────────────────
const photos = await api.images.search({ query: 'sunset beach', perPage: 5 });
console.log(`Photos: ${photos.photos[0].urls.regular}`);

const random = await api.images.random({ query: 'nature' });
console.log(`Random photo: ${random.urls.regular}`);

// ────────────────────────────────────
// FOOTBALL
// ────────────────────────────────────
const fixtures = await api.football.fixtures({ date: '2026-07-02' });
console.log(`Live/today fixtures: ${fixtures.fixtures.length}`);

// ────────────────────────────────────
// CRYPTO
// ────────────────────────────────────
const btc = await api.crypto.price({ coins: 'bitcoin', currency: 'usd' });
console.log(`Bitcoin: $${btc.prices[0].price}`);

const top = await api.crypto.top({ limit: 5 });
console.log('Top 5 coins:', top.coins.map(c => c.name));

const trending = await api.crypto.trending();
console.log('Trending:', trending.trending.map(c => c.name));

// ────────────────────────────────────
// GOLD
// ────────────────────────────────────
const goldPrice = await api.gold.price({ currency: 'USD' });
console.log(`Gold: $${goldPrice.price_per_troy_oz} per troy oz`);
console.log(`Gold 21K per gram: $${goldPrice.price_gram_21k}`);

// ────────────────────────────────────
// RESEARCH
// ────────────────────────────────────
const wikiSearch = await api.research.wikipedia({ query: 'Artificial Intelligence', language: 'en' });
console.log(`Wikipedia: ${wikiSearch.results[0].title}`);

const article = await api.research.article({ title: 'Cairo' });
console.log(`Cairo: ${article.extract.slice(0, 100)}...`);

const books = await api.research.books({ query: 'machine learning', limit: 5 });
console.log(`Books found: ${books.total}`);
