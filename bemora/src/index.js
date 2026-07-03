import 'dotenv/config';
import * as weather from './providers/weather.js';
import * as currency from './providers/currency.js';
import * as news from './providers/news.js';
import * as images from './providers/images.js';
import * as football from './providers/football.js';
import * as crypto from './providers/crypto.js';
import * as gold from './providers/gold.js';
import * as research from './providers/research.js';
import * as enriched from './providers/enriched.js';
import * as combined from './providers/combined.js';
import * as location from './providers/location.js';
import * as ip from './providers/ip.js';
import * as countries from './providers/countries.js';
import * as translate from './providers/translate.js';
import * as movies from './providers/movies.js';
import * as food from './providers/food.js';
import * as space from './providers/space.js';
import * as search from './providers/search.js';
import * as stocks from './providers/stocks.js';
import * as utils from './providers/utils.js';
import * as music from './providers/music.js';
import * as social from './providers/social.js';
import * as ai from './providers/ai.js';
import * as rss from './providers/rss.js';
import * as pub from './providers/public-apis.js';
import * as realtime from './providers/realtime.js';
import * as prayer from './providers/prayer.js';
import * as anime from './providers/anime.js';
import * as fun from './providers/fun.js';
import * as flights from './providers/flights.js';
import * as art from './providers/art.js';
import * as dev from './providers/dev.js';
import * as podcasts from './providers/podcasts.js';
import * as healthProv from './providers/health.js';
import { logger } from './core/logger.js';
import * as cache from './core/cache.js';
import { batch } from './core/batch.js';
import { BemoraEvents } from './core/events.js';
import { PluginSystem } from './core/plugins.js';
import { checkAllHealth, checkHealth } from './core/health.js';
import { getAllStatus, getStatus, recordRequest } from './core/ratelimit.js';
import { withRetry } from './core/retry.js';
import { fallbackChain, aggregate } from './core/fallback.js';
import { BemoraMonitor } from './core/monitor.js';
import * as exportUtils from './core/export.js';
import { BemoraError, ConfigurationError, ProviderError, ValidationError } from './core/errors.js';

export { batch } from './core/batch.js';
export { staleWhileRevalidate } from './core/stale.js';
export { BinanceStream, KrakenStream, getRealtimePrice } from './providers/realtime.js';
export { BemoraMonitor } from './core/monitor.js';
export { fallbackChain, aggregate } from './core/fallback.js';
export { BemoraError, ConfigurationError, ProviderError, ValidationError } from './core/errors.js';

/**
 * Bemora — The only API library your AI agent will ever need.
 *
 * 40+ categories | Smart fallback | RSS | WebSocket | Zero-key free tier | MCP | CLI
 *
 * @example
 * import Bemora from 'bemora';
 * const api = new Bemora();               // reads .env automatically
 * const api = new Bemora({ groqKey: '…' }); // or pass keys directly
 */
