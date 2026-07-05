// ─────────────────────────────────────────────────────────────────────────────
// Bemora v4.0.0 — TypeScript Definitions
// ─────────────────────────────────────────────────────────────────────────────

// ── Error classes ─────────────────────────────────────────────────────────────

export declare class BemoraError extends Error {
  constructor(message: string, options?: { code?: string; provider?: string; cause?: any });
  code: string;
  provider?: string;
  cause?: any;
  timestamp: string;
  toJSON(): { name: string; message: string; code: string; provider?: string; timestamp: string; stack?: string };
}

export declare class ConfigurationError extends BemoraError {}
export declare class ProviderError extends BemoraError {}

export declare class ValidationError extends BemoraError {
  constructor(message: string, options?: { code?: string; provider?: string; cause?: any; errors?: any[] });
  errors: any[];
  toJSON(): { name: string; message: string; code: string; provider?: string; timestamp: string; stack?: string; errors: any[] };
}

/** Thrown when a circuit breaker is OPEN and the request is rejected without calling the provider. */
export declare class CircuitBreakerError extends BemoraError {}

/** Thrown when a per-provider (or global) timeout elapses before the provider responds. */
export declare class TimeoutError extends BemoraError {}

// ── Constructor options ───────────────────────────────────────────────────────

export interface BemoraKeys {
  weatherKey?: string;
  currencyKey?: string;
  newsKey?: string;
  unsplashKey?: string;
  pexelsKey?: string;
  footballKey?: string;
  goldKey?: string;
  nasaKey?: string;
  moviesKey?: string;
  stocksKey?: string;
  openaiKey?: string;
  groqKey?: string;
  anthropicKey?: string;
  geminiKey?: string;
  spoonacularKey?: string;
  edamamAppId?: string;
  edamamAppKey?: string;
  spotifyClientId?: string;
  spotifyClientSecret?: string;
  steamKey?: string;
  flightsKey?: string;
}

export interface CircuitBreakerOptions {
  /** Consecutive failures before the circuit opens (default 5). */
  failureThreshold?: number;
  /** Consecutive successes in HALF_OPEN state needed to close again (default 2). */
  successThreshold?: number;
  /** Milliseconds to stay OPEN before attempting a recovery probe (default 60 000). */
  openDuration?: number;
}

export interface BemoraOptions {
  /** Pino-compatible log level (default 'info'). */
  logLevel?: 'silent' | 'error' | 'warn' | 'info' | 'debug';
  /** Number of retry attempts per request (default 2). */
  retries?: number;
  /** Global request timeout in milliseconds (default 30 000). */
  timeout?: number;
  /** Per-provider timeout overrides, keyed by provider id (e.g. { anime: 60000 }). */
  timeouts?: Record<string, number>;
  /** Whether to run Zod validation on every response that has a registered schema (default false). */
  validateResponses?: boolean;
  /** Plug in a custom cache backend (must implement get/set/del/flush/keys). */
  cacheAdapter?: {
    get(key: string): any;
    set(key: string, value: any, ttl?: number): any;
    del(key: string): any;
    flush(): any;
    keys(): string[];
  };
  /** Add Cache-Control / ETag / X-Cache-Status fields to cached responses (default false). */
  cacheHeaders?: boolean;
  /** Fallback provider overrides per namespace. */
  fallbacks?: Record<string, string[]>;
  /** Circuit breaker configuration (applies to all providers). */
  circuitBreaker?: CircuitBreakerOptions;
}

// ── Metrics ───────────────────────────────────────────────────────────────────

export interface LatencyStats {
  p50: number;
  p95: number;
  p99: number;
  min: number;
  max: number;
  avg: number;
  samples: number;
}

export interface ProviderMetrics {
  provider: string;
  requests: number;
  errors: number;
  errorRate: number;
  cacheHits: number;
  cacheMisses: number;
  cacheHitRate: number;
  latency: LatencyStats;
}

// ── Circuit Breaker ───────────────────────────────────────────────────────────

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerState {
  provider: string;
  state: CircuitState;
  failures: number;
  successes: number;
  openedAt: number | null;
  probeInFlight: boolean;
  totalOpens: number;
  lastStateChange: number;
  config: Required<CircuitBreakerOptions>;
}

