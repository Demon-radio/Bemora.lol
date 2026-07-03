

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
import * as medical from './providers/health.js';
import * as fandom from './providers/fandom.js';
import * as spotify from './providers/spotify.js';
import * as stackexchange from './providers/stackexchange.js';
import * as steam from './providers/steam.js';
import * as animals from './providers/animals.js';
import * as books from './providers/books.js';
import * as lyrics from './providers/lyrics.js';
import * as memes from './providers/memes.js';
import * as math from './providers/math.js';
import * as zodiac from './providers/zodiac.js';
import * as jobs from './providers/jobs.js';
import * as science from './providers/science.js';
import * as basketball from './providers/basketball.js';
import * as vehicles from './providers/vehicles.js';
import * as pets from './providers/pets.js';
import * as drinks from './providers/drinks.js';
import * as geography from './providers/geography.js';
import * as comics from './providers/comics.js';
import * as tv from './providers/tv.js';
import * as baseball from './providers/baseball.js';
import * as hockey from './providers/hockey.js';
import * as finance from './providers/finance.js';
import * as literature from './providers/literature.js';
import * as wildlife from './providers/wildlife.js';
import * as politics from './providers/politics.js';
import * as language from './providers/language.js';
import * as law from './providers/law.js';
import * as military from './providers/military.js';
import * as religion from './providers/religion.js';
import * as islamic from './providers/islamic.js';
import * as gaming from './providers/gaming.js';
import * as spaceExtended from './providers/space-extended.js';
import * as pokemon from './providers/pokemon.js';
import * as rickmorty from './providers/rickmorty.js';
import * as starwars from './providers/starwars.js';
import * as harrypotter from './providers/harrypotter.js';
import * as covid from './providers/covid.js';
import * as earthquake from './providers/earthquake.js';
import * as airquality from './providers/airquality.js';
import * as astronomy from './providers/astronomy.js';
import * as postal from './providers/postal.js';
import * as predict from './providers/predict.js';
import * as brewery from './providers/brewery.js';
import * as chucknorris from './providers/chucknorris.js';
import * as bored from './providers/bored.js';
import * as sportsdb from './providers/sportsdb.js';
import * as domain from './providers/domain.js';
import * as placeholder from './providers/placeholder.js';
import * as weatheralerts from './providers/weatheralerts.js';
import * as coinwizard from './providers/coinwizard.js';
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

export class Bemora {
  constructor(keys = {}, options = {}) {
    this._keys = {
      weather:     keys.weatherKey      || process.env.BEMORA_WEATHER_KEY,
      currency:    keys.currencyKey     || process.env.BEMORA_CURRENCY_KEY,
      news:        keys.newsKey         || process.env.BEMORA_NEWS_KEY,
      unsplash:    keys.unsplashKey     || process.env.BEMORA_UNSPLASH_KEY,
      pexels:      keys.pexelsKey       || process.env.BEMORA_PEXELS_KEY,
      football:    keys.footballKey     || process.env.BEMORA_FOOTBALL_KEY,
      gold:        keys.goldKey         || process.env.BEMORA_GOLD_KEY,
      nasa:        keys.nasaKey         || process.env.BEMORA_NASA_KEY,
      movies:      keys.moviesKey       || process.env.BEMORA_MOVIES_KEY,
      stocks:      keys.stocksKey       || process.env.BEMORA_STOCKS_KEY,
      openai:      keys.openaiKey       || process.env.BEMORA_OPENAI_KEY,
      groq:        keys.groqKey         || process.env.BEMORA_GROQ_KEY,
      anthropic:   keys.anthropicKey    || process.env.BEMORA_ANTHROPIC_KEY,
      gemini:      keys.geminiKey       || process.env.BEMORA_GEMINI_KEY,
      spoonacular: keys.spoonacularKey  || process.env.BEMORA_SPOONACULAR_KEY,
      edamamAppId: keys.edamamAppId     || process.env.BEMORA_EDAMAM_APP_ID,
      edamamAppKey:keys.edamamAppKey    || process.env.BEMORA_EDAMAM_APP_KEY,
      spotifyClientId: keys.spotifyClientId || process.env.BEMORA_SPOTIFY_CLIENT_ID,
      spotifyClientSecret: keys.spotifyClientSecret || process.env.BEMORA_SPOTIFY_CLIENT_SECRET,
      steam:       keys.steamKey        || process.env.BEMORA_STEAM_KEY,
    };

    this._options = { retries: 2, ...options };
    if (options.logLevel) logger.setLevel(options.logLevel);

    this._events  = new BemoraEvents();
    this._plugins = new PluginSystem();
    this._monitor = new BemoraMonitor();

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
    this.fandom    = this._buildFandom();
    this.spotify   = this._buildSpotify();
    this.stackexchange = this._buildStackExchange();
    this.steam     = this._buildSteam();
    this.animals   = this._buildAnimals();
    this.books     = this._buildBooks();
    this.lyrics    = this._buildLyrics();
    this.memes     = this._buildMemes();
    this.math      = this._buildMath();
    this.zodiac    = this._buildZodiac();
    this.jobs      = this._buildJobs();
    this.science   = this._buildScience();
    this.basketball = this._buildBasketball();
    this.vehicles  = this._buildVehicles();
    this.pets      = this._buildPets();
    this.drinks    = this._buildDrinks();
    this.geography = this._buildGeography();
    this.comics    = this._buildComics();
    this.tv        = this._buildTV();
    this.baseball  = this._buildBaseball();
    this.hockey    = this._buildHockey();
    this.finance   = this._buildFinance();
    this.literature = this._buildLiterature();
    this.wildlife  = this._buildWildlife();
    this.politics  = this._buildPolitics();
    this.language  = this._buildLanguage();
    this.law       = this._buildLaw();
    this.military  = this._buildMilitary();
    this.religion  = this._buildReligion();
    this.islamic   = this._buildIslamic();
    this.gaming    = this._buildGaming();
    this.spaceExtended = this._buildSpaceExtended();
    this.pokemon   = this._buildPokemon();
    this.rickmorty = this._buildRickMorty();
    this.starwars  = this._buildStarWars();
    this.harrypotter = this._buildHarryPotter();
    this.covid     = this._buildCovid();
    this.earthquake = this._buildEarthquake();
    this.airquality = this._buildAirQuality();
    this.astronomy = this._buildAstronomy();
    this.postal    = this._buildPostal();
    this.predict   = this._buildPredict();
    this.brewery   = this._buildBrewery();
    this.chucknorris = this._buildChuckNorris();
    this.bored     = this._buildBored();
    this.sportsdb  = this._buildSportsDB();
    this.domain    = this._buildDomain();
    this.placeholder = this._buildPlaceholder();
    this.weatheralerts = this._buildWeatherAlerts();
    this.coinWizard = this._buildCoinWizard();

    this.free      = this._buildFree();
    this.rss       = this._buildRSS();
    this.realtime  = this._buildRealtime();
    this.smart     = this._buildSmart();
    this.monitor   = this._monitor;
    this.export    = exportUtils;
    this.prayer    = this._buildPrayer();
    this.anime     = this._buildAnime();
    this.fun       = this._buildFun();
    this.flights   = this._buildFlights();
    this.art       = this._buildArt();
    this.dev       = this._buildDev();
    this.podcasts  = this._buildPodcasts();
    this.medical   = this._buildMedical();
    this.enriched  = this._buildEnriched();
    this.combined  = this._buildCombined();
    this.cache     = cache;
    this.batch     = (calls) => batch(calls);
  }