export class Bemora {
  constructor(keys = {}, options = {}) {
    this._keys = {
      weather:  keys.weatherKey  || process.env.BEMORA_WEATHER_KEY,
      currency: keys.currencyKey || process.env.BEMORA_CURRENCY_KEY,
      news:     keys.newsKey     || process.env.BEMORA_NEWS_KEY,
      unsplash: keys.unsplashKey || process.env.BEMORA_UNSPLASH_KEY,
      pexels:   keys.pexelsKey   || process.env.BEMORA_PEXELS_KEY,
      football: keys.footballKey || process.env.BEMORA_FOOTBALL_KEY,
      gold:     keys.goldKey     || process.env.BEMORA_GOLD_KEY,
      nasa:     keys.nasaKey     || process.env.BEMORA_NASA_KEY,
      movies:   keys.moviesKey   || process.env.BEMORA_MOVIES_KEY,
      stocks:   keys.stocksKey   || process.env.BEMORA_STOCKS_KEY,
      openai:   keys.openaiKey   || process.env.BEMORA_OPENAI_KEY,
      groq:     keys.groqKey     || process.env.BEMORA_GROQ_KEY,
    };

    this._options = { retries: 2, ...options };
    if (options.logLevel) logger.setLevel(options.logLevel);

    this._events  = new BemoraEvents();
    this._plugins = new PluginSystem();
    this._monitor = new BemoraMonitor();

    // ── Providers with API keys ──────────────────────────────────
    this.weather   = this._buildWeather();
    this.currency  = this._buildCurrency();
    this.news      = this._buildNews();
    this.images    = this._buildImages();
    this.football  = this._buildFootball();
    this.crypto    = this._buildCrypto();
    this.gold      = this._buildGold();
    this.research  = this._buildResearch();
    this.location  = this._buildLocation();
    this.ip        = this._buildIP();
    this.countries = this._buildCountries();
    this.translate = this._buildTranslate();
    this.movies    = this._buildMovies();
    this.food      = this._buildFood();
    this.space     = this._buildSpace();
    this.search    = this._buildSearch();
    this.stocks    = this._buildStocks();
    this.music     = this._buildMusic();
    this.social    = this._buildSocial();
    this.ai        = this._buildAI();
    this.utils     = this._buildUtils();

    // ── Zero-key free tier ───────────────────────────────────────
    this.free      = this._buildFree();

    // ── RSS feed reader ──────────────────────────────────────────
    this.rss       = this._buildRSS();

    // ── Real-time WebSocket streams ──────────────────────────────
    this.realtime  = this._buildRealtime();

    // ── Smart fallback (API → free fallback → cache) ─────────────
    this.smart     = this._buildSmart();

    // ── Monitor & alerts ─────────────────────────────────────────
    this.monitor   = this._monitor;

    // ── Export utilities ─────────────────────────────────────────
    this.export    = exportUtils;

    // ── New world-class providers ────────────────────────────────
    this.prayer    = this._buildPrayer();
    this.anime     = this._buildAnime();
    this.fun       = this._buildFun();
    this.flights   = this._buildFlights();
    this.art       = this._buildArt();
    this.dev       = this._buildDev();
    this.podcasts  = this._buildPodcasts();
    this.health    = this._buildHealth();

    // ── Advanced / merged ────────────────────────────────────────
    this.enriched  = this._buildEnriched();
    this.combined  = this._buildCombined();

    // ── Direct access ────────────────────────────────────────────
    this.cache     = cache;
    this.batch     = (calls) => batch(calls);
  }

  // ─── Plugin & Event system ────────────────────────────────────────────────

  use(plugin)  { this._plugins.use(plugin, this); return this; }
  plugins()    { return this._plugins.list(); }
  on(ev, fn)   { this._events.on(ev, fn); return this; }
  off(ev, fn)  { this._events.off(ev, fn); return this; }

  // ─── Health & rate limits ─────────────────────────────────────────────────

  async health()       { return checkAllHealth(); }
  async healthOf(name) { return checkHealth(name); }
  rateLimits()         { return getAllStatus(); }
  rateLimit(p)         { return getStatus(p); }

  // ─── Internal ─────────────────────────────────────────────────────────────

  _require(key, name) {
    if (!this._keys[key]) {
      throw new Error(
        `[bemora] Missing API key for "${name}".\n` +
        `  Set it in the constructor or as BEMORA_${name.toUpperCase()}_KEY in .env\n` +
        `  Free key: ${FREE_KEY_LINKS[name] || 'https://rapidapi.com'}`
      );
    }
    return this._keys[key];
  }

  _wrap(provider, fn) {
    return (...args) => {
      recordRequest(provider);
      this._events.emit('request', { provider });
      return withRetry(() => fn(...args), { retries: this._options.retries })
        .then((d)  => { this._events.emit('response', { provider }); return d; })
        .catch((e) => { this._events.emit('error', { provider, error: e.message }); throw e; });
    };
  }