// ── Common result shapes ──────────────────────────────────────────────────────

export interface CacheMetadata {
  _cached: boolean;
  _cacheStatus?: 'HIT' | 'MISS';
  _cacheControl?: string;
  _xCacheStatus?: string;
  _etag?: string;
}

export interface WeatherResult extends CacheMetadata {
  city: string;
  country: string;
  temperature: number;
  feels_like: number;
  humidity: number;
  pressure: number;
  wind_speed: number;
  condition: string;
  description: string;
  icon: string;
  units: string;
}

export interface ForecastResult extends CacheMetadata {
  city: string;
  country: string;
  forecast: Array<{
    datetime: string;
    temperature: number;
    condition: string;
    description: string;
    humidity: number;
    wind_speed: number;
  }>;
}

export interface CurrencyRatesResult extends CacheMetadata {
  base: string;
  date: string;
  rates: Record<string, number>;
}

export interface ConvertResult extends CacheMetadata {
  from: string;
  to: string;
  amount: number;
  rate: number;
  result: number;
}

export interface Article {
  title: string;
  description: string;
  url: string;
  image: string | null;
  source: string;
  publishedAt: string;
}

export interface NewsResult extends CacheMetadata {
  total: number;
  articles: Article[];
}

export interface Photo {
  id: string;
  description: string | null;
  urls: { full: string; regular: string; small: string; thumb: string };
  author: string;
  author_link: string;
}

export interface ImagesResult extends CacheMetadata {
  total: number;
  photos: Photo[];
}

export interface FootballFixturesResult extends CacheMetadata {
  fixtures: Array<{
    id: number;
    date: string;
    status: string;
    league: string;
    home: string;
    away: string;
    score: string;
  }>;
}

export interface CryptoPriceResult extends CacheMetadata {
  currency: string;
  prices: Array<{
    coin: string;
    price: number;
    market_cap: number;
    change_24h: number;
  }>;
}

export interface GoldPriceResult extends CacheMetadata {
  metal: string;
  currency: string;
  price_per_troy_oz: number;
  price_per_gram: number;
  price_gram_22k: number;
  price_gram_21k: number;
  price_gram_18k: number;
  change: number;
  change_percent: number;
  updated_at: number;
}

export interface WikipediaResult extends CacheMetadata {
  query: string;
  language: string;
  results: Array<{
    title: string;
    snippet: string;
    url: string;
    wordcount: number;
    timestamp: string;
  }>;
}

export interface BooksResult extends CacheMetadata {
  total: number;
  books: Array<{
    title: string;
    author: string;
    year: number;
    isbn: string | undefined;
    cover: string | null;
    url: string;
  }>;
}

export interface ISSPositionResult extends CacheMetadata {
  lat: number;
  lon: number;
  timestamp: number;
}

export interface TranslateResult extends CacheMetadata {
  original: string;
  translated: string;
  from: string;
  to: string;
  quality: number;
}

export interface GeocodeResult extends CacheMetadata {
  results: Array<{ lat: string; lon: string; display_name: string }>;
}

export interface IPLookupResult extends CacheMetadata {
  ip: string;
  country: string;
  countryCode: string;
  region: string;
  city: string;
  zip: string;
  lat: number;
  lon: number;
  timezone: string;
  isp: string;
}

export interface HolidaysResult extends CacheMetadata {
  country: string;
  year: number;
  holidays: Array<{ date: string; name: string; global: boolean }>;
}

export interface XKCDResult extends CacheMetadata {
  comic: { title: string; img: string; num: number; alt?: string; year?: string };
}

export interface QRResult {
  text: string;
  qr_url: string;
  size: string;
  format: string;
}

export interface PasswordStrengthResult {
  score: number;
  label: string;
  suggestions: string[];
}

export interface HashResult {
  hash: string;
  algorithm: string;
}

export interface Base64Result {
  encoded?: string;
  text?: string;
}