  use(plugin)  { this._plugins.use(plugin, this); return this; }
  plugins()    { return this._plugins.list(); }
  on(ev, fn)   { this._events.on(ev, fn); return this; }
  off(ev, fn)  { this._events.off(ev, fn); return this; }
  async health()       { return checkAllHealth(); }
  async healthOf(name) { return checkHealth(name); }
  rateLimits()         { return getAllStatus(); }
  rateLimit(p)         { return getStatus(p); }

  _require(key, name) {
    if (!this._keys[key]) {
      throw new ConfigurationError(
        `[bemora] Missing API key for "${name}". Set in constructor or BEMORA_${name.toUpperCase().replace(/[^A-Z]/g, '_')}_KEY in .env.`,
        { provider: name }
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
        .catch((e) => { this._events.emit('error', { provider, error: e.message }); throw new ProviderError(e.message, { provider, cause: e }); });
    };
  }

  _buildWeather() { return { current: this._wrap('openweathermap', (p) => weather.getCurrentWeather(p, this._require('weather', 'weather'))), forecast: this._wrap('openweathermap', (p) => weather.getForecast(p, this._require('weather', 'weather'))) }; }
  _buildCurrency() { return { rates: this._wrap('exchangerate', (p) => currency.getRates(p, this._require('currency', 'currency'))), convert: this._wrap('exchangerate', (p) => currency.convert(p, this._require('currency', 'currency'))) }; }
  _buildNews() { return { headlines: this._wrap('newsapi', (p) => news.getHeadlines(p, this._require('news', 'news'))), search: this._wrap('newsapi', (p) => news.searchNews(p, this._require('news', 'news'))) }; }
  _buildImages() { return { search: this._wrap('unsplash', (p) => images.searchPhotos(p, this._require('unsplash', 'unsplash'))), random: this._wrap('unsplash', (p) => images.getRandomPhoto(p, this._require('unsplash', 'unsplash'))), pexels: this._wrap('pexels', (p) => images.searchPexels(p, this._require('pexels', 'pexels'))) }; }
  _buildFootball() { return { fixtures: this._wrap('apifootball', (p) => football.getFixtures(p, this._require('football', 'football'))), standings: this._wrap('apifootball', (p) => football.getStandings(p, this._require('football', 'football'))), teams: this._wrap('apifootball', (p) => football.searchTeams(p, this._require('football', 'football'))) }; }
  _buildCrypto() { return { price: this._wrap('coingecko', (p) => crypto.getPrice(p)), trending: this._wrap('coingecko', () => crypto.getTrending()), top: this._wrap('coingecko', (p) => crypto.getTopCoins(p)) }; }
  _buildGold() { return { price: this._wrap('goldapi', (p) => gold.getGoldPrice(p, this._require('gold', 'gold'))), silver: this._wrap('goldapi', (p) => gold.getSilverPrice(p, this._require('gold', 'gold'))) }; }
  _buildResearch() { return { wikipedia: this._wrap('wikipedia', (p) => research.searchWikipedia(p)), article: this._wrap('wikipedia', (p) => research.getWikipediaArticle(p)), books: this._wrap('openlibrary', (p) => research.searchBooks(p)) }; }
  _buildLocation() { return { geocode: this._wrap('nominatim', (p) => location.geocode(p)), reverse: this._wrap('nominatim', (p) => location.reverseGeocode(p)), distance: location.distance }; }
  _buildIP() { return { lookup: this._wrap('ip-api', (p) => ip.lookup(p)), batchLookup: this._wrap('ip-api', (p) => ip.batchLookup(p)) }; }
  _buildCountries() { return { byName: this._wrap('restcountries', (p) => countries.byName(p)), byCode: this._wrap('restcountries', (p) => countries.byCode(p)), byRegion: this._wrap('restcountries', (p) => countries.byRegion(p)), all: this._wrap('restcountries', () => countries.all()) }; }
  _buildTranslate() { return { text: this._wrap('mymemory', (p) => translate.translate(p)), many: this._wrap('mymemory', (p) => translate.translateMany(p)), detect: this._wrap('mymemory', (p) => translate.detectLanguage(p)) }; }
  _buildMovies() { return { search: this._wrap('tmdb', (p) => movies.searchMovies(p, this._require('movies', 'movies'))), details: this._wrap('tmdb', (p) => movies.getMovie(p, this._require('movies', 'movies'))), trending: this._wrap('tmdb', (p) => movies.getTrending(p, this._require('movies', 'movies'))), tv: this._wrap('tmdb', (p) => movies.searchTV(p, this._require('movies', 'movies'))) }; }

  _buildFood() { 
    return {
      searchMeals: food.searchMeals, getRandomMeal: food.getRandomMeal, random: food.getRandomMeal, getMeal: food.getMeal, byCategory: food.byCategory, categories: food.categories,
      searchSpoonacular: this._wrap('spoonacular', (p) => food.searchSpoonacular({ ...p, apiKey: this._require('spoonacular', 'spoonacular') })),
      getSpoonacularRecipe: this._wrap('spoonacular', (p) => food.getSpoonacularRecipe({ ...p, apiKey: this._require('spoonacular', 'spoonacular') })),
      searchEdamam: this._wrap('edamam', (p) => food.searchEdamam({ ...p, appId: this._require('edamamAppId', 'edamam app ID'), appKey: this._require('edamamAppKey', 'edamam app key') })),
      analyzeEdamam: this._wrap('edamam', (p) => food.analyzeEdamam({ ...p, appId: this._require('edamamAppId', 'edamam app ID'), appKey: this._require('edamamAppKey', 'edamam app key') })),
    }; 
  }

  _buildSpace() { return { apod: this._wrap('nasa', (p) => space.getAPOD(p, this._require('nasa', 'nasa'))), mars: this._wrap('nasa', (p) => space.getMarsPhotos(p, this._require('nasa', 'nasa'))), asteroids: this._wrap('nasa', (p) => space.getNearEarthObjects(p, this._require('nasa', 'nasa'))), issPosition: this._wrap('iss', () => space.getISSPosition()) }; }
  _buildSearch() { return { instant: this._wrap('duckduckgo', (p) => search.instantAnswer(p)), web: this._wrap('wikipedia', (p) => search.webSearch(p)) }; }
  _buildStocks() { return { quote: this._wrap('alphavantage', (p) => stocks.getQuote(p, this._require('stocks', 'stocks'))), search: this._wrap('alphavantage', (p) => stocks.searchStocks(p, this._require('stocks', 'stocks'))), overview: this._wrap('alphavantage', (p) => stocks.getOverview(p, this._require('stocks', 'stocks'))) }; }
  _buildMusic() { return { artist: this._wrap('musicbrainz', (p) => music.searchArtist(p)), album: this._wrap('musicbrainz', (p) => music.searchAlbum(p)), itunes: this._wrap('itunes', (p) => music.itunesSearch(p)) }; }
  _buildSocial() { return { githubUser: this._wrap('github', (p) => social.githubUser(p)), githubRepo: this._wrap('github', (p) => social.githubRepo(p)), githubTrending: this._wrap('github', (p) => social.githubTrending(p)), hackerNews: this._wrap('hn', (p) => social.hackerNewsTop(p)), productHunt: this._wrap('ph', () => social.productHuntToday()) }; }

  _buildAI() {
    const openaiChat = this._wrap('openai', (p) => ai.openaiChat(p, this._require('openai', 'openai')));
    const groqChat = this._wrap('groq', (p) => ai.groqChat(p, this._require('groq', 'groq')));
    const smartChat = (p) => ai.smartChat(p, {
      groqKey: this._keys.groq,
      openaiKey: this._keys.openai,
      anthropicKey: this._keys.anthropic,
      geminiKey: this._keys.gemini,
    });

    return {
      openaiChat,
      openai: openaiChat,
      groqChat,
      groq: groqChat,
      anthropicChat: this._wrap('anthropic', (p) => ai.anthropicChat(p, this._require('anthropic', 'anthropic'))),
      geminiChat: this._wrap('google', (p) => ai.geminiChat(p, this._require('gemini', 'gemini'))),
      smartChat,
      chat: smartChat,
      generateImage: this._wrap('openai', (p) => ai.generateImage(p, this._require('openai', 'openai'))),
      imagine: this._wrap('openai', (p) => ai.generateImage(p, this._require('openai', 'openai'))),
      embed: this._wrap('openai', (p) => ai.embed(p, this._require('openai', 'openai'))),
    };
  }

  _buildUtils() { 
    return { 
      qr: utils.generateQR, 
      uuid: utils.uuid, 
      passwordStrength: utils.passwordStrength, 
      hash: utils.hash, 
      base64Encode: utils.base64Encode, 
      base64Decode: utils.base64Decode, 
      loremIpsum: utils.loremIpsum, 
      emojiSearch: utils.emojiSearch, 
      randomEmoji: utils.randomEmoji, 
      hexToRgb: utils.hexToRgb, 
      rgbToHex: utils.rgbToHex, 
      httpStatus: utils.httpStatus, 
      shorten: this._wrap('isgd', (p) => utils.shortenURL(p)), 
      time: this._wrap('worldtime', (p) => utils.getTime(p)), 
      timezones: this._wrap('worldtime', () => utils.listTimezones()), 
      holidays: this._wrap('nager', (p) => utils.getHolidays(p)), 
      quote: this._wrap('quotable', (p) => utils.getQuote(p)), 
      quotes: this._wrap('quotable', (p) => utils.getQuotes(p)), 
      define: this._wrap('dictionary', (p) => utils.define(p)), 
      trivia: this._wrap('opentdb', (p) => utils.getTrivia(p)), 
      color: this._wrap('colorapi', (p) => utils.getColor(p)),
      randomNumber: utils.randomNumber,
      formatDate: utils.formatDate,
      validateJSON: utils.validateJSON,
      parseURL: utils.parseURL,
      slugify: utils.slugify,
    }; 
  }

  _buildFandom() { return { search: this._wrap('fandom', (p) => fandom.search(p)), getPage: this._wrap('fandom', (p) => fandom.getPage(p)), recentActivity: this._wrap('fandom', (p) => fandom.recentActivity(p)) }; }

  _buildSpotify() { 
    return { 
      searchTracks: this._wrap('spotify', (p) => spotify.searchTracks({ ...p, clientId: this._require('spotifyClientId', 'spotify client id'), clientSecret: this._require('spotifyClientSecret', 'spotify client secret') })),
      getArtist: this._wrap('spotify', (p) => spotify.getArtist({ ...p, clientId: this._require('spotifyClientId', 'spotify client id'), clientSecret: this._require('spotifyClientSecret', 'spotify client secret') })),
      getArtistTopTracks: this._wrap('spotify', (p) => spotify.getArtistTopTracks({ ...p, clientId: this._require('spotifyClientId', 'spotify client id'), clientSecret: this._require('spotifyClientSecret', 'spotify client secret') })),
    }; 
  }

  _buildStackExchange() { return { searchQuestions: this._wrap('stackexchange', (p) => stackexchange.searchQuestions(p)), getQuestion: this._wrap('stackexchange', (p) => stackexchange.getQuestion(p)), getTopUsers: this._wrap('stackexchange', (p) => stackexchange.getTopUsers(p)) }; }

  _buildSteam() { return { getPlayerSummaries: this._wrap('steam', (p) => steam.getPlayerSummaries({ ...p, apiKey: this._require('steam', 'steam') })), getOwnedGames: this._wrap('steam', (p) => steam.getOwnedGames({ ...p, apiKey: this._require('steam', 'steam') })), searchApps: this._wrap('steam', (p) => steam.searchApps(p)) }; }

  _buildAnimals() { return { randomDog: this._wrap('dogceo', () => animals.getRandomDog()), randomCat: this._wrap('thecatapi', () => animals.getRandomCat()), randomFox: this._wrap('randomfox', () => animals.getRandomFox()), randomDuck: this._wrap('randomduck', () => animals.getRandomDuck()), randomPanda: this._wrap('some-random-api', () => animals.getRandomPanda()), randomBird: this._wrap('some-random-api', () => animals.getRandomBird()) }; }
  _buildBooks() { return { search: this._wrap('googlebooks', (p) => books.searchBooks(p)), getById: this._wrap('googlebooks', (p) => books.getBookById(p)), random: this._wrap('openlibrary', () => books.getRandomBook()) }; }
  _buildLyrics() { return { search: this._wrap('lyricsovh', (p) => lyrics.searchLyrics(p)) }; }
  _buildMemes() { return { random: this._wrap('memeapi', () => memes.getRandomMeme()), fromSubreddit: this._wrap('memeapi', (p) => memes.getMemesFromSubreddit(p)) }; }
  _buildMath() { return { evaluate: this._wrap('mathjs', (p) => math.evaluateMath(p)), randomFact: this._wrap('numbersapi', (p) => math.getRandomMathFact(p)) }; }
  _buildZodiac() { return { horoscope: this._wrap('aztro', (p) => zodiac.getHoroscope(p)) }; }
  _buildJobs() { return { search: this._wrap('adzuna', (p) => jobs.searchJobs(p)) }; }
  _buildScience() { return { nasaApod: this._wrap('nasa', (p) => science.getNasaApod(p)), randomFact: this._wrap('uselessfacts', () => science.getRandomScienceFact()) }; }
  _buildBasketball() { return { nbaTeams: this._wrap('balldontlie', () => basketball.getNBATeams()), nbaGames: this._wrap('balldontlie', (p) => basketball.getNBAGames(p)), nbaPlayer: this._wrap('balldontlie', (p) => basketball.getNBAPlayer(p)) }; }
  _buildVehicles() { return { randomCar: this._wrap('nhtsa', () => vehicles.getRandomCar()) }; }
  _buildPets() { return { random: this._wrap('randomdog', () => pets.getRandomPet()) }; }
  _buildDrinks() { return { randomCocktail: this._wrap('thecocktaildb', () => drinks.getRandomCocktail()), searchCocktail: this._wrap('thecocktaildb', (p) => drinks.searchCocktail(p)), searchIngredient: this._wrap('thecocktaildb', (p) => drinks.searchIngredient(p)) }; }
  _buildGeography() { return { countryInfo: this._wrap('restcountries', (p) => geography.getCountryInfo(p)), allCountries: this._wrap('restcountries', () => geography.getAllCountries()), capitalCity: this._wrap('restcountries', (p) => geography.getCapitalCity(p)) }; }
  _buildComics() { return { randomXKCD: this._wrap('xkcd', () => comics.getRandomXKCD()), getXKCD: this._wrap('xkcd', (p) => comics.getXKCD(p)) }; }
  _buildTV() { return { search: this._wrap('tmdb', (p) => tv.searchTVShows(p, this._require('movies', 'movies'))), details: this._wrap('tmdb', (p) => tv.getTVShowDetails(p, this._require('movies', 'movies'))), trending: this._wrap('tmdb', (p) => tv.getTrendingTV(p, this._require('movies', 'movies'))) }; }
  _buildBaseball() { return { mlbTeams: this._wrap('mlb', () => baseball.getMLBTeams()), mlbSchedule: this._wrap('mlb', (p) => baseball.getMLBSchedule(p)) }; }
  _buildHockey() { return { nhlTeams: this._wrap('nhl', () => hockey.getNHLTeams()), nhlPlayer: this._wrap('nhl', (p) => hockey.getNHLPlayer(p)) }; }
  _buildFinance() { return { stockQuote: this._wrap('yahoo', (p) => finance.getStockQuote(p)), cryptoPrice: this._wrap('coingecko', (p) => finance.getCryptoPrice(p)) }; }
  _buildLiterature() { return { randomQuote: this._wrap('quotable', () => literature.getRandomQuote()), searchQuotes: this._wrap('quotable', (p) => literature.searchQuotes(p)) }; }
  _buildWildlife() { return { randomFact: this._wrap('some-random-api', () => wildlife.getRandomAnimalFact()) }; }
  _buildPolitics() { return { presidents: this._wrap('usa', () => politics.getPresidents()) }; }
  _buildLanguage() { return { detect: this._wrap('libretranslate', (p) => language.detectLanguage(p)), translate: this._wrap('libretranslate', (p) => language.translateText(p)) }; }
  _buildLaw() { return { search: this._wrap('law', (p) => law.searchLaws(p)) }; }
  _buildMilitary() { return { time: this._wrap('military', (p) => military.getMilitaryTime(p)) }; }
  _buildReligion() { return { randomVerse: this._wrap('bibleapi', () => religion.getRandomVerse()), getVerse: this._wrap('bibleapi', (p) => religion.getVerse(p)) }; }
  _buildIslamic() { return { quranChapters: this._wrap('alquran', () => islamic.getQuranChapters()), quranChapter: this._wrap('alquran', (p) => islamic.getQuranChapter(p)), randomVerse: this._wrap('alquran', () => islamic.getRandomVerse()), azkar: this._wrap('hisnmuslim', (p) => islamic.getAzkar(p)), prayerTimes: this._wrap('aladhan', (p) => islamic.getPrayerTimes(p)) }; }
  _buildGaming() { return { freeFirePlayer: this._wrap('freefire', (p) => gaming.getFreeFirePlayer(p)), pubgPlayer: this._wrap('pubg', (p) => gaming.getPubgPlayer(p)), crossfireNews: this._wrap('crossfire', () => gaming.getCrossfireNews()), freeFireNews: this._wrap('freefire', () => gaming.getFreeFireNews()), pubgPatchNotes: this._wrap('pubg', () => gaming.getPubgPatchNotes()) }; }
  _buildSpaceExtended() { return { apod: this._wrap('nasa', (p) => spaceExtended.getAPOD(p)), marsPhotos: this._wrap('nasa', (p) => spaceExtended.getMarsPhotos(p)), nearEarthObjects: this._wrap('nasa', (p) => spaceExtended.getNearEarthObjects(p)), issPosition: this._wrap('open-notify', () => spaceExtended.getISSPosition()) }; }

  _buildFree() { return { weather: this._wrap('open-meteo', (p) => pub.openMeteoWeather(p)), wttr: this._wrap('wttr', (p) => pub.wttrWeather(p)), exchangeRates: this._wrap('exchangerate.host', (p) => pub.freeExchangeRates(p)), binanceTicker: this._wrap('binance', (p) => pub.binanceTicker(p)), binanceTickers: this._wrap('binance', (p) => pub.binanceTickers(p)), football: this._wrap('openligadb', (p) => pub.openLigaFixtures(p)) }; }
  _buildRSS() { return { fetch: this._wrap('rss', (p) => rss.fetchFeed(p)), custom: this._wrap('rss', (p) => rss.fetchCustomFeed(p)), aggregate: this._wrap('rss', (p) => rss.aggregateFeeds(p)), sources: () => rss.AVAILABLE_SOURCES }; }
  _buildRealtime() { return { binance: (symbols) => new realtime.BinanceStream(symbols), kraken: (pairs) => new realtime.KrakenStream(pairs), getPrice: (p) => realtime.getRealtimePrice(p) }; }
  _buildSmart() {
    const k = this._keys;
    return {
      weather: async ({ city, units = 'metric' }) => {
        const chain = [];
        if (k.weather) chain.push({ name: 'openweathermap', fn: () => weather.getCurrentWeather({ city, units }, k.weather) });
        chain.push({ name: 'wttr.in', fn: () => pub.wttrWeather({ city, format: 'full' }) }, { name: 'open-meteo', fn: async () => { const geo = await location.geocode({ address: city }); const { lat, lon } = geo.results?.[0] || {}; return pub.openMeteoWeather({ lat, lon, units: units === 'imperial' ? 'fahrenheit' : 'celsius' }); } });
        return fallbackChain(`smart:weather:${city}`, chain, 600);
      },
      news: async ({ topic, limit = 10 } = {}) => {
        const chain = [];
        if (k.news) chain.push({ name: 'newsapi', fn: () => news.searchNews({ q: topic || 'world', pageSize: limit }, k.news) });
        chain.push({ name: 'bbc-world-rss', fn: () => rss.fetchFeed({ source: 'bbc-world', limit }) }, { name: 'aljazeera-rss', fn: () => rss.fetchFeed({ source: 'aljazeera', limit }) }, { name: 'google-news-rss', fn: () => rss.fetchFeed({ source: 'google-news', limit }) });
        return fallbackChain(`smart:news:${topic || 'world'}`, chain, 600);
      },
      crypto: async ({ coin = 'bitcoin' } = {}) => {
        const symbolMap = { bitcoin: 'BTCUSDT', ethereum: 'ETHUSDT', solana: 'SOLUSDT', dogecoin: 'DOGEUSDT' };
        return fallbackChain(`smart:crypto:${coin}`, [ { name: 'coingecko', fn: () => crypto.getPrice({ coins: coin }) }, { name: 'binance', fn: () => pub.binanceTicker({ symbol: symbolMap[coin] || `${coin.toUpperCase()}USDT` }) } ], 30);
      },
      currency: async ({ base = 'USD', symbols = [] } = {}) => {
        const chain = [];
        if (k.currency) chain.push({ name: 'exchangerate-api', fn: () => currency.getRates({ base, symbols }, k.currency) });
        chain.push({ name: 'exchangerate.host', fn: () => pub.freeExchangeRates({ base, symbols }) });
        return fallbackChain(`smart:currency:${base}`, chain, 3600);
      },
      weatherAggregate: async ({ city }) => {
        const geo = await location.geocode({ address: city }).catch(() => null);
        const sources = [ { name: 'wttr.in', fn: () => pub.wttrWeather({ city, format: 'full' }).then((d) => ({ temperature: parseFloat(d.temperature_c) })) } ];
        if (geo?.results?.[0]) { const { lat, lon } = geo.results[0]; sources.push({ name: 'open-meteo', fn: () => pub.openMeteoWeather({ lat, lon }).then((d) => ({ temperature: d.temperature })) }); }
        if (k.weather) sources.push({ name: 'openweathermap', fn: () => weather.getCurrentWeather({ city }, k.weather).then((d) => ({ temperature: d.temperature })) });
        return aggregate(sources, { strategy: 'average', field: 'temperature' });
      },
    };
  }

  _buildPrayer() { return { today: this._wrap('aladhan', (p) => prayer.timingsByCity(p)), byCoords: this._wrap('aladhan', (p) => prayer.timingsByCoords(p)), monthly: this._wrap('aladhan', (p) => prayer.monthlyTimings(p)), methods: () => prayer.CALCULATION_METHODS }; }
  _buildAnime() { return { search: this._wrap('jikan', (p) => anime.searchAnime(p)), details: this._wrap('jikan', (p) => anime.getAnime(p)), top: this._wrap('jikan', (p) => anime.topAnime(p)), nowAiring: this._wrap('jikan', () => anime.currentSeason()), random: this._wrap('jikan', () => anime.randomAnime()), manga: this._wrap('jikan', (p) => anime.searchManga(p)) }; }
  _buildFun() { return { joke: this._wrap('jokeapi', (p) => fun.getJoke(p)), jokes: this._wrap('jokeapi', (p) => fun.getJokes(p)), catFact: this._wrap('catfact', () => fun.catFact()), catFacts: this._wrap('catfact', (p) => fun.catFacts(p)), catImage: this._wrap('thecatapi', () => fun.catImage()), dogImage: this._wrap('dogceo', () => fun.dogImage()), dogBreeds: this._wrap('dogceo', () => fun.dogBreeds()), numberFact: this._wrap('numbersapi', (p) => fun.numberFact(p)), uselessFact: this._wrap('uselessfacts', () => fun.uselessFact()), fakeUser: this._wrap('randomuser', (p) => fun.randomUser(p)), affirmation: this._wrap('affirmations', () => fun.affirmation()), advice: this._wrap('adviceslip', () => fun.advice()) }; }
  _buildFlights() { return { live: this._wrap('aviationstack', (p) => flights.getLiveFlights(p, this._require('flights', 'flights'))), airport: this._wrap('aviationstack', (p) => flights.getAirport(p, this._require('flights', 'flights'))), airline: this._wrap('aviationstack', (p) => flights.getAirline(p, this._require('flights', 'flights'))) }; }
  _buildArt() { return { search: this._wrap('artic', (p) => art.searchArtworks(p)), details: this._wrap('artic', (p) => art.getArtwork(p)), searchMet: this._wrap('metmuseum', (p) => art.searchMet(p)), metDetails: this._wrap('metmuseum', (p) => art.getMetArtwork(p)) }; }
  _buildDev() { return { npmPackage: this._wrap('npmjs', (p) => dev.npmPackage(p)), npmDownloads: this._wrap('npmjs', (p) => dev.npmDownloads(p)), githubRepos: this._wrap('github', (p) => dev.githubRepos(p)), githubReleases: this._wrap('github', (p) => dev.githubReleases(p)), validateEmail: this._wrap('dns', (p) => dev.validateEmail(p)), dnsLookup: this._wrap('dns', (p) => dev.dnsLookup(p)), loremIpsum: this._wrap('loripsum', (p) => dev.loremIpsum(p)), httpStatus: dev.httpStatus }; }
  _buildPodcasts() { return { search: this._wrap('itunes', (p) => podcasts.searchPodcasts(p)), episodes: this._wrap('podcast-rss', (p) => podcasts.getPodcastEpisodes(p)), index: this._wrap('podcastindex', (p) => podcasts.searchPodcastIndex(p)) }; }
  _buildMedical() { return { drug: this._wrap('fda', (p) => medical.searchDrug(p)), disease: this._wrap('wikipedia', (p) => medical.getDiseaseInfo(p)), exercises: this._wrap('wger', (p) => medical.getExercises(p)), nutrition: this._wrap('openfoodfacts', (p) => medical.getNutrition(p)), bmi: medical.calculateBMI }; }
  _buildEnriched() { return { weather: this._wrap('openweathermap', (p) => enriched.getEnrichedWeather(p, this._require('weather', 'weather'))), compareCities: this._wrap('openweathermap', (p) => enriched.compareCities(p, this._require('weather', 'weather'))) }; }
  _buildCombined() { return { marketSnapshot: this._wrap('coingecko', (p) => combined.getMarketSnapshot(p, this._keys.gold, this._keys.currency)), newsDigest: this._wrap('newsapi', (p) => combined.getNewsDigest(p, this._require('news', 'news'))) }; }

  _buildPokemon() { return { get: this._wrap('pokeapi', (p) => pokemon.getPokemon(p)), ability: this._wrap('pokeapi', (p) => pokemon.getAbility(p)), species: this._wrap('pokeapi', (p) => pokemon.getSpecies(p)), random: this._wrap('pokeapi', () => pokemon.random()) }; }
  _buildRickMorty() { return { character: this._wrap('rickandmortyapi', (p) => rickmorty.getCharacter(p)), search: this._wrap('rickandmortyapi', (p) => rickmorty.searchCharacters(p)), location: this._wrap('rickandmortyapi', (p) => rickmorty.getLocation(p)), episode: this._wrap('rickandmortyapi', (p) => rickmorty.getEpisode(p)), random: this._wrap('rickandmortyapi', () => rickmorty.random()) }; }
  _buildStarWars() { return { person: this._wrap('swapi', (p) => starwars.getPerson(p)), people: this._wrap('swapi', () => starwars.listPeople()), planet: this._wrap('swapi', (p) => starwars.getPlanet(p)), starship: this._wrap('swapi', (p) => starwars.getStarship(p)), film: this._wrap('swapi', (p) => starwars.getFilm(p)) }; }
  _buildHarryPotter() { return { characters: this._wrap('hp-api', (p) => harrypotter.getCharacters(p)), students: this._wrap('hp-api', () => harrypotter.getStudents()), staff: this._wrap('hp-api', () => harrypotter.getStaff()), random: this._wrap('hp-api', () => harrypotter.randomCharacter()) }; }
  _buildCovid() { return { global: this._wrap('disease.sh', () => covid.getGlobal()), country: this._wrap('disease.sh', (p) => covid.getCountry(p)), historical: this._wrap('disease.sh', (p) => covid.getHistorical(p)), topCountries: this._wrap('disease.sh', (p) => covid.getTopCountries(p)) }; }
  _buildEarthquake() { return { recent: this._wrap('usgs', (p) => earthquake.getRecent(p)), byLocation: this._wrap('usgs', (p) => earthquake.getByLocation(p)), biggestToday: this._wrap('usgs', () => earthquake.getBiggestToday()) }; }
  _buildAirQuality() { return { current: this._wrap('open-meteo-aq', (p) => airquality.getCurrent(p)), forecast: this._wrap('open-meteo-aq', (p) => airquality.getForecast(p)), classify: airquality.classifyAQI }; }
  _buildAstronomy() { return { sunriseSunset: this._wrap('sunrise-sunset.org', (p) => astronomy.getSunriseSunset(p)), moonPhase: this._wrap('farmsense', (p) => astronomy.getMoonPhase(p)) }; }
  _buildPostal() { return { lookup: this._wrap('zippopotam', (p) => postal.lookup(p)) }; }
  _buildPredict() { return { nationality: this._wrap('nationalize', (p) => predict.predictNationality(p)), gender: this._wrap('genderize', (p) => predict.predictGender(p)), age: this._wrap('agify', (p) => predict.predictAge(p)), all: this._wrap('predict-combo', (p) => predict.predictAll(p)) }; }
  _buildBrewery() { return { search: this._wrap('openbrewerydb', (p) => brewery.search(p)), random: this._wrap('openbrewerydb', () => brewery.random()), getById: this._wrap('openbrewerydb', (p) => brewery.getById(p)) }; }
  _buildChuckNorris() { return { random: this._wrap('chucknorris.io', (p) => chucknorris.random(p)), categories: this._wrap('chucknorris.io', () => chucknorris.categories()), search: this._wrap('chucknorris.io', (p) => chucknorris.search(p)) }; }
  _buildBored() { return { activity: this._wrap('bored-api', (p) => bored.getActivity(p)) }; }
  _buildSportsDB() { return { searchTeam: this._wrap('thesportsdb', (p) => sportsdb.searchTeam(p)), searchPlayer: this._wrap('thesportsdb', (p) => sportsdb.searchPlayer(p)), leagueEvents: this._wrap('thesportsdb', (p) => sportsdb.getLeagueEvents(p)), leagues: this._wrap('thesportsdb', (p) => sportsdb.listLeagues(p)) }; }
  _buildDomain() { return { whois: this._wrap('rdap', (p) => domain.whois(p)), dnsRecords: this._wrap('dns', (p) => domain.dnsRecords(p)), resolveIp: this._wrap('dns', (p) => domain.resolveIp(p)) }; }
  _buildPlaceholder() { return { image: placeholder.placeholderImage, picsum: placeholder.picsumImage, avatar: placeholder.avatarUrl, dicebear: placeholder.dicebearAvatar }; }
  _buildWeatherAlerts() { return { usAlerts: this._wrap('weather.gov', (p) => weatheralerts.getUSAlerts(p)), pointForecast: this._wrap('weather.gov', (p) => weatheralerts.getPointForecast(p)) }; }
  _buildCoinWizard() {
    return {
      info: this._wrap('coingecko', (p) => coinwizard.coinInfo(p)),
      chart: this._wrap('coingecko', (p) => coinwizard.marketChart(p)),
      ohlc: this._wrap('coingecko', (p) => coinwizard.ohlc(p)),
      global: this._wrap('coingecko', () => coinwizard.globalMarket()),
      exchanges: this._wrap('coingecko', (p) => coinwizard.exchanges(p)),
      categories: this._wrap('coingecko', (p) => coinwizard.categories(p)),
      gainersLosers: this._wrap('coingecko', (p) => coinwizard.gainersLosers(p)),
      search: this._wrap('coingecko', (p) => coinwizard.searchCoins(p)),
      convert: this._wrap('coingecko', (p) => coinwizard.convertCoin(p)),
      list: this._wrap('coingecko', () => coinwizard.supportedCoinsList()),
    };
  }
}

export default Bemora;