  // ─── Provider builders ────────────────────────────────────────────────────

  _buildWeather() {
    return {
      current:  this._wrap('openweathermap', (p) => weather.getCurrentWeather(p, this._require('weather', 'weather'))),
      forecast: this._wrap('openweathermap', (p) => weather.getForecast(p, this._require('weather', 'weather'))),
    };
  }
  _buildCurrency() {
    return {
      rates:   this._wrap('exchangerate', (p) => currency.getRates(p, this._require('currency', 'currency'))),
      convert: this._wrap('exchangerate', (p) => currency.convert(p, this._require('currency', 'currency'))),
    };
  }
  _buildNews() {
    return {
      headlines: this._wrap('newsapi', (p) => news.getHeadlines(p, this._require('news', 'news'))),
      search:    this._wrap('newsapi', (p) => news.searchNews(p, this._require('news', 'news'))),
    };
  }
  _buildImages() {
    return {
      search: this._wrap('unsplash', (p) => images.searchPhotos(p, this._require('unsplash', 'unsplash'))),
      random: this._wrap('unsplash', (p) => images.getRandomPhoto(p, this._require('unsplash', 'unsplash'))),
      pexels: this._wrap('pexels',   (p) => images.searchPexels(p, this._require('pexels', 'pexels'))),
    };
  }
  _buildFootball() {
    return {
      fixtures:  this._wrap('apifootball', (p) => football.getFixtures(p, this._require('football', 'football'))),
      standings: this._wrap('apifootball', (p) => football.getStandings(p, this._require('football', 'football'))),
      teams:     this._wrap('apifootball', (p) => football.searchTeams(p, this._require('football', 'football'))),
    };
  }
  _buildCrypto() {
    return {
      price:    this._wrap('coingecko', (p) => crypto.getPrice(p)),
      trending: this._wrap('coingecko', ()  => crypto.getTrending()),
      top:      this._wrap('coingecko', (p) => crypto.getTopCoins(p)),
    };
  }
  _buildGold() {
    return {
      price:  this._wrap('goldapi', (p) => gold.getGoldPrice(p, this._require('gold', 'gold'))),
      silver: this._wrap('goldapi', (p) => gold.getSilverPrice(p, this._require('gold', 'gold'))),
    };
  }
  _buildResearch() {
    return {
      wikipedia: this._wrap('wikipedia',   (p) => research.searchWikipedia(p)),
      article:   this._wrap('wikipedia',   (p) => research.getWikipediaArticle(p)),
      books:     this._wrap('openlibrary', (p) => research.searchBooks(p)),
    };
  }
  _buildLocation() {
    return {
      geocode:  this._wrap('nominatim', (p) => location.geocode(p)),
      reverse:  this._wrap('nominatim', (p) => location.reverseGeocode(p)),
      distance: location.distance,
    };
  }
  _buildIP() {
    return {
      lookup:      this._wrap('ip-api', (p) => ip.lookup(p)),
      batchLookup: this._wrap('ip-api', (p) => ip.batchLookup(p)),
    };
  }
  _buildCountries() {
    return {
      byName:   this._wrap('restcountries', (p) => countries.byName(p)),
      byCode:   this._wrap('restcountries', (p) => countries.byCode(p)),
      byRegion: this._wrap('restcountries', (p) => countries.byRegion(p)),
      all:      this._wrap('restcountries', ()  => countries.all()),
    };
  }
  _buildTranslate() {
    return {
      text:   this._wrap('mymemory', (p) => translate.translate(p)),
      many:   this._wrap('mymemory', (p) => translate.translateMany(p)),
      detect: this._wrap('mymemory', (p) => translate.detectLanguage(p)),
    };
  }
  _buildMovies() {
    return {
      search:   this._wrap('tmdb', (p) => movies.searchMovies(p, this._require('movies', 'movies'))),
      details:  this._wrap('tmdb', (p) => movies.getMovie(p, this._require('movies', 'movies'))),
      trending: this._wrap('tmdb', (p) => movies.getTrending(p, this._require('movies', 'movies'))),
      tv:       this._wrap('tmdb', (p) => movies.searchTV(p, this._require('movies', 'movies'))),
    };
  }
  _buildFood() {
    return {
      search:     this._wrap('themealdb', (p) => food.searchMeals(p)),
      random:     this._wrap('themealdb', ()  => food.getRandomMeal()),
      details:    this._wrap('themealdb', (p) => food.getMeal(p)),
      byCategory: this._wrap('themealdb', (p) => food.byCategory(p)),
      categories: this._wrap('themealdb', ()  => food.categories()),
    };
  }
  _buildSpace() {
    return {
      apod:        this._wrap('nasa', (p) => space.getAPOD(p, this._require('nasa', 'nasa'))),
      mars:        this._wrap('nasa', (p) => space.getMarsPhotos(p, this._require('nasa', 'nasa'))),
      asteroids:   this._wrap('nasa', (p) => space.getNearEarthObjects(p, this._require('nasa', 'nasa'))),
      issPosition: this._wrap('iss',  ()  => space.getISSPosition()),
    };
  }
  _buildSearch() {
    return {
      instant: this._wrap('duckduckgo', (p) => search.instantAnswer(p)),
      web:     this._wrap('wikipedia',  (p) => search.webSearch(p)),
    };
  }
  _buildStocks() {
    return {
      quote:    this._wrap('alphavantage', (p) => stocks.getQuote(p, this._require('stocks', 'stocks'))),
      search:   this._wrap('alphavantage', (p) => stocks.searchStocks(p, this._require('stocks', 'stocks'))),
      overview: this._wrap('alphavantage', (p) => stocks.getOverview(p, this._require('stocks', 'stocks'))),
    };
  }
  _buildMusic() {
    return {
      artist: this._wrap('musicbrainz', (p) => music.searchArtist(p)),
      album:  this._wrap('musicbrainz', (p) => music.searchAlbum(p)),
      itunes: this._wrap('itunes',      (p) => music.itunesSearch(p)),
    };
  }
  _buildSocial() {
    return {
      githubUser:     this._wrap('github', (p) => social.githubUser(p)),
      githubRepo:     this._wrap('github', (p) => social.githubRepo(p)),
      githubTrending: this._wrap('github', (p) => social.githubTrending(p)),
      hackerNews:     this._wrap('hn',     (p) => social.hackerNewsTop(p)),
      productHunt:    this._wrap('ph',     ()  => social.productHuntToday()),
    };
  }
  _buildAI() {
    return {
      openai:  (p) => ai.openaiChat(p, this._require('openai', 'openai')),
      groq:    (p) => ai.groqChat(p, this._require('groq', 'groq')),
      chat:    (p) => ai.smartChat(p, { groqKey: this._keys.groq, openaiKey: this._keys.openai }),
      imagine: (p) => ai.generateImage(p, this._require('openai', 'openai')),
      embed:   (p) => ai.embed(p, this._require('openai', 'openai')),
    };
  }
  _buildUtils() {
    return {
      qr:            utils.generateQR,
      uuid:          utils.uuid,
      passwordStrength: utils.passwordStrength,
      hash:          utils.hash,
      base64Encode:  utils.base64Encode,
      base64Decode:  utils.base64Decode,
      loremIpsum:    utils.loremIpsum,
      emojiSearch:   utils.emojiSearch,
      randomEmoji:   utils.randomEmoji,
      hexToRgb:      utils.hexToRgb,
      rgbToHex:      utils.rgbToHex,
      httpStatus:    utils.httpStatus,
      shorten:       this._wrap('isgd',       (p) => utils.shortenURL(p)),
      time:          this._wrap('worldtime',  (p) => utils.getTime(p)),
      timezones:     this._wrap('worldtime',  ()  => utils.listTimezones()),
      holidays:      this._wrap('nager',      (p) => utils.getHolidays(p)),
      quote:         this._wrap('quotable',   (p) => utils.getQuote(p)),
      quotes:        this._wrap('quotable',   (p) => utils.getQuotes(p)),
      define:        this._wrap('dictionary', (p) => utils.define(p)),
      trivia:        this._wrap('opentdb',    (p) => utils.getTrivia(p)),
      color:         this._wrap('colorapi',   (p) => utils.getColor(p)),
    };
  }