export interface LoremIpsumResult {
  type: string;
  count: number;
  text: string;
}

export interface Emoji {
  emoji: string;
  name: string;
  category: string;
}

export interface EmojiSearchResult {
  count: number;
  emojis: Emoji[];
}

// ── Logger ────────────────────────────────────────────────────────────────────

export interface LogEntry {
  ts: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  msg: string;
  provider?: string;
  latencyMs?: number;
  cacheStatus?: string;
  [key: string]: any;
}

export declare const logger: {
  setLevel(level: 'silent' | 'error' | 'warn' | 'info' | 'debug'): void;
  getLevel(): string;
  setTransport(fn: ((entry: LogEntry) => void) | null): void;
  debug(msg: string, meta?: Partial<LogEntry>): void;
  info(msg: string, meta?: Partial<LogEntry>): void;
  warn(msg: string, meta?: Partial<LogEntry>): void;
  error(msg: string, meta?: Partial<LogEntry>): void;
  maskKey(key: string): string;
};

// ── Top-level exports ─────────────────────────────────────────────────────────

export declare function batch(calls: Array<{ id: string; fn: () => Promise<any> }>): Promise<Record<string, any>>;

export declare function staleWhileRevalidate<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl?: number
): Promise<T & CacheMetadata>;

export declare function fallbackChain(
  cacheKey: string,
  chain: Array<{ name: string; fn: () => Promise<any> }>,
  cacheTTL?: number
): Promise<any>;

export { BemoraError, ConfigurationError, ProviderError, ValidationError, CircuitBreakerError, TimeoutError };

// ── Main class ────────────────────────────────────────────────────────────────

export declare class Bemora {
  constructor(keys?: BemoraKeys, options?: BemoraOptions);

