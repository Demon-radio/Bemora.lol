/**
 * Integration tests — hit real, free, no-key APIs.
 * Skip with: BEMORA_SKIP_INTEGRATION=true vitest run tests/integration/
 *
 * These are excluded from the default `npm test` run (unit tests only).
 * Run them with: npm run test:integration
 */
import { describe, it, expect, beforeAll } from 'vitest';

const SKIP = process.env.BEMORA_SKIP_INTEGRATION === 'true';
const maybeDescribe = SKIP ? describe.skip : describe;

let ip, countries, crypto, space, translate, food, social, location, utils, comics;
let university, nutrition, disasters, blockchain, webtools, worldbank, smart;

beforeAll(async () => {
  if (SKIP) return;
  ip        = await import('../../src/providers/ip.js');
  countries = await import('../../src/providers/countries.js');
  crypto    = await import('../../src/providers/crypto.js');
  space     = await import('../../src/providers/space.js');
  translate = await import('../../src/providers/translate.js');
  food      = await import('../../src/providers/food.js');
  social    = await import('../../src/providers/social.js');
  location  = await import('../../src/providers/location.js');
  utils     = await import('../../src/providers/utils.js');
  comics    = await import('../../src/providers/comics.js');
  university = await import('../../src/providers/university.js');
  nutrition   = await import('../../src/providers/nutrition.js');
  disasters   = await import('../../src/providers/disasters.js');
  blockchain  = await import('../../src/providers/blockchain.js');
  webtools    = await import('../../src/providers/webtools.js');
  worldbank   = await import('../../src/providers/worldbank.js');
  smart       = await import('../../src/providers/smart.js');
});