  // ── Zero-key free tier ──────────────────────────────────────────────────────

  _buildFree() {
    return {
      /**
       * Free weather via Open-Meteo — no key, no limit
       * @param {{ lat: number, lon: number }} params
       */
      weather:        this._wrap('open-meteo',      (p) => pub.openMeteoWeather(p)),
      /**
       * Free weather by city name via wttr.in — no key
       * @param {{ city: string, format?: 'short'|'full' }} params
       */
      wttr:           this._wrap('wttr',             (p) => pub.wttrWeather(p)),
      /**
       * Free currency rates via exchangerate.host — no key
       * @param {{ base?: string, symbols?: string[] }} params
       */
      exchangeRates:  this._wrap('exchangerate.host',(p) => pub.freeExchangeRates(p)),
      /**
       * Binance public ticker — no key
       * @param {{ symbol: string }} params — e.g. 'BTCUSDT'
       */
      binanceTicker:  this._wrap('binance',          (p) => pub.binanceTicker(p)),
      /**
       * Multiple Binance tickers at once — no key
       * @param {{ symbols: string[] }} params
       */
      binanceTickers: this._wrap('binance',          (p) => pub.binanceTickers(p)),
      /**
       * Free football fixtures via OpenLigaDB — no key (German leagues)
       * @param {{ league?: string }} params — 'bl1', 'bl2', 'bl3'
       */
      football:       this._wrap('openligadb',       (p) => pub.openLigaFixtures(p)),
    };
  }