  // ── Provider namespaces ────────────────────────────────────────────────────
  weather: {
    current(params: { city: string; units?: 'metric' | 'imperial' | 'standard'; signal?: AbortSignal }): Promise<WeatherResult>;
    forecast(params: { city: string; units?: string; signal?: AbortSignal }): Promise<ForecastResult>;
  };
  currency: {
    rates(params?: { base?: string; symbols?: string[]; signal?: AbortSignal }): Promise<CurrencyRatesResult>;
    convert(params: { from: string; to: string; amount: number; signal?: AbortSignal }): Promise<ConvertResult>;
  };
  news: {
    headlines(params?: { country?: string; category?: string; q?: string; pageSize?: number; signal?: AbortSignal }): Promise<NewsResult>;
    search(params: { q: string; language?: string; sortBy?: string; pageSize?: number; signal?: AbortSignal }): Promise<NewsResult>;
  };
  images: {
    search(params: { query: string; perPage?: number; orientation?: string; signal?: AbortSignal }): Promise<ImagesResult>;
    random(params?: { query?: string; orientation?: string; signal?: AbortSignal }): Promise<Photo>;
    pexels(params: { query: string; perPage?: number; signal?: AbortSignal }): Promise<ImagesResult>;
  };
  football: {
    fixtures(params?: { league?: number; date?: string; signal?: AbortSignal }): Promise<FootballFixturesResult>;
    standings(params: { league: number; season: number; signal?: AbortSignal }): Promise<any>;
    teams(params: { name: string; signal?: AbortSignal }): Promise<any>;
  };
  crypto: {
    price(params: { coins: string | string[]; currency?: string; signal?: AbortSignal }): Promise<CryptoPriceResult>;
    trending(params?: { signal?: AbortSignal }): Promise<any>;
    top(params?: { currency?: string; limit?: number; signal?: AbortSignal }): Promise<any>;
  };
  gold: {
    price(params?: { currency?: string; signal?: AbortSignal }): Promise<GoldPriceResult>;
    silver(params?: { currency?: string; signal?: AbortSignal }): Promise<any>;
  };
  research: {
    wikipedia(params: { query: string; language?: string; limit?: number; signal?: AbortSignal }): Promise<WikipediaResult>;
    article(params: { title: string; language?: string; signal?: AbortSignal }): Promise<any>;
    books(params: { query: string; limit?: number; signal?: AbortSignal }): Promise<BooksResult>;
  };
  location: {
    geocode(params: { address: string; signal?: AbortSignal }): Promise<GeocodeResult>;
    reverse(params: { lat: number; lon: number; signal?: AbortSignal }): Promise<any>;
    distance(params: { lat1: number; lon1: number; lat2: number; lon2: number }): number;
  };
  ip: {
    lookup(params: { ip?: string; signal?: AbortSignal }): Promise<IPLookupResult>;
    batchLookup(params: { ips: string[]; signal?: AbortSignal }): Promise<any>;
  };
  countries: {
    byName(params: { name: string; signal?: AbortSignal }): Promise<any>;
    byCode(params: { code: string; signal?: AbortSignal }): Promise<any>;
    byRegion(params: { region: string; signal?: AbortSignal }): Promise<any>;
    all(params?: { signal?: AbortSignal }): Promise<any>;
  };
  translate: {
    text(params: { text: string; from?: string; to: string; signal?: AbortSignal }): Promise<TranslateResult>;
    many(params: { texts: string[]; from?: string; to: string; signal?: AbortSignal }): Promise<any>;
    detect(params: { text: string; signal?: AbortSignal }): Promise<any>;
  };
  movies: {
    search(params: { query: string; signal?: AbortSignal }): Promise<any>;
    details(params: { id: number; signal?: AbortSignal }): Promise<any>;
    trending(params?: { signal?: AbortSignal }): Promise<any>;
    tv(params: { query: string; signal?: AbortSignal }): Promise<any>;
  };
  food: {
    searchMeals(params: { name: string; signal?: AbortSignal }): Promise<any>;
    getRandomMeal(params?: { signal?: AbortSignal }): Promise<any>;
    random(params?: { signal?: AbortSignal }): Promise<any>;
    getMeal(params: { id: string; signal?: AbortSignal }): Promise<any>;
    byCategory(params: { category: string; signal?: AbortSignal }): Promise<any>;
    categories(params?: { signal?: AbortSignal }): Promise<any>;
    searchSpoonacular(params: { query: string; number?: number; signal?: AbortSignal }): Promise<any>;
    getSpoonacularRecipe(params: { id: number; signal?: AbortSignal }): Promise<any>;
    searchEdamam(params: { q: string; signal?: AbortSignal }): Promise<any>;
    analyzeEdamam(params: { title: string; ingr?: string[]; signal?: AbortSignal }): Promise<any>;
  };
  space: {
    apod(params?: { date?: string; signal?: AbortSignal }): Promise<any>;
    mars(params?: { rover?: string; signal?: AbortSignal }): Promise<any>;
    asteroids(params?: { signal?: AbortSignal }): Promise<any>;
    issPosition(params?: { signal?: AbortSignal }): Promise<ISSPositionResult>;
  };
  search: {
    instant(params: { q: string; signal?: AbortSignal }): Promise<any>;
    web(params: { q: string; signal?: AbortSignal }): Promise<any>;
  };
  stocks: {
    quote(params: { symbol: string; signal?: AbortSignal }): Promise<any>;
    search(params: { keywords: string; signal?: AbortSignal }): Promise<any>;
    overview(params: { symbol: string; signal?: AbortSignal }): Promise<any>;
  };
  music: {
    artist(params: { query: string; signal?: AbortSignal }): Promise<any>;
    album(params: { query: string; signal?: AbortSignal }): Promise<any>;
    itunes(params: { term: string; signal?: AbortSignal }): Promise<any>;
  };
  social: {
    githubUser(params: { username: string; signal?: AbortSignal }): Promise<any>;
    githubRepo(params: { owner: string; repo: string; signal?: AbortSignal }): Promise<any>;
    githubTrending(params?: { signal?: AbortSignal }): Promise<any>;
    hackerNews(params?: { limit?: number; signal?: AbortSignal }): Promise<any>;
    productHunt(params?: { signal?: AbortSignal }): Promise<any>;
  };
  ai: {
    chat(params: { messages: Array<{ role: string; content: string }>; model?: string; signal?: AbortSignal }): Promise<any>;
    smartChat(params: { messages: Array<{ role: string; content: string }>; signal?: AbortSignal }): Promise<any>;
    groqChat(params: { messages: Array<{ role: string; content: string }>; model?: string; signal?: AbortSignal }): Promise<any>;
    openaiChat(params: { messages: Array<{ role: string; content: string }>; model?: string; signal?: AbortSignal }): Promise<any>;
    groqStream(params: { messages: Array<{ role: string; content: string }>; model?: string; signal?: AbortSignal }): AsyncIterable<string>;
    openaiStream(params: { messages: Array<{ role: string; content: string }>; model?: string; signal?: AbortSignal }): AsyncIterable<string>;
    generateImage(params: { prompt: string; signal?: AbortSignal }): Promise<any>;
  };
  utils: {
    qr(params: { text: string; size?: number; format?: 'png' | 'svg' }): QRResult;
    uuid(): string;
    passwordStrength(params: { password: string }): PasswordStrengthResult;
    hash(params: { text: string; algorithm?: 'md5' | 'sha1' | 'sha256' | 'sha512' }): HashResult;
    base64Encode(params: { text: string }): Base64Result;
    base64Decode(params: { encoded: string }): Base64Result;
    loremIpsum(params?: { type?: 'words' | 'sentences' | 'paragraphs'; count?: number }): LoremIpsumResult;
    emojiSearch(params?: { query?: string; category?: string; limit?: number }): EmojiSearchResult;
    randomEmoji(params?: { category?: string }): Emoji;
    hexToRgb(params: { hex: string }): { r: number; g: number; b: number };
    rgbToHex(params: { r: number; g: number; b: number }): { hex: string };
    httpStatus(params: { code: number }): { code: number; message: string };
    shorten(params: { url: string; signal?: AbortSignal }): Promise<any>;
    time(params: { timezone: string; signal?: AbortSignal }): Promise<any>;
    timezones(params?: { signal?: AbortSignal }): Promise<string[]>;
    holidays(params: { country: string; year?: number; signal?: AbortSignal }): Promise<HolidaysResult>;
    quote(params?: { tag?: string; signal?: AbortSignal }): Promise<any>;
    quotes(params?: { limit?: number; tag?: string; signal?: AbortSignal }): Promise<any>;
    define(params: { word: string; language?: string; signal?: AbortSignal }): Promise<any>;
    trivia(params?: { amount?: number; category?: number; difficulty?: 'easy' | 'medium' | 'hard'; type?: 'multiple' | 'boolean'; signal?: AbortSignal }): Promise<any>;
    color(params: { hex: string; signal?: AbortSignal }): Promise<any>;
    randomNumber(params?: { min?: number; max?: number }): number;
    formatDate(params: { date: string | Date; format?: string }): string;
    validateJSON(params: { json: string }): { valid: boolean; error?: string };
    parseURL(params: { url: string }): Record<string, string>;
    slugify(params: { text: string }): string;
  };
  comics: {
    randomXKCD(params?: { signal?: AbortSignal }): Promise<XKCDResult>;
    getXKCD(params: { num: number; signal?: AbortSignal }): Promise<any>;
  };
  animals: {
    randomDog(params?: { signal?: AbortSignal }): Promise<any>;
    randomCat(params?: { signal?: AbortSignal }): Promise<any>;
    randomFox(params?: { signal?: AbortSignal }): Promise<any>;
    randomDuck(params?: { signal?: AbortSignal }): Promise<any>;
    randomPanda(params?: { signal?: AbortSignal }): Promise<any>;
    randomBird(params?: { signal?: AbortSignal }): Promise<any>;
  };
  // Extended namespaces (typed loosely — see provider source for full shapes)
  fandom: { search: (p: any) => Promise<any>; getPage: (p: any) => Promise<any>; recentActivity: (p: any) => Promise<any> };
  spotify: { searchTracks: (p: any) => Promise<any>; getArtist: (p: any) => Promise<any>; getArtistTopTracks: (p: any) => Promise<any> };
  stackexchange: { searchQuestions: (p: any) => Promise<any>; getQuestion: (p: any) => Promise<any>; getTopUsers: (p: any) => Promise<any> };
  steam: { getPlayerSummaries: (p: any) => Promise<any>; getOwnedGames: (p: any) => Promise<any>; searchApps: (p: any) => Promise<any> };
  books: { search: (p: any) => Promise<any>; getById: (p: any) => Promise<any>; random: (p?: any) => Promise<any> };
  lyrics: { search: (p: any) => Promise<any> };
  memes: { random: (p?: any) => Promise<any>; fromSubreddit: (p: any) => Promise<any> };
  math: { evaluate: (p: any) => Promise<any>; randomFact: (p?: any) => Promise<any> };
  zodiac: { horoscope: (p: any) => Promise<any> };
  jobs: { search: (p: any) => Promise<any> };
  science: { nasaApod: (p?: any) => Promise<any>; randomFact: (p?: any) => Promise<any> };
  basketball: { nbaTeams: (p?: any) => Promise<any>; nbaGames: (p?: any) => Promise<any>; nbaPlayer: (p: any) => Promise<any> };
  vehicles: { randomCar: (p?: any) => Promise<any> };
  pets: { random: (p?: any) => Promise<any> };
  drinks: { randomCocktail: (p?: any) => Promise<any>; searchCocktail: (p: any) => Promise<any>; searchIngredient: (p: any) => Promise<any> };
  geography: { countryInfo: (p: any) => Promise<any>; allCountries: (p?: any) => Promise<any>; capitalCity: (p: any) => Promise<any> };
  tv: { search: (p: any) => Promise<any>; details: (p: any) => Promise<any>; trending: (p?: any) => Promise<any> };
  baseball: { mlbTeams: (p?: any) => Promise<any>; mlbSchedule: (p?: any) => Promise<any> };
  hockey: { nhlTeams: (p?: any) => Promise<any>; nhlPlayer: (p: any) => Promise<any> };
  finance: { stockQuote: (p: any) => Promise<any>; cryptoPrice: (p: any) => Promise<any> };
  literature: { randomQuote: (p?: any) => Promise<any>; searchQuotes: (p: any) => Promise<any> };
  wildlife: { randomFact: (p?: any) => Promise<any> };
  politics: { presidents: (p?: any) => Promise<any> };
  language: { detect: (p: any) => Promise<any>; translate: (p: any) => Promise<any> };
  law: { search: (p: any) => Promise<any> };
  military: { time: (p: any) => Promise<any> };
  advice: { random: (p?: any) => Promise<any>; search: (p: any) => Promise<any> };
  dadjokes: { random: (p?: any) => Promise<any>; search: (p: any) => Promise<any> };
  kanye: { random: (p?: any) => Promise<any> };
  randomuser: { single: (p?: any) => Promise<any>; many: (p?: any) => Promise<any> };
  thesaurus: { synonyms: (p: any) => Promise<any>; antonyms: (p: any) => Promise<any>; rhymes: (p: any) => Promise<any>; suggest: (p: any) => Promise<any> };
  currencyHistory: any;
  markdown: any;
  techdb: any;
  websites: any;
  fakedb: any;
  religion: any;
  islamic: any;
  gaming: any;
  spaceExtended: any;
  pokemon: { get: (p: any) => Promise<any>; ability: (p: any) => Promise<any>; species: (p: any) => Promise<any> };
  rickmorty: any;
  starwars: any;
  harrypotter: any;
  covid: any;
  earthquake: any;
  airquality: any;
  astronomy: any;
  postal: any;
  predict: any;
  brewery: any;
  chucknorris: { random: (p?: any) => Promise<any>; search: (p: any) => Promise<any> };
  bored: { random: (p?: any) => Promise<any> };
  sportsdb: any;
  domain: any;
  placeholder: any;
  weatheralerts: any;
  coinWizard: any;
  medical: any;
  free: any;
  rss: any;
  realtime: any;
  smart: any;
  monitor: any;
  export: any;
  prayer: any;
  anime: any;
  fun: any;
  flights: any;
  art: any;
  dev: any;
  podcasts: any;
  enriched: any;
  combined: any;
  cache: {
    get(key: string): any;
    set(key: string, value: any, ttl?: number): void;
    del(key: string): void;
    flush(): void;
    keys(): string[];
    getWithMeta(key: string): { hit: boolean; value: any; ttl: number | null; ageSeconds: number | null };
    setAdapter(adapter: BemoraOptions['cacheAdapter']): void;
  };

