/**
 * MCP input schemas — one JSON Schema per cataloged provider method.
 *
 * Every entry here MUST satisfy two rules (enforced by tests/unit/mcp-catalog.test.js):
 *   1. The provider exists on the Bemora class.
 *   2. The method resolves to a real function on that namespace.
 * Do not add schemas for removed providers or for methods missing from
 * src/mcp-server/provider-info.js — they would be dead data.
 *
 * Param shapes mirror the provider functions in src/providers/ (the Bemora
 * class injects API keys itself, so key params are never listed here).
 * `required` lists params the provider treats as mandatory (no default).
 */
const obj = (properties, required = []) => ({ type: 'object', properties, required });
const str = (description) => (description ? { type: 'string', description } : { type: 'string' });
const num = (description) => (description ? { type: 'number', description } : { type: 'number' });
const arr = (items, description) => ({
  type: 'array',
  items: items || { type: 'string' },
  ...(description ? { description } : {}),
});
const none = () => ({ type: 'object', properties: {}, required: [] });

const SCHEMAS = {
  weather: {
    current: obj({ city: str(), units: str('metric or imperial') }),
    forecast: obj({ city: str(), units: str('metric or imperial') }),
  },
  currency: {
    rates: obj({ base: str(), symbols: arr() }),
    convert: obj({ from: str(), to: str(), amount: num() }),
  },
  crypto: {
    price: obj({ coins: str('coin id or comma-separated ids, e.g. bitcoin'), currency: str() }),
    top: obj({ limit: num(), currency: str() }),
    trending: none(),
  },
  translate: {
    text: obj({ text: str(), from: str(), to: str() }, ['text', 'to']),
    many: obj({ text: str(), from: str(), targets: arr(null, 'target language codes') }, ['text', 'targets']),
    detect: obj({ text: str() }, ['text']),
  },
  countries: {
    byName: obj({ name: str() }, ['name']),
    byCode: obj({ code: str('ISO 3166-1 alpha-2/3 code, e.g. EG') }, ['code']),
    byRegion: obj({ region: str('africa, americas, asia, europe, oceania') }, ['region']),
    all: none(),
  },
  location: {
    geocode: obj({ address: str(), limit: num() }, ['address']),
    reverse: obj({ lat: num(), lon: num() }, ['lat', 'lon']),
    distance: obj(
      {
        from: { type: 'object', description: '{ lat, lon }' },
        to: { type: 'object', description: '{ lat, lon }' },
        unit: str('km or mi'),
      },
      ['from', 'to']
    ),
  },
  social: {
    githubUser: obj({ username: str() }, ['username']),
    githubRepo: obj({ owner: str(), repo: str() }, ['owner', 'repo']),
    githubTrending: none(),
    hackerNews: obj({ limit: num() }),
    productHunt: none(),
  },
  free: {
    weather: obj({ lat: num(), lon: num(), city: str() }),
    wttr: obj({ city: str(), format: str() }),
    exchangeRates: obj({ base: str(), symbols: arr() }),
    binanceTicker: obj({ symbol: str('e.g. BTCUSDT') }, ['symbol']),
    binanceTickers: obj({ symbols: arr(null, 'e.g. ["BTCUSDT","ETHUSDT"]') }),
    football: obj({ league: str('e.g. bl1'), season: str('e.g. 2024') }),
  },
  smart: {
    weather: obj({ city: str(), units: str() }, ['city']),
    news: obj({ topic: str(), limit: num() }),
    currency: obj({ base: str(), symbols: arr() }),
    cryptoPrice: obj({ id: str('CoinGecko id, e.g. bitcoin'), symbol: str(), currency: str() }, ['id']),
    ip: obj({ ip: str() }),
    translate: obj({ text: str(), from: str(), to: str() }, ['text', 'to']),
    holidays: obj({ country: str('ISO country code, e.g. EG'), year: num() }, ['country']),
    weatherAggregate: obj({ city: str() }, ['city']),
  },
  ip: {
    lookup: obj({ ip: str('omit for caller IP') }),
    batchLookup: obj({ ips: arr(null, 'up to ~100 IPs') }, ['ips']),
    myIp: none(),
  },
  govspending: {
    searchAwards: obj({
      keyword: str(),
      startDate: str('YYYY-MM-DD'),
      endDate: str('YYYY-MM-DD'),
      limit: num(),
    }),
    agencySpending: obj({ fiscalYear: num() }),
  },
  wikidata: {
    search: obj({ query: str(), language: str(), limit: num() }, ['query']),
    getEntity: obj({ id: str('Q-id, e.g. Q79'), language: str() }, ['id']),
  },
  arxiv: {
    search: obj({ query: str(), maxResults: num() }, ['query']),
  },
  biodiversity: {
    searchSpecies: obj({ query: str(), limit: num() }, ['query']),
    occurrences: obj({ species: str(), country: str(), limit: num() }, ['species']),
  },
  research: {
    wikipedia: obj({ query: str(), language: str(), limit: num() }, ['query']),
    article: obj({ title: str(), language: str() }, ['title']),
    books: obj({ query: str(), limit: num() }, ['query']),
  },
  ai: {
    chat: obj({ messages: arr({ type: 'object' }), model: str() }, ['messages']),
    smartChat: obj({ messages: arr({ type: 'object' }) }, ['messages']),
    groqChat: obj({ messages: arr({ type: 'object' }), model: str() }, ['messages']),
    groq: obj({ messages: arr({ type: 'object' }), model: str() }, ['messages']),
    openaiChat: obj({ messages: arr({ type: 'object' }), model: str() }, ['messages']),
    openai: obj({ messages: arr({ type: 'object' }), model: str() }, ['messages']),
    anthropicChat: obj({ messages: arr({ type: 'object' }), model: str(), temperature: num(), maxTokens: num() }, [
      'messages',
    ]),
    geminiChat: obj({ messages: arr({ type: 'object' }), model: str(), temperature: num() }, ['messages']),
    generateImage: obj({ prompt: str(), size: str('e.g. 1024x1024'), quality: str() }, ['prompt']),
    imagine: obj({ prompt: str(), size: str('e.g. 1024x1024'), quality: str() }, ['prompt']),
    embed: obj({ input: str(), model: str() }, ['input']),
  },
  utils: {
    qr: obj({ text: str(), size: num(), format: str('png or svg') }, ['text']),
    uuid: none(),
    passwordStrength: obj({ password: str() }, ['password']),
    hash: obj({ text: str(), algorithm: str('md5, sha1, sha256, sha512') }, ['text']),
    base64Encode: obj({ text: str() }, ['text']),
    base64Decode: obj({ encoded: str() }, ['encoded']),
    loremIpsum: obj({ type: str('words, sentences or paragraphs'), count: num() }),
    emojiSearch: obj({ query: str(), category: str(), limit: num() }),
    randomEmoji: obj({ category: str() }),
    hexToRgb: obj({ hex: str('e.g. FF5733') }, ['hex']),
    rgbToHex: obj({ r: num(), g: num(), b: num() }, ['r', 'g', 'b']),
    httpStatus: obj({ code: num('e.g. 404') }, ['code']),
    time: obj({ timezone: str('e.g. Africa/Cairo') }, ['timezone']),
    timezones: none(),
    holidays: obj({ country: str('ISO country code'), year: num() }, ['country']),
    quote: obj({ tag: str() }),
    quotes: obj({ limit: num(), tag: str() }),
    define: obj({ word: str() }, ['word']),
    shorten: obj({ url: str() }, ['url']),
    trivia: obj({ amount: num(), difficulty: str('easy, medium or hard'), type: str() }),
    color: obj({ hex: str() }, ['hex']),
    randomNumber: obj({ min: num(), max: num() }),
    formatDate: obj({ date: str('ISO date string') }),
    validateJSON: obj({ json: str() }, ['json']),
    parseURL: obj({ url: str() }, ['url']),
    slugify: obj({ text: str() }, ['text']),
  },
  food: {
    searchMeals: obj({ name: str() }, ['name']),
    getRandomMeal: none(),
    random: none(),
    getMeal: obj({ id: str('MealDB meal id') }, ['id']),
    byCategory: obj({ category: str('e.g. Chicken') }, ['category']),
    categories: none(),
    searchSpoonacular: obj({ query: str(), number: num() }, ['query']),
    getSpoonacularRecipe: obj({ id: num() }, ['id']),
    searchEdamam: obj({ query: str(), from: num(), to: num() }, ['query']),
    analyzeEdamam: obj({ ingredients: arr() }, ['ingredients']),
  },
  gaming: {
    crossfireWeapons: obj({ limit: num() }),
    crossfireWeapon: obj({ name: str('e.g. AK-47') }, ['name']),
    crossfireMaps: obj({ limit: num() }),
    crossfireCharacters: obj({ limit: num() }),
    crossfireGameModes: obj({ limit: num() }),
    crossfireEvents: obj({ limit: num() }),
    crossfireSearch: obj({ query: str(), limit: num() }, ['query']),
    crossfireNews: none(),
    fortniteShop: none(),
    fortniteCosmetic: obj({ name: str('e.g. Skull Trooper') }, ['name']),
    lolChampions: none(),
    lolChampion: obj({ name: str('e.g. ahri') }, ['name']),
    minecraftPlayer: obj({ username: str() }, ['username']),
    minecraftServerStatus: obj({ host: str('e.g. mc.hypixel.net') }, ['host']),
    chessPlayer: obj({ username: str() }, ['username']),
    chessDailyPuzzle: none(),
    searchGameWiki: obj({ wiki: str('Fandom subdomain, e.g. valorant'), query: str(), limit: num() }, [
      'wiki',
      'query',
    ]),
    freeFirePlayer: obj({ playerId: str() }, ['playerId']),
    pubgPlayer: obj({ playerName: str(), platform: str('default steam') }, ['playerName']),
    freeFireNews: none(),
    pubgPatchNotes: none(),
  },
  space: {
    apod: obj({ date: str('YYYY-MM-DD, omit for today') }),
    mars: obj({ rover: str('curiosity, opportunity, spirit or perseverance'), sol: num(), camera: str() }),
    asteroids: obj({ start_date: str('YYYY-MM-DD'), end_date: str('YYYY-MM-DD') }),
    issPosition: none(),
  },
  spaceExtended: {
    apod: obj({ date: str('YYYY-MM-DD, omit for today') }),
    marsPhotos: obj({ rover: str(), sol: num() }),
    nearEarthObjects: obj({ startDate: str('YYYY-MM-DD'), endDate: str('YYYY-MM-DD') }, ['startDate', 'endDate']),
    issPosition: none(),
  },
  movies: {
    search: obj({ query: str(), year: num(), page: num() }, ['query']),
    details: obj({ id: num('TMDB movie id') }, ['id']),
    trending: obj({ window: str('day or week') }),
    tv: obj({ query: str(), page: num() }, ['query']),
  },
  tv: {
    search: obj({ query: str() }, ['query']),
    details: obj({ id: num('TMDB TV id') }, ['id']),
    trending: none(),
  },
  news: {
    headlines: obj({ country: str('ISO code, e.g. eg'), category: str(), q: str(), pageSize: num() }),
    search: obj({ q: str(), language: str(), sortBy: str(), pageSize: num() }, ['q']),
  },
  images: {
    search: obj({ query: str(), perPage: num(), orientation: str('landscape, portrait or squarish') }, ['query']),
    random: obj({ query: str(), orientation: str() }),
    pexels: obj({ query: str(), perPage: num(), orientation: str() }, ['query']),
  },
  football: {
    fixtures: obj({ league: num(), date: str('YYYY-MM-DD') }),
    standings: obj({ league: num('39 = Premier League'), season: num() }, ['league', 'season']),
    teams: obj({ name: str('e.g. Zamalek') }, ['name']),
  },
  stocks: {
    quote: obj({ symbol: str('e.g. AAPL') }, ['symbol']),
    search: obj({ query: str() }, ['query']),
    overview: obj({ symbol: str() }, ['symbol']),
  },
  music: {
    artist: obj({ name: str(), limit: num() }, ['name']),
    album: obj({ query: str(), artist: str(), limit: num() }, ['query']),
    itunes: obj({ term: str(), media: str(), limit: num() }, ['term']),
  },
  covid: {
    global: none(),
    country: obj({ country: str('name, ISO code or id') }, ['country']),
    historical: obj({ country: str(), days: num() }),
    topCountries: obj({ limit: num() }),
  },
  earthquake: {
    recent: obj({ minMagnitude: num(), limit: num() }),
    byLocation: obj({ lat: num(), lon: num(), radiusKm: num(), minMagnitude: num() }, ['lat', 'lon']),
    biggestToday: none(),
  },
  airquality: {
    current: obj({ lat: num(), lon: num() }, ['lat', 'lon']),
    forecast: obj({ lat: num(), lon: num(), days: num() }, ['lat', 'lon']),
    classify: obj({ aqi: num() }, ['aqi']),
  },
  astronomy: {
    sunriseSunset: obj({ lat: num(), lon: num(), date: str() }, ['lat', 'lon']),
    moonPhase: obj({ date: str('YYYY-MM-DD') }),
  },
  postal: {
    lookup: obj({ country: str('ISO code, e.g. us'), postalCode: str('e.g. 90210') }, ['country', 'postalCode']),
  },
  predict: {
    nationality: obj({ name: str() }, ['name']),
    gender: obj({ name: str() }, ['name']),
    age: obj({ name: str() }, ['name']),
    all: obj({ name: str() }, ['name']),
  },
  brewery: {
    search: obj({ query: str(), city: str(), state: str(), limit: num() }),
    random: none(),
    getById: obj({ id: str() }, ['id']),
  },
  sportsdb: {
    searchTeam: obj({ name: str('e.g. Arsenal') }, ['name']),
    searchPlayer: obj({ name: str() }, ['name']),
    leagueEvents: obj({ leagueId: str() }, ['leagueId']),
    leagues: obj({ sport: str('e.g. Soccer') }),
  },
  baseball: {
    mlbTeams: none(),
    mlbSchedule: obj({ date: str('YYYY-MM-DD'), teamId: num() }),
  },
  hockey: {
    nhlTeams: none(),
    nhlPlayer: obj({ id: num() }, ['id']),
  },
  domain: {
    whois: obj({ domain: str('e.g. example.com') }, ['domain']),
    dnsRecords: obj({ domain: str(), type: str('default A') }, ['domain']),
    resolveIp: obj({ domain: str() }, ['domain']),
  },
  placeholder: {
    image: obj({ width: num(), height: num(), text: str(), bg: str(), fg: str() }),
    picsum: obj({ width: num(), height: num(), seed: str(), grayscale: { type: 'boolean' }, blur: num() }),
    avatar: obj({ name: str(), size: num(), background: str(), color: str(), rounded: { type: 'boolean' } }),
    dicebear: obj({ seed: str(), style: str('default identicon') }),
  },
  weatheralerts: {
    usAlerts: obj({ state: str('two-letter code, e.g. CA — omit for nationwide') }),
    pointForecast: obj({ lat: num(), lon: num() }, ['lat', 'lon']),
  },
  coinWizard: {
    info: obj({ id: str('CoinGecko id, e.g. bitcoin') }, ['id']),
    chart: obj({ id: str(), days: str('1, 7, 30, 90, 365 or max'), vsCurrency: str() }, ['id']),
    ohlc: obj({ id: str(), days: num(), vsCurrency: str() }, ['id']),
    global: none(),
    exchanges: obj({ limit: num() }),
    categories: obj({ limit: num() }),
    gainersLosers: obj({ limit: num(), vsCurrency: str() }),
    search: obj({ query: str() }, ['query']),
    convert: obj({ id: str(), amount: num(), vsCurrency: str() }, ['id']),
    list: none(),
  },
  university: {
    search: obj({ country: str(), name: str() }),
    byCountry: obj({ country: str() }, ['country']),
  },
  nutrition: {
    byBarcode: obj({ barcode: str() }, ['barcode']),
    search: obj({ query: str(), limit: num() }, ['query']),
  },
  disasters: {
    activeEvents: obj({ category: str(), status: str(), limit: num(), days: num() }),
    categories: none(),
  },
  blockchain: {
    bitcoinStats: none(),
    bitcoinAddress: obj({ address: str() }, ['address']),
    ethGasPrice: none(),
  },
  webtools: {
    favicon: obj({ domain: str(), size: num() }, ['domain']),
    screenshot: obj({ url: str(), width: num() }, ['url']),
    metadata: obj({ url: str() }, ['url']),
  },
  worldbank: {
    indicator: obj({ country: str('ISO code, e.g. EG'), indicator: str('default NY.GDP.MKTP.CD'), limit: num() }, [
      'country',
    ]),
    population: obj({ country: str(), limit: num() }, ['country']),
    gdp: obj({ country: str(), limit: num() }, ['country']),
  },
  currencyHistory: {
    latest: obj({ base: str(), symbols: arr() }),
    historical: obj({ date: str('YYYY-MM-DD'), base: str(), symbols: arr() }, ['date']),
    timeSeries: obj({ startDate: str('YYYY-MM-DD'), endDate: str('YYYY-MM-DD'), base: str(), symbols: arr() }, [
      'startDate',
      'endDate',
    ]),
  },
  thesaurus: {
    synonyms: obj({ word: str() }, ['word']),
    antonyms: obj({ word: str() }, ['word']),
    rhymes: obj({ word: str() }, ['word']),
    suggest: obj({ text: str() }, ['text']),
  },
  markdown: {
    render: obj({ text: str(), mode: str(), context: str() }),
    renderGfm: obj({ text: str() }, ['text']),
    analyze: obj({ text: str() }, ['text']),
  },
  techdb: {
    listDevices: none(),
    getDevice: obj({ id: str() }, ['id']),
    searchDevices: obj({ query: str() }, ['query']),
    compareDevices: obj({ ids: arr() }, ['ids']),
  },
  websites: {
    status: obj({ url: str() }, ['url']),
    detectTechStack: obj({ url: str() }, ['url']),
    getMeta: obj({ url: str() }, ['url']),
  },
  fakedb: {
    getPosts: obj({ userId: num(), id: num() }),
    getComments: obj({ postId: num() }, ['postId']),
    getUser: obj({ id: num() }, ['id']),
    getUsers: none(),
    getTodos: obj({ userId: num(), completed: { type: 'boolean' } }),
    getAlbums: obj({ userId: num() }),
    getPhotos: obj({ albumId: num() }, ['albumId']),
    create: obj({ resource: str('default posts'), body: { type: 'object' } }, ['body']),
  },
  enriched: {
    weather: obj({ city: str(), units: str() }, ['city']),
    compareCities: obj({ cities: arr(null, 'e.g. ["Cairo","Dubai"]'), units: str() }, ['cities']),
  },
  combined: {
    marketSnapshot: obj({ currency: str() }),
    newsDigest: obj({ topic: str(), language: str() }, ['topic']),
  },
  rss: {
    fetch: obj({ source: str(), limit: num() }, ['source']),
    custom: obj({ url: str(), limit: num() }, ['url']),
    aggregate: obj({ sources: arr(), limit: num(), sortBy: str() }, ['sources']),
  },
  podcasts: {
    search: obj({ query: str(), limit: num(), country: str(), language: str() }),
    episodes: obj({ feedUrl: str(), limit: num() }, ['feedUrl']),
    index: obj({ query: str(), limit: num() }, ['query']),
  },
  medical: {
    drug: obj({ name: str(), limit: num() }, ['name']),
    disease: obj({ disease: str() }, ['disease']),
    exercises: obj({ muscle: str(), equipment: str(), limit: num() }),
    nutrition: obj({ query: str() }, ['query']),
    bmi: obj({ weight_kg: num(), height_cm: num() }, ['weight_kg', 'height_cm']),
  },
  prayer: {
    today: obj({ city: str(), country: str(), method: num(), date: str() }, ['city']),
    byCoords: obj({ lat: num(), lon: num(), method: num() }, ['lat', 'lon']),
    monthly: obj({ city: str(), country: str(), method: num(), month: num(), year: num() }, ['city']),
  },
  anime: {
    search: obj({ query: str(), limit: num(), page: num(), type: str(), orderBy: str() }, ['query']),
    details: obj({ id: num() }, ['id']),
    top: obj({ limit: num(), type: str(), filter: str() }),
    nowAiring: none(),
    random: none(),
    manga: obj({ query: str(), limit: num() }, ['query']),
    mangaDetails: obj({ id: num() }, ['id']),
    episodes: obj({ id: num(), page: num() }, ['id']),
    episode: obj({ id: num(), episode: num() }, ['id', 'episode']),
    characters: obj({ id: num() }, ['id']),
    character: obj({ id: num() }, ['id']),
    videos: obj({ id: num() }, ['id']),
    pictures: obj({ id: num() }, ['id']),
    recommendations: obj({ id: num() }, ['id']),
    news: obj({ id: num() }, ['id']),
    quote: obj({ anime: str() }),
    quotesByCharacter: obj({ character: str() }, ['character']),
  },
  flights: {
    live: obj({ flight_iata: str(), dep_iata: str(), arr_iata: str(), airline_iata: str(), limit: num() }),
    airport: obj({ iata: str('e.g. CAI') }, ['iata']),
    airline: obj({ name: str(), iata: str() }),
  },
  stackexchange: {
    searchQuestions: obj({ query: str(), site: str(), limit: num(), sort: str() }, ['query']),
    getQuestion: obj({ id: num(), site: str() }, ['id']),
    getTopUsers: obj({ site: str(), limit: num() }),
  },
  literature: {
    randomQuote: none(),
    searchQuotes: obj({ query: str() }, ['query']),
  },
  gold: {
    price: obj({ currency: str() }),
    silver: obj({ currency: str() }),
  },
  dev: {
    npmPackage: obj({ name: str() }, ['name']),
    npmDownloads: obj({ name: str() }, ['name']),
    githubRepos: obj({ username: str(), sort: str(), limit: num() }, ['username']),
    githubReleases: obj({ owner: str(), repo: str(), limit: num() }, ['owner', 'repo']),
    validateEmail: obj({ email: str() }, ['email']),
    dnsLookup: obj({ domain: str(), type: str('default A') }, ['domain']),
    loremIpsum: obj({ paragraphs: num(), type: str(), amount: num() }),
    httpStatus: obj({ code: num() }, ['code']),
  },
  art: {
    search: obj({ query: str(), limit: num(), page: num() }, ['query']),
    details: obj({ id: num() }, ['id']),
    searchMet: obj({ query: str(), isHighlight: { type: 'boolean' }, hasImages: { type: 'boolean' } }, ['query']),
    metDetails: obj({ id: num() }, ['id']),
  },
  books: {
    search: obj({ query: str(), limit: num() }, ['query']),
    getById: obj({ id: str() }, ['id']),
    random: none(),
  },
  comics: {
    randomXKCD: none(),
    getXKCD: obj({ num: num('comic number') }, ['num']),
  },
  finance: {
    stockQuote: obj({ symbol: str() }, ['symbol']),
    cryptoPrice: obj({ coin: str('CoinGecko id') }, ['coin']),
  },
  fandom: {
    search: obj({ wiki: str(), query: str(), limit: num() }, ['wiki', 'query']),
    getPage: obj({ wiki: str(), pageId: num(), title: str() }, ['wiki']),
    recentActivity: obj({ wiki: str(), limit: num() }, ['wiki']),
  },
  spotify: {
    searchTracks: obj({ query: str(), limit: num() }, ['query']),
    getArtist: obj({ id: str('Spotify artist id') }, ['id']),
    getArtistTopTracks: obj({ id: str(), country: str() }, ['id']),
  },
  steam: {
    getPlayerSummaries: obj({ steamIds: str('comma-separated SteamIDs') }, ['steamIds']),
    getOwnedGames: obj({ steamId: str(), includeAppInfo: { type: 'boolean' } }, ['steamId']),
    searchApps: obj({ query: str() }, ['query']),
  },
  animals: {
    randomDog: none(),
    randomCat: none(),
    randomFox: none(),
    randomDuck: none(),
    randomPanda: none(),
    randomBird: none(),
  },
  lyrics: {
    search: obj({ artist: str(), title: str() }, ['artist', 'title']),
  },
  math: {
    evaluate: obj({ expression: str('e.g. 2*(3+4)') }, ['expression']),
    randomFact: obj({ number: num(), type: str() }),
  },
  jobs: {
    search: obj({ query: str(), location: str(), limit: num() }, ['query']),
  },
  science: {
    nasaApod: obj({ date: str('YYYY-MM-DD') }),
    randomFact: none(),
  },
  basketball: {
    nbaTeams: none(),
    nbaGames: obj({ dates: arr(null, 'YYYY-MM-DD strings') }, ['dates']),
    nbaPlayer: obj({ id: num() }, ['id']),
  },
  vehicles: {
    randomCar: none(),
    vinDecode: obj({ vin: str('17-character VIN') }, ['vin']),
    recalls: obj({ make: str('e.g. toyota'), model: str('e.g. camry'), year: str('e.g. 2020') }, [
      'make',
      'model',
      'year',
    ]),
    makes: obj({ type: str('car, truck or motorcycle — default car') }),
    models: obj({ make: str('e.g. toyota'), year: str('e.g. 2020') }, ['make', 'year']),
  },
  pets: {
    random: none(),
  },
  drinks: {
    randomCocktail: none(),
    searchCocktail: obj({ name: str() }, ['name']),
    searchIngredient: obj({ name: str() }, ['name']),
  },
  geography: {
    countryInfo: obj({ country: str() }, ['country']),
    allCountries: none(),
    capitalCity: obj({ country: str() }, ['country']),
  },
  wildlife: {
    randomFact: none(),
  },
  politics: {
    presidents: none(),
  },
  language: {
    detect: obj({ text: str() }, ['text']),
    translate: obj({ text: str(), from: str(), to: str() }, ['text', 'to']),
  },
  law: {
    search: obj({ query: str() }, ['query']),
  },
  military: {
    time: obj({ time: str() }, ['time']),
  },
  religion: {
    randomVerse: none(),
    getVerse: obj({ reference: str('e.g. John 3:16') }, ['reference']),
  },
  islamic: {
    quranChapters: none(),
    quranChapter: obj({ number: num(), edition: str() }, ['number']),
    randomVerse: none(),
    azkar: obj({ type: str('morning or evening') }),
    prayerTimes: obj({ city: str(), country: str(), method: num() }, ['city']),
  },
  search: {
    instant: obj({ query: str() }, ['query']),
    web: obj({ query: str(), language: str(), limit: num() }, ['query']),
  },
  realtime: {
    getPrice: obj({ exchange: str('default binance'), symbol: str('e.g. BTCUSDT'), timeout: num() }, ['symbol']),
  },
  scholarly: {
    searchWorks: obj({ query: str(), limit: num() }, ['query']),
    getWork: obj({ id: str('OpenAlex ID or DOI') }, ['id']),
    crossrefSearch: obj({ query: str(), limit: num() }, ['query']),
    doiMetadata: obj({ doi: str('e.g. 10.1038/nature12373') }, ['doi']),
  },
  registry: {
    pypiInfo: obj({ package: str('e.g. requests') }, ['package']),
    npmInfo: obj({ package: str('e.g. express') }, ['package']),
    osvQuery: obj({ ecosystem: str('e.g. PyPI, npm, Go'), package: str(), version: str() }, [
      'ecosystem',
      'package',
      'version',
    ]),
  },
  dns: {
    resolve: obj({ name: str('hostname, e.g. example.com'), type: str('A, AAAA, CNAME, MX, TXT, NS or SRV') }, ['name']),
    a: obj({ name: str() }, ['name']),
    aaaa: obj({ name: str() }, ['name']),
    cname: obj({ name: str() }, ['name']),
    mx: obj({ name: str() }, ['name']),
    txt: obj({ name: str() }, ['name']),
    ns: obj({ name: str() }, ['name']),
    srv: obj({ name: str() }, ['name']),
  },
  geocoding: {
    search: obj({ name: str('place name, e.g. Cairo'), count: num(), language: str('default en') }, ['name']),
  },
  earth: {
    elevation: obj({ lat: num(), lon: num() }, ['lat', 'lon']),
    marine: obj({ lat: num(), lon: num() }, ['lat', 'lon']),
    flood: obj({ lat: num(), lon: num(), days: num() }, ['lat', 'lon']),
    climate: obj({ lat: num(), lon: num(), startDate: str('YYYY-MM-DD'), endDate: str('YYYY-MM-DD') }, [
      'lat',
      'lon',
      'startDate',
      'endDate',
    ]),
    historical: obj({ lat: num(), lon: num(), startDate: str('YYYY-MM-DD'), endDate: str('YYYY-MM-DD') }, [
      'lat',
      'lon',
      'startDate',
      'endDate',
    ]),
  },
  metno: {
    forecast: obj({ lat: num(), lon: num() }, ['lat', 'lon']),
  },
  nws: {
    forecast: obj({ lat: num(), lon: num() }, ['lat', 'lon']),
    alerts: obj({ area: str('two-letter state/area code, e.g. CA') }),
  },
  water: {
    usgs: obj({ site: str('USGS site number, e.g. 01646500'), parameter: str('default 00060 discharge'), period: str('default P1D') }, ['site']),
  },
  opensky: {
    states: obj({ bbox: { type: 'object', description: 'optional { lamin, lomin, lamax, lomax }' } }),
  },
  adsb: {
    aircraft: obj({ icao: str('ICAO 24-bit hex address, e.g. 406b30') }, ['icao']),
    callsign: obj({ callsign: str('flight callsign, e.g. BAW123') }, ['callsign']),
  },
  launches: {
    upcoming: obj({ limit: num() }),
    previous: obj({ limit: num() }),
    byId: obj({ id: str('launch id or slug') }, ['id']),
  },
  eonet: {
    events: obj({ limit: num() }),
    category: obj({ category: str('e.g. wildfires, volcanoes, severeStorms'), limit: num() }, ['category']),
    wildfires: obj({ limit: num() }),
    volcanoes: obj({ limit: num() }),
    storms: obj({ limit: num() }),
  },
  biomed: {
    pubmedSearch: obj({ query: str('e.g. diabetes'), limit: num() }, ['query']),
    pubmedSummary: obj({ ids: arr(null, 'one or more PMIDs') }, ['ids']),
    clinicalTrials: obj({ query: str(), limit: num() }, ['query']),
    europePmc: obj({ query: str(), limit: num() }, ['query']),
  },
  fda: {
    drugEvents: obj({ search: str('openFDA search query'), limit: num() }),
    foodRecalls: obj({ search: str('openFDA search query'), limit: num() }),
    deviceEvents: obj({ search: str('openFDA search query'), limit: num() }),
  },
  grammar: {
    check: obj({ text: str('text to check'), language: str('default en-US') }, ['text']),
  },
  devto: {
    articles: obj({ tag: str(), page: num(), perPage: num() }),
    byTag: obj({ tag: str('e.g. javascript'), perPage: num() }, ['tag']),
    tags: obj({ perPage: num() }),
  },
  bluesky: {
    searchActors: obj({ query: str(), limit: num() }, ['query']),
    profile: obj({ actor: str('handle or DID, e.g. bsky.app') }, ['actor']),
    authorFeed: obj({ actor: str(), limit: num() }, ['actor']),
  },
  lobsters: {
    hottest: none(),
    newest: none(),
    active: none(),
    byTag: obj({ tag: str('e.g. programming') }, ['tag']),
  },
  spacenews: {
    articles: obj({ limit: num(), search: str() }),
    blogs: obj({ limit: num() }),
    reports: obj({ limit: num() }),
  },
  treasury: {
    averageInterestRates: obj({ limit: num() }),
    debtToPenny: obj({ limit: num() }),
    exchangeRates: obj({ limit: num() }),
  },
  coinbase: {
    spot: obj({ pair: str('e.g. BTC-USD') }),
    exchangeRates: obj({ currency: str('base currency, e.g. BTC') }),
  },
  demographics: {
    gender: obj({ name: str() }, ['name']),
    age: obj({ name: str() }, ['name']),
    nationality: obj({ name: str() }, ['name']),
  },
  poetry: {
    random: obj({ limit: num() }),
    byAuthor: obj({ author: str('e.g. Emily Dickinson'), limit: num() }, ['author']),
    byTitle: obj({ title: str() }, ['title']),
    search: obj({ query: str(), limit: num() }, ['query']),
  },
  coinpaprika: {
    tickers: obj({ limit: num() }),
    ticker: obj({ id: str('Coinpaprika coin id, e.g. btc-bitcoin') }, ['id']),
    global: none(),
    search: obj({ query: str() }, ['query']),
    exchanges: obj({ limit: num() }),
  },
  coinlore: {
    tickers: obj({ start: num(), limit: num() }),
    global: none(),
    coin: obj({ id: str('CoinLore coin id, e.g. 90') }, ['id']),
  },
  kraken: {
    ticker: obj({ pair: str('e.g. XBTUSD') }),
    ohlc: obj({ pair: str('e.g. XBTUSD'), interval: num('minutes, e.g. 60') }),
    trades: obj({ pair: str(), count: num() }),
  },
  defillama: {
    protocols: obj({ limit: num() }),
    protocol: obj({ slug: str('e.g. aave') }, ['slug']),
    chains: none(),
    tvl: obj({ protocol: str('e.g. aave') }, ['protocol']),
    prices: obj({ coins: str('e.g. coingecko:bitcoin,coingecko:ethereum') }, ['coins']),
  },
  mempool: {
    fees: none(),
    blockHeight: none(),
    blocks: obj({ limit: num() }),
    difficultyAdjustment: none(),
    mempool: none(),
  },
  blockchair: {
    stats: obj({ chain: str('default bitcoin') }),
    address: obj({ chain: str('default bitcoin'), address: str('crypto address') }, ['address']),
    transaction: obj({ chain: str('default bitcoin'), hash: str('transaction hash') }, ['hash']),
  },
  exchangerate: {
    latest: obj({ base: str('base currency, e.g. USD') }),
  },
  nbp: {
    table: obj({ table: str('A, B or C — default A') }),
    rate: obj({ code: str('e.g. USD'), table: str('default A') }),
    gold: none(),
  },
  imf: {
    data: obj({ indicator: str('e.g. NGDP_RPCH') }, ['indicator']),
    country: obj({ indicator: str(), country: str('ISO3 code, e.g. DEU') }, ['indicator', 'country']),
    indicators: none(),
  },
  eurostat: {
    dataset: obj({ dataset: str('e.g. nama_10_gdp'), geo: str(), time: str() }, ['dataset']),
    gdp: obj({ geo: str(), time: str() }),
  },
  aviationwx: {
    metar: obj({ station: str('ICAO code, e.g. KJFK') }),
    taf: obj({ station: str('ICAO code, e.g. KJFK') }),
  },
  tides: {
    waterLevel: obj({ station: str('default 8443970 (Boston)'), units: str('metric or english') }),
    predictions: obj({ station: str(), units: str(), date: str('today or YYYYMMDD') }),
    stations: none(),
  },
  carbon: {
    current: none(),
    forecast: none(),
    regional: none(),
    generationMix: none(),
  },
  spaceweather: {
    kp: none(),
    solarWind: none(),
    aurora: none(),
    alerts: none(),
  },
  citybikes: {
    networks: obj({ limit: num() }),
    network: obj({ id: str('CityBikes network id, e.g. bicing') }, ['id']),
  },
  transit: {
    locations: obj({ query: str(), results: num() }, ['query']),
    departures: obj({ stop: str('stop id or name'), duration: num() }, ['stop']),
    journeys: obj({ from: str(), to: str() }, ['from', 'to']),
  },
  tvmaze: {
    search: obj({ query: str() }, ['query']),
    show: obj({ id: num('TVmaze show id') }, ['id']),
    episodes: obj({ id: num() }, ['id']),
    schedule: obj({ country: str('ISO code, default US'), date: str('YYYY-MM-DD') }),
    people: obj({ query: str() }, ['query']),
  },
  deezer: {
    search: obj({ query: str(), limit: num() }, ['query']),
    track: obj({ id: num() }, ['id']),
    album: obj({ id: num() }, ['id']),
    artist: obj({ id: num() }, ['id']),
    chart: none(),
  },
  anilist: {
    search: obj({ query: str(), perPage: num() }, ['query']),
    anime: obj({ id: num() }, ['id']),
    manga: obj({ query: str(), perPage: num() }, ['query']),
    character: obj({ query: str(), perPage: num() }, ['query']),
  },
  kitsu: {
    search: obj({ query: str(), limit: num() }, ['query']),
    anime: obj({ id: str() }, ['id']),
  },
  ghibli: {
    films: none(),
    film: obj({ id: str() }, ['id']),
    people: none(),
  },
  pollinations: {
    text: obj({ prompt: str() }, ['prompt']),
    image: obj({ prompt: str(), width: num(), height: num() }, ['prompt']),
  },
  quickchart: {
    render: obj({ chart: { type: 'object', description: 'chart config object or JSON string' }, width: num(), height: num(), backgroundColor: str() }, ['chart']),
    bar: obj({ labels: arr(), data: arr({ type: 'number' }), title: str() }, ['labels', 'data']),
    line: obj({ labels: arr(), data: arr({ type: 'number' }), title: str() }, ['labels', 'data']),
    pie: obj({ labels: arr(), data: arr({ type: 'number' }), title: str() }, ['labels', 'data']),
  },
  speech: {
    tts: obj({ text: str(), lang: str('e.g. en') }, ['text']),
    voices: none(),
  },
  pubchem: {
    compound: obj({ name: str('e.g. aspirin') }, ['name']),
    compoundByCid: obj({ cid: str('PubChem CID') }, ['cid']),
    synonyms: obj({ name: str() }, ['name']),
  },
  rxnav: {
    drugs: obj({ name: str('e.g. aspirin') }, ['name']),
    interactions: obj({ rxcui: str('RxCUI code') }, ['rxcui']),
  },
  uniprot: {
    search: obj({ query: str('e.g. p53'), size: num() }, ['query']),
    entry: obj({ accession: str('e.g. P04637') }, ['accession']),
  },
  ensembl: {
    lookupSymbol: obj({ symbol: str('e.g. BRCA2'), species: str('default homo_sapiens') }, ['symbol']),
    sequence: obj({ id: str('Ensembl gene/transcript id') }, ['id']),
    xrefs: obj({ symbol: str(), species: str('default homo_sapiens') }, ['symbol']),
  },
  gho: {
    indicators: none(),
    data: obj({ indicator: str('WHO indicator code') }, ['indicator']),
    country: obj({ indicator: str(), country: str('ISO3 code') }, ['indicator', 'country']),
  },
  icd10: {
    search: obj({ terms: str('e.g. diabetes'), max: num() }, ['terms']),
    lookup: obj({ code: str('e.g. E11') }, ['code']),
  },
  exoplanet: {
    planets: obj({ limit: num() }),
    planet: obj({ name: str('e.g. WASP-39 b') }, ['name']),
    query: obj({ adql: str('ADQL SELECT query') }, ['adql']),
  },
  packages: {
    crates: obj({ name: str('e.g. serde') }, ['name']),
    packagist: obj({ package: str('e.g. laravel/framework') }, ['package']),
    rubygems: obj({ name: str('e.g. rails') }, ['name']),
    maven: obj({ groupId: str('e.g. org.apache.commons'), artifactId: str('e.g. commons-lang3') }, ['groupId', 'artifactId']),
    nuget: obj({ id: str('e.g. Newtonsoft.Json') }, ['id']),
    dockerhub: obj({ name: str('default library/nginx') }),
    homebrew: obj({ name: str('e.g. nginx') }, ['name']),
    goproxy: obj({ module: str('e.g. github.com/gin-gonic/gin') }, ['module']),
  },
  certs: {
    search: obj({ domain: str('e.g. example.com'), limit: num() }, ['domain']),
  },
  httptool: {
    get: none(),
    headers: none(),
    ip: none(),
    uuid: none(),
  },
  photon: {
    search: obj({ query: str(), limit: num() }, ['query']),
    reverse: obj({ lat: num(), lon: num() }, ['lat', 'lon']),
  },
  postcodes: {
    lookup: obj({ postcode: str('e.g. SW1A1AA') }, ['postcode']),
    reverse: obj({ lat: num(), lon: num() }, ['lat', 'lon']),
    validate: obj({ postcode: str() }, ['postcode']),
    random: none(),
  },
  census: {
    geocode: obj({ address: str('US street address') }, ['address']),
    reverse: obj({ lat: num(), lon: num() }, ['lat', 'lon']),
  },
  archiveorg: {
    search: obj({ query: str(), rows: num() }, ['query']),
    metadata: obj({ identifier: str('archive.org item id') }, ['identifier']),
  },
  gdacs: {
    events: obj({ limit: num(), type: str('e.g. EQ, TC, FL, WF, VO, DR') }),
  },
  reader: {
    article: obj({ url: str('page URL to extract') }, ['url']),
    rssToJson: obj({ url: str('RSS feed URL') }, ['url']),
  },
  statuspage: {
    service: obj({ service: str('github, discord, openai, cloudflare or a statuspage subdomain') }, ['service']),
    incidents: obj({ service: str() }, ['service']),
    components: obj({ service: str() }, ['service']),
  },
  macaddress: {
    lookup: obj({ mac: str('e.g. 00:1A:2B:3C:4D:5E') }, ['mac']),
  },
};

/**
 * Input schema for an MCP tool. Falls back to a permissive object schema
 * for methods without a specific entry (notably stream constructors and
 * static lookups like `rss.sources` / `prayer.methods`).
 */
export function getParameterSchema(providerName, methodName) {
  return (
    SCHEMAS[providerName]?.[methodName] ?? {
      type: 'object',
      properties: {},
      required: [],
      additionalProperties: true,
    }
  );
}

export default SCHEMAS;