  // ── RSS Feeds ───────────────────────────────────────────────────────────────

  _buildRSS() {
    return {
      /**
       * Fetch from a named RSS source — no key
       * @param {{ source: string, limit?: number }} params
       * Sources: bbc-world, bbc-tech, aljazeera, reuters-world, cnn-world, google-news, hn-top, nasa-news, mit-tech ...
       */
      fetch:     this._wrap('rss', (p) => rss.fetchFeed(p)),
      /**
       * Fetch from any custom RSS URL
       * @param {{ url: string, limit?: number }} params
       */
      custom:    this._wrap('rss', (p) => rss.fetchCustomFeed(p)),
      /**
       * Aggregate from multiple RSS sources at once, deduplicated and sorted
       * @param {{ sources: string[], limit?: number, sortBy?: 'published'|'source' }} params
       */
      aggregate: this._wrap('rss', (p) => rss.aggregateFeeds(p)),
      /** List all available built-in RSS source names */
      sources:   () => rss.AVAILABLE_SOURCES,
    };
  }

  // ── Real-time WebSocket ─────────────────────────────────────────────────────

  _buildRealtime() {
    return {
      /**
       * Open a live Binance price stream — no key
       * @param {string[]} symbols — e.g. ['btcusdt','ethusdt']
       * @returns {BinanceStream} — EventEmitter with 'price', 'connected', 'error'
       */
      binance: (symbols) => new realtime.BinanceStream(symbols),
      /**
       * Open a live Kraken price stream — no key
       * @param {string[]} pairs — e.g. ['BTC/USD', 'ETH/USD']
       * @returns {KrakenStream}
       */
      kraken: (pairs) => new realtime.KrakenStream(pairs),
      /**
       * Get one price update via WebSocket and close
       * @param {{ exchange?: 'binance'|'kraken', symbol: string }} params
       */
      getPrice: (p) => realtime.getRealtimePrice(p),
    };
  }