  // ── Instance methods ───────────────────────────────────────────────────────

  batch(calls: Array<{ id: string; fn: () => Promise<any> }>): Promise<Record<string, any>>;

  /** Install a Bemora plugin (`bemora-plugin-*` naming convention). */
  use(plugin: { name: string; install(api: Bemora): void }): this;
  plugins(): string[];

  on(event: 'request' | 'response' | 'error' | string, fn: (data: any) => void): this;
  off(event: string, fn: (data: any) => void): this;

  /** Run a health check on all configured providers. */
  health(): Promise<Array<{ provider: string; status: 'online' | 'offline' | 'unauthorized' | 'degraded'; httpStatus?: number; responseTime?: string }>>;
  /** Run a health check on a single named provider. */
  healthOf(name: string): Promise<{ provider: string; status: string; httpStatus?: number; responseTime?: string }>;

  rateLimits(): Array<{ provider: string; used: number; limit: number; window: string; warning: boolean }>;
  rateLimit(provider: string): { provider: string; used: number; limit: number; window: string; warning: boolean };

  /** Generate an OpenAPI 3.0 specification describing every method on this instance. */
  toOpenAPI(opts?: { basePath?: string; title?: string; version?: string }): object;

  /** Dynamically load a `bemora-plugin-*` npm package. */
  loadPlugin(name: string): Promise<this>;