// ---------------------------------------------------------------------------
// ip-api.com — no key
// Returns: { ip, country, country_code, city, lat, lon, isp, ... }
// ---------------------------------------------------------------------------
maybeDescribe('IP lookup (ip-api.com — no key)', { timeout: 15000 }, () => {
  it('returns a valid IP lookup result for 8.8.8.8', async () => {
    const result = await ip.lookup({ ip: '8.8.8.8' });
    expect(result).toHaveProperty('ip');
    expect(result).toHaveProperty('country');
    expect(typeof result.country).toBe('string');
    expect(result.country.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// restcountries.com — no key
// ---------------------------------------------------------------------------
maybeDescribe('Countries (restcountries.com — no key)', { timeout: 15000 }, () => {
  it('finds Egypt by name', async () => {
    const result = await countries.byName({ name: 'Egypt' });
    const list = Array.isArray(result) ? result : result.countries || [];
    expect(list.length).toBeGreaterThan(0);
    expect(JSON.stringify(list[0]).toLowerCase()).toContain('egypt');
  });

  it('returns a list of all countries', async () => {
    const result = await countries.all();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(150);
  });
});

// ---------------------------------------------------------------------------
// CoinGecko — no key
// getPrice returns: { currency, prices: [{ coin, price, market_cap, change_24h }] }
// getTrending returns: { trending: [...] }
// ---------------------------------------------------------------------------
maybeDescribe('Crypto (CoinGecko — no key)', { timeout: 15000 }, () => {
  it('returns bitcoin price', async () => {
    const result = await crypto.getPrice({ coins: 'bitcoin' });
    expect(result).toHaveProperty('currency');
    expect(result).toHaveProperty('prices');
    expect(Array.isArray(result.prices)).toBe(true);
    expect(result.prices.length).toBeGreaterThan(0);
    expect(result.prices[0]).toHaveProperty('coin');
    expect(result.prices[0]).toHaveProperty('price');
    expect(typeof result.prices[0].price).toBe('number');
  });

  it('returns trending coins', async () => {
    const result = await crypto.getTrending();
    expect(result).toHaveProperty('trending');
    expect(Array.isArray(result.trending)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// open-notify.org — no key
// getISSPosition returns: { lat, lon, timestamp }
// ---------------------------------------------------------------------------
maybeDescribe('ISS position (open-notify.org — no key)', { timeout: 15000 }, () => {
  it('returns the current ISS position', async () => {
    const result = await space.getISSPosition();
    expect(result).toHaveProperty('lat');
    expect(result).toHaveProperty('lon');
    expect(typeof result.lat).toBe('number');
    expect(typeof result.lon).toBe('number');
  });
});

// ---------------------------------------------------------------------------
// MyMemory — no key
// translate returns: { original, translated, from, to, quality }
// ---------------------------------------------------------------------------
maybeDescribe('Translation (MyMemory — no key)', { timeout: 15000 }, () => {
  it('translates "Hello" from English to Arabic', async () => {
    const result = await translate.translate({ text: 'Hello', from: 'en', to: 'ar' });
    expect(result).toHaveProperty('translated');
    expect(typeof result.translated).toBe('string');
    expect(result.translated.length).toBeGreaterThan(0);
    expect(result.from).toBe('en');
    expect(result.to).toBe('ar');
  });
});

// ---------------------------------------------------------------------------
// TheMealDB — no key
// getRandomMeal returns: { meal: { id, name, category, ... } }
// searchMeals returns:   { meals: [{ ... }] }
// ---------------------------------------------------------------------------
maybeDescribe('Food (TheMealDB — no key)', { timeout: 15000 }, () => {
  it('returns a random meal with name and category', async () => {
    const result = await food.getRandomMeal();
    expect(result).toHaveProperty('meal');
    expect(result.meal).toHaveProperty('name');
    expect(result.meal).toHaveProperty('category');
  });

  it('searches meals by name and returns an array', async () => {
    // searchMeals expects { name }, returns { meals: [...] }
    const result = await food.searchMeals({ name: 'chicken' });
    expect(result).toHaveProperty('meals');
    expect(Array.isArray(result.meals)).toBe(true);
    expect(result.meals.length).toBeGreaterThan(0);
    expect(result.meals[0]).toHaveProperty('name');
  });
});

// ---------------------------------------------------------------------------
// Hacker News Firebase API — no key
// hackerNewsTop returns: { stories: [{ id, title, url, score, by, ... }] }
// ---------------------------------------------------------------------------
maybeDescribe('Hacker News (firebaseio.com — no key)', { timeout: 15000 }, () => {
  it('returns top Hacker News stories', async () => {
    const result = await social.hackerNewsTop({ limit: 5 });
    expect(result).toHaveProperty('stories');
    expect(Array.isArray(result.stories)).toBe(true);
    expect(result.stories.length).toBeGreaterThan(0);
    expect(result.stories[0]).toHaveProperty('title');
  });
});

// ---------------------------------------------------------------------------
// Nominatim (OpenStreetMap) — no key
// geocode returns: { results: [{ lat, lon, display_name, ... }] }
// ---------------------------------------------------------------------------
maybeDescribe('Geocoding (Nominatim — no key)', { timeout: 15000 }, () => {
  it('geocodes "Cairo, Egypt"', async () => {
    const result = await location.geocode({ address: 'Cairo, Egypt' });
    expect(result).toHaveProperty('results');
    expect(Array.isArray(result.results)).toBe(true);
    expect(result.results.length).toBeGreaterThan(0);
    expect(result.results[0]).toHaveProperty('lat');
    expect(result.results[0]).toHaveProperty('lon');
  });
});

// ---------------------------------------------------------------------------
// Nager.Date — no key
// getHolidays returns: { country, year, holidays: [{ date, name, ... }] }
// ---------------------------------------------------------------------------
maybeDescribe('Holidays (Nager.Date — no key)', { timeout: 15000 }, () => {
  it('returns public holidays for the US in 2025', async () => {
    const result = await utils.getHolidays({ country: 'US', year: 2025 });
    expect(result).toHaveProperty('holidays');
    expect(Array.isArray(result.holidays)).toBe(true);
    expect(result.holidays.length).toBeGreaterThan(0);
    expect(result.holidays[0]).toHaveProperty('name');
    expect(result.holidays[0]).toHaveProperty('date');
  });
});

// ---------------------------------------------------------------------------
// XKCD — no key
// getRandomXKCD returns: { comic: { title, img, num, ... } }
// ---------------------------------------------------------------------------
maybeDescribe('XKCD (xkcd.com — no key)', { timeout: 15000 }, () => {
  it('returns an XKCD comic with title, img, and num', async () => {
    const result = await comics.getRandomXKCD();
    expect(result).toHaveProperty('comic');
    expect(result.comic).toHaveProperty('title');
    expect(result.comic).toHaveProperty('img');
    expect(result.comic).toHaveProperty('num');
    expect(typeof result.comic.num).toBe('number');
  });
});

// ---------------------------------------------------------------------------
// Hipolabs Universities API — no key
// ---------------------------------------------------------------------------
maybeDescribe('Universities (Hipolabs — no key)', { timeout: 15000 }, () => {
  it('finds universities in a country', async () => {
    const result = await university.byCountry({ country: 'United States' });
    expect(result).toHaveProperty('universities');
    expect(Array.isArray(result.universities)).toBe(true);
    expect(result.universities.length).toBeGreaterThan(0);
    expect(result.universities[0]).toHaveProperty('name');
  });
});

// ---------------------------------------------------------------------------
// Open Food Facts — no key
// ---------------------------------------------------------------------------
maybeDescribe('Nutrition (Open Food Facts — no key)', { timeout: 15000 }, () => {
  it('looks up a known barcode', async () => {
    const result = await nutrition.byBarcode({ barcode: '3017620422003' });
    expect(result).toHaveProperty('found', true);
    expect(typeof result.name).toBe('string');
  });
});

// ---------------------------------------------------------------------------
// NASA EONET — no key
// ---------------------------------------------------------------------------
maybeDescribe('Natural disasters (NASA EONET — no key)', { timeout: 15000 }, () => {
  it('returns a list of active events', async () => {
    const result = await disasters.activeEvents({ limit: 5 });
    expect(result).toHaveProperty('events');
    expect(Array.isArray(result.events)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// blockchain.info / owlracle — no key
// ---------------------------------------------------------------------------
maybeDescribe('Blockchain (blockchain.info / owlracle — no key)', { timeout: 15000 }, () => {
  it('returns bitcoin network stats', async () => {
    const result = await blockchain.bitcoinStats();
    expect(result).toHaveProperty('market_price_usd');
    expect(typeof result.market_price_usd).toBe('number');
  });

  it('returns ethereum gas price tiers', async () => {
    const result = await blockchain.ethGasPrice();
    expect(result).toHaveProperty('provider', 'owlracle');
  });
});

// ---------------------------------------------------------------------------
// microlink.io — no key
// ---------------------------------------------------------------------------
maybeDescribe('Webtools (microlink.io — no key)', { timeout: 15000 }, () => {
  it('fetches page metadata for a public URL', async () => {
    const result = await webtools.metadata({ url: 'https://example.com' });
    expect(typeof result.title).toBe('string');
  });
});

// ---------------------------------------------------------------------------
// World Bank Open Data — no key
// ---------------------------------------------------------------------------
maybeDescribe('World Bank (data.worldbank.org — no key)', { timeout: 15000 }, () => {
  it('returns a population time series for a country', async () => {
    const result = await worldbank.population({ country: 'US', limit: 3 });
    expect(result).toHaveProperty('values');
    expect(Array.isArray(result.values)).toBe(true);
    expect(result.values.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Smart layer — bemora's cross-provider auto-failover (signature feature)
// ---------------------------------------------------------------------------
maybeDescribe('Smart auto-failover layer (bemora-only feature)', { timeout: 15000 }, () => {
  it('returns weather via automatic provider fallback', async () => {
    const result = await smart.weatherAnyProvider({ city: 'Cairo' });
    expect(result).toHaveProperty('_provider');
  });

  it('returns currency rates via automatic provider fallback', async () => {
    const result = await smart.currencyAnyProvider({ base: 'USD', symbols: ['EUR'] });
    expect(result).toHaveProperty('_provider');
  });

  it('returns crypto price via automatic provider fallback', async () => {
    const result = await smart.cryptoPriceAnyProvider({ id: 'bitcoin', symbol: 'BTC' });
    expect(result).toHaveProperty('_provider');
  });
});