  // ── Smart Fallback Chains ───────────────────────────────────────────────────

  _buildSmart() {
    const k = this._keys;

    return {
      /**
       * Smart weather: tries OWM (if key) → wttr.in (free) → Open-Meteo (free)
       * Always returns data — never throws for missing key.
       * @param {{ city: string }} params
       */
      weather: async ({ city, units = 'metric' }) => {
        const chain = [];
        if (k.weather) {
          chain.push({ name: 'openweathermap', fn: () => weather.getCurrentWeather({ city, units }, k.weather) });
        }
        chain.push(
          { name: 'wttr.in', fn: () => pub.wttrWeather({ city, format: 'full' }) },
          { name: 'open-meteo', fn: async () => {
            const geo = await location.geocode({ address: city });
            const { lat, lon } = geo.results[0] || {};
            return pub.openMeteoWeather({ lat, lon, units: units === 'imperial' ? 'fahrenheit' : 'celsius' });
          }},
        );
        return fallbackChain(`smart:weather:${city}`, chain, 600);
      },

      /**
       * Smart news: tries NewsAPI (if key) → BBC RSS → Al Jazeera RSS → Google News RSS
       * @param {{ topic?: string, limit?: number }} params
       */
      news: async ({ topic, limit = 10 } = {}) => {
        const chain = [];
        if (k.news) {
          chain.push({ name: 'newsapi', fn: () => news.searchNews({ q: topic || 'world', pageSize: limit }, k.news) });
        }
        chain.push(
          { name: 'bbc-world-rss',  fn: () => rss.fetchFeed({ source: 'bbc-world', limit }) },
          { name: 'aljazeera-rss',  fn: () => rss.fetchFeed({ source: 'aljazeera', limit }) },
          { name: 'google-news-rss', fn: () => rss.fetchFeed({ source: 'google-news', limit }) },
        );
        return fallbackChain(`smart:news:${topic || 'world'}`, chain, 600);
      },

      /**
       * Smart crypto: tries CoinGecko → Binance ticker
       * @param {{ coin: string }} params
       */
      crypto: async ({ coin = 'bitcoin' } = {}) => {
        const symbolMap = { bitcoin: 'BTCUSDT', ethereum: 'ETHUSDT', solana: 'SOLUSDT', dogecoin: 'DOGEUSDT' };
        return fallbackChain(`smart:crypto:${coin}`, [
          { name: 'coingecko', fn: () => crypto.getPrice({ coins: coin }) },
          { name: 'binance',   fn: () => pub.binanceTicker({ symbol: symbolMap[coin] || `${coin.toUpperCase()}USDT` }) },
        ], 30);
      },

      /**
       * Smart currency: tries key provider → exchangerate.host (free)
       * @param {{ base?: string, symbols?: string[] }} params
       */
      currency: async ({ base = 'USD', symbols = [] } = {}) => {
        const chain = [];
        if (k.currency) {
          chain.push({ name: 'exchangerate-api', fn: () => currency.getRates({ base, symbols }, k.currency) });
        }
        chain.push({ name: 'exchangerate.host', fn: () => pub.freeExchangeRates({ base, symbols }) });
        return fallbackChain(`smart:currency:${base}`, chain, 3600);
      },

      /**
       * Aggregate weather from 3 free sources and return the average temperature
       * Great for accuracy — uses majority voting.
       * @param {{ city: string }} params
       */
      weatherAggregate: async ({ city }) => {
        const geo = await location.geocode({ address: city }).catch(() => null);
        const sources = [
          { name: 'wttr.in', fn: () => pub.wttrWeather({ city, format: 'full' }).then((d) => ({ temperature: parseFloat(d.temperature_c) })) },
        ];
        if (geo?.results?.[0]) {
          const { lat, lon } = geo.results[0];
          sources.push(
            { name: 'open-meteo', fn: () => pub.openMeteoWeather({ lat, lon }).then((d) => ({ temperature: d.temperature })) },
          );
        }
        if (k.weather) {
          sources.push({ name: 'openweathermap', fn: () => weather.getCurrentWeather({ city }, k.weather).then((d) => ({ temperature: d.temperature })) });
        }
        return aggregate(sources, { strategy: 'average', field: 'temperature' });
      },
    };
  }

