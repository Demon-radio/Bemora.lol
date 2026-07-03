/**
 * bemora as the data layer for an AI agent.
 * This example shows how to wire up all 30+ APIs as agent tools.
 */
import Bemora from 'bemora';

const api = new Bemora(); // reads from .env

// ── All agent tools in one object ────────────────────────────────────────────
export const tools = {
  // Weather
  getWeather:       ({ city, units = 'metric' }) => api.weather.current({ city, units }),
  getWeatherEnriched: ({ city }) => api.enriched.weather({ city }),
  compareCities:    ({ cities }) => api.enriched.compareCities({ cities }),

  // Finance
  convertCurrency:  ({ from, to, amount }) => api.currency.convert({ from, to, amount }),
  getExchangeRates: ({ base }) => api.currency.rates({ base }),
  getStockQuote:    ({ symbol }) => api.stocks.quote({ symbol }),
  getStockOverview: ({ symbol }) => api.stocks.overview({ symbol }),
  marketSnapshot:   ({ currency }) => api.combined.marketSnapshot({ currency }),

  // Crypto & Gold
  getCryptoPrice:   ({ coins }) => api.crypto.price({ coins }),
  getTrendingCrypto: () => api.crypto.trending(),
  getTopCrypto:     ({ limit }) => api.crypto.top({ limit }),
  getGoldPrice:     ({ currency }) => api.gold.price({ currency }),
  getSilverPrice:   ({ currency }) => api.gold.silver({ currency }),

  // News
  getHeadlines:     ({ country, category }) => api.news.headlines({ country, category }),
  searchNews:       ({ query, language }) => api.news.search({ q: query, language }),
  getNewsDigest:    ({ topic, language }) => api.combined.newsDigest({ topic, language }),

  // Images
  searchImages:     ({ query, count }) => api.images.search({ query, perPage: count }),
  randomImage:      ({ query }) => api.images.random({ query }),
  searchPexels:     ({ query }) => api.images.pexels({ query }),

  // Location & IP
  geocodeAddress:   ({ address }) => api.location.geocode({ address }),
  reverseGeocode:   ({ lat, lon }) => api.location.reverse({ lat, lon }),
  distanceBetween:  ({ from, to }) => api.location.distance({ from, to }),
  lookupIP:         ({ ip }) => api.ip.lookup({ ip }),

  // Countries
  getCountry:       ({ name }) => api.countries.byName({ name }),
  getCountryByCode: ({ code }) => api.countries.byCode({ code }),
  countriesByRegion: ({ region }) => api.countries.byRegion({ region }),

  // Translation
  translate:        ({ text, from, to }) => api.translate.text({ text, from, to }),
  translateToMany:  ({ text, targets }) => api.translate.many({ text, targets }),
  detectLanguage:   ({ text }) => api.translate.detect({ text }),

  // Movies & Entertainment
  searchMovies:     ({ title, year }) => api.movies.search({ query: title, year }),
  getMovieDetails:  ({ id }) => api.movies.details({ id }),
  trendingMovies:   ({ window }) => api.movies.trending({ window }),
  searchTV:         ({ title }) => api.movies.tv({ query: title }),

  // Food
  searchRecipes:    ({ name }) => api.food.search({ name }),
  randomRecipe:     () => api.food.random(),
  recipesByCategory: ({ category }) => api.food.byCategory({ category }),

  // Football
  getLiveFixtures:  () => api.football.fixtures(),
  getFixturesByDate: ({ date }) => api.football.fixtures({ date }),
  getStandings:     ({ league, season }) => api.football.standings({ league, season }),
  searchTeams:      ({ name }) => api.football.teams({ name }),

  // Space
  astronomyPicture: ({ date } = {}) => api.space.apod({ date }),
  marsPhotos:       ({ sol }) => api.space.mars({ sol }),
  nearEarthObjects: () => api.space.asteroids(),
  issPosition:      () => api.space.issPosition(),

  // Music
  searchArtist:     ({ name }) => api.music.artist({ name }),
  searchSongs:      ({ term }) => api.music.itunes({ term }),

  // Social & Developer
  githubProfile:    ({ username }) => api.social.githubUser({ username }),
  githubRepo:       ({ owner, repo }) => api.social.githubRepo({ owner, repo }),
  trendingRepos:    ({ language }) => api.social.githubTrending({ language }),
  hackerNews:       ({ limit }) => api.social.hackerNews({ limit }),

  // Research & Knowledge
  searchWikipedia:  ({ query, language }) => api.research.wikipedia({ query, language }),
  getArticle:       ({ title, language }) => api.research.article({ title, language }),
  searchBooks:      ({ query }) => api.research.books({ query }),
  instantAnswer:    ({ query }) => api.search.instant({ query }),

  // Utilities
  generateQR:       ({ text, size }) => api.utils.qr({ text, size }),
  shortenURL:       ({ url }) => api.utils.shorten({ url }),
  getCurrentTime:   ({ timezone }) => api.utils.time({ timezone }),
  getHolidays:      ({ country, year }) => api.utils.holidays({ country, year }),
  getQuote:         ({ tag } = {}) => api.utils.quote({ tag }),
  defineWord:       ({ word }) => api.utils.define({ word }),
  getTriviaQuestions: ({ amount, difficulty }) => api.utils.trivia({ amount, difficulty }),
  colorInfo:        ({ hex }) => api.utils.color({ hex }),

  // AI
  chat:             ({ message, system }) => api.ai.chat({ system, messages: [{ role: 'user', content: message }] }),
  generateImage:    ({ prompt }) => api.ai.imagine({ prompt }),
};

// ── Example: simple agent loop ────────────────────────────────────────────────
async function runAgent(userMessage) {
  console.log('\n🧠 Agent received:', userMessage);

  // Ask AI what to do
  const plan = await api.ai.chat({
    system: `You are a helpful assistant with access to these tools: ${Object.keys(tools).join(', ')}.
             When the user asks something, decide which tool to call and with what parameters.
             Respond ONLY with JSON: { "tool": "toolName", "params": {} }`,
    messages: [{ role: 'user', content: userMessage }]
  });

  console.log('🔧 Agent plan:', plan.content);

  try {
    const { tool, params } = JSON.parse(plan.content);
    if (!tools[tool]) return console.log('❌ Unknown tool:', tool);

    console.log(`⚡ Calling ${tool}(`, params, ')');
    const result = await tools[tool](params);
    console.log('✅ Result:', JSON.stringify(result, null, 2).slice(0, 500));
    return result;
  } catch (e) {
    console.error('Agent error:', e.message);
  }
}

// Demo
await runAgent("What's the weather in Cairo right now?");
await runAgent("Convert 1000 USD to EGP");
await runAgent("What are the top 5 cryptocurrencies?");
await runAgent("Show me the latest tech news from Egypt");
await runAgent("Where is the ISS right now?");