  /**
   * Watch a resource for changes (polling).
   * @returns watchId — pass to `unwatch()` to stop.
   */
  watch(
    resource: string,
    params: Record<string, any>,
    onData: (data: any) => void,
    opts?: { intervalMs?: number; onError?: (err: Error) => void }
  ): string;
  /** Stop a previously created watch. */
  unwatch(watchId: string): boolean;

  /** Hot-rotate an API key without restarting the process. */
  setKey(name: keyof BemoraKeys | string, value: string): this;

  /**
   * Create a scoped Bemora instance with per-tenant API keys.
   * Inherits the parent's options.
   */
  forTenant(tenantId: string, keys: BemoraKeys): Bemora;

  /** Get collected metrics for all providers (or a single named one). */
  getMetrics(): ProviderMetrics[];
  getMetrics(provider: string): ProviderMetrics | null;

  /** Get a Prometheus text-exposition string suitable for a /metrics endpoint. */
  metricsPrometheus(): string;

  /** Provider health registry (based on observed request outcomes). */
  providers: {
    status(): Array<{ provider: string; status: string; consecutiveFailures: number; totalRequests: number; totalFailures: number }>;
    statusOf(name: string): { provider: string; status: string };
    reset(name: string): void;
  };

  /** Circuit breaker management. */
  circuits: {
    /** State snapshot for every tracked provider. */
    status(): CircuitBreakerState[];
    /** State for a single provider. */
    statusOf(name: string): CircuitBreakerState;
    /** Reset (close) a provider's circuit. */
    reset(name: string): this;
    /** Reset all circuits. */
    resetAll(): this;
    /** Manually force a circuit OPEN. */
    open(name: string): this;
    /** Manually close a previously forced-open circuit. */
    close(name: string): this;
  };

  /** Request/response interceptors (Axios-style). */
  interceptors: {
    request: {
      use(fn: (config: { provider: string; args: any[] }) => any): number;
      eject(id: number): void;
    };
    response: {
      use(fn: (data: any) => any): number;
      eject(id: number): void;
    };
  };

  /** next()-style middleware chain (runs around every provider call). */
  middleware: {
    use(fn: (ctx: { provider: string; args: any[] }, next: () => Promise<any>) => Promise<any>): this;
    list(): number;
    clear(): void;
  };
}

export default Bemora;