  // ── Combined / enriched ─────────────────────────────────────────────────────

  _buildPrayer() {
    return {
      /** Prayer times by city (Free, no key) */
      today:   this._wrap('aladhan', (p) => prayer.timingsByCity(p)),
      /** Prayer times by coordinates */
      byCoords: this._wrap('aladhan', (p) => prayer.timingsByCoords(p)),
      /** Monthly prayer calendar */
      monthly:  this._wrap('aladhan', (p) => prayer.monthlyTimings(p)),
      /** Available calculation methods */
      methods:  () => prayer.CALCULATION_METHODS,
    };
  }
  _buildAnime() {
    return {
      /** Search anime (Jikan/MAL — Free, no key) */
      search:        this._wrap('jikan', (p) => anime.searchAnime(p)),
      /** Get anime details by MAL ID */
      details:       this._wrap('jikan', (p) => anime.getAnime(p)),
      /** Top anime all time */
      top:           this._wrap('jikan', (p) => anime.topAnime(p)),
      /** Current season anime */
      nowAiring:     this._wrap('jikan', ()  => anime.currentSeason()),
      /** Random anime */
      random:        this._wrap('jikan', ()  => anime.randomAnime()),
      /** Search manga */
      manga:         this._wrap('jikan', (p) => anime.searchManga(p)),
    };
  }
  _buildFun() {
    return {
      /** Get a random joke (Free, no key) */
      joke:        this._wrap('jokeapi',      (p) => fun.getJoke(p)),
      /** Multiple jokes */
      jokes:       this._wrap('jokeapi',      (p) => fun.getJokes(p)),
      /** Random cat fact */
      catFact:     this._wrap('catfact',      ()  => fun.catFact()),
      /** Multiple cat facts */
      catFacts:    this._wrap('catfact',      (p) => fun.catFacts(p)),
      /** Random cat image */
      catImage:    this._wrap('thecatapi',    ()  => fun.catImage()),
      /** Random dog image */
      dogImage:    this._wrap('dogceo',       ()  => fun.dogImage()),
      /** Dog breeds list */
      dogBreeds:   this._wrap('dogceo',       ()  => fun.dogBreeds()),
      /** Fact about a number (Free, no key) */
      numberFact:  this._wrap('numbersapi',   (p) => fun.numberFact(p)),
      /** Random useless fact */
      uselessFact: this._wrap('uselessfacts', ()  => fun.uselessFact()),
      /** Generate fake user(s) for testing */
      fakeUser:    this._wrap('randomuser',   (p) => fun.randomUser(p)),
      /** Random positive affirmation */
      affirmation: this._wrap('affirmations', ()  => fun.affirmation()),
      /** Random life advice */
      advice:      this._wrap('adviceslip',   ()  => fun.advice()),
    };
  }
  _buildFlights() {
    return {
      /** Live flights (AviationStack — free 100/month) */
      live:     this._wrap('aviationstack', (p) => flights.getLiveFlights(p, this._require('flights', 'flights'))),
      /** Airport info by IATA code */
      airport:  this._wrap('aviationstack', (p) => flights.getAirport(p, this._require('flights', 'flights'))),
      /** Airline info */
      airline:  this._wrap('aviationstack', (p) => flights.getAirline(p, this._require('flights', 'flights'))),
    };
  }
  _buildArt() {
    return {
      /** Search Art Institute of Chicago (Free, no key — 100k artworks) */
      search:      this._wrap('artic',   (p) => art.searchArtworks(p)),
      /** Get AIC artwork details */
      details:     this._wrap('artic',   (p) => art.getArtwork(p)),
      /** Search Metropolitan Museum of Art (Free, no key — 400k artworks) */
      searchMet:   this._wrap('metmuseum', (p) => art.searchMet(p)),
      /** Get Met artwork by ID */
      metDetails:  this._wrap('metmuseum', (p) => art.getMetArtwork(p)),
    };
  }
  _buildDev() {
    return {
      /** npm package info + dependencies */
      npmPackage:    this._wrap('npmjs',    (p) => dev.npmPackage(p)),
      /** npm package weekly downloads */
      npmDownloads:  this._wrap('npmjs',    (p) => dev.npmDownloads(p)),
      /** GitHub user repositories */
      githubRepos:   this._wrap('github',   (p) => dev.githubRepos(p)),
      /** GitHub latest releases */
      githubReleases: this._wrap('github',  (p) => dev.githubReleases(p)),
      /** Validate email format + MX record */
      validateEmail: this._wrap('dns',      (p) => dev.validateEmail(p)),
      /** DNS lookup (A, MX, TXT, CNAME) */
      dnsLookup:     this._wrap('dns',      (p) => dev.dnsLookup(p)),
      /** Generate Lorem Ipsum text */
      loremIpsum:    this._wrap('loripsum', (p) => dev.loremIpsum(p)),
      /** HTTP status code meaning (no API) */
      httpStatus:    dev.httpStatus,
    };
  }
  _buildPodcasts() {
    return {
      /** Search podcasts via iTunes (Free, no key) */
      search:   this._wrap('itunes',        (p) => podcasts.searchPodcasts(p)),
      /** Get podcast episodes from RSS feed */
      episodes: this._wrap('podcast-rss',   (p) => podcasts.getPodcastEpisodes(p)),
      /** Search via PodcastIndex */
      index:    this._wrap('podcastindex',  (p) => podcasts.searchPodcastIndex(p)),
    };
  }
  _buildHealth() {
    return {
      /** Search FDA drug database (Free, no key) */
      drug:       this._wrap('fda',          (p) => healthProv.searchDrug(p)),
      /** Disease information from Wikipedia/NLM */
      disease:    this._wrap('wikipedia',    (p) => healthProv.getDiseaseInfo(p)),
      /** Exercise database (Free, no key) */
      exercises:  this._wrap('wger',         (p) => healthProv.getExercises(p)),
      /** Nutrition info from Open Food Facts (Free, no key) */
      nutrition:  this._wrap('openfoodfacts',(p) => healthProv.getNutrition(p)),
      /** BMI calculator (no API needed) */
      bmi:        healthProv.calculateBMI,
    };
  }

  _buildEnriched() {
    return {
      weather:      this._wrap('openweathermap', (p) => enriched.getEnrichedWeather(p, this._require('weather', 'weather'))),
      compareCities: this._wrap('openweathermap', (p) => enriched.compareCities(p, this._require('weather', 'weather'))),
    };
  }
  _buildCombined() {
    return {
      marketSnapshot: this._wrap('coingecko', (p) => combined.getMarketSnapshot(p, this._keys.gold, this._keys.currency)),
      newsDigest:     this._wrap('newsapi',   (p) => combined.getNewsDigest(p, this._require('news', 'news'))),
    };
  }
}

const FREE_KEY_LINKS = {
  weather:  'https://openweathermap.org/api',
  currency: 'https://www.exchangerate-api.com',
  news:     'https://newsapi.org/register',
  unsplash: 'https://unsplash.com/developers',
  pexels:   'https://www.pexels.com/api',
  football: 'https://dashboard.api-football.com/register',
  gold:     'https://www.goldapi.io',
  nasa:     'https://api.nasa.gov',
  movies:   'https://www.themoviedb.org/settings/api',
  stocks:   'https://www.alphavantage.co/support/#api-key',
  openai:   'https://platform.openai.com',
  groq:     'https://console.groq.com',
};

export default Bemora;
