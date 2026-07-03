
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
  flightsKey?: string;
}

export interface BemoraOptions {
  logLevel?: 'silent' | 'error' | 'warn' | 'info' | 'debug';
  retries?: number;
}

export interface WeatherResult {
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
  _cached: boolean;
}

export interface ForecastResult {
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
  _cached: boolean;
}

export interface CurrencyRatesResult {
  base: string;
  date: string;
  rates: Record<string, number>;
  _cached: boolean;
}

export interface ConvertResult {
  from: string;
  to: string;
  amount: number;
  rate: number;
  result: number;
  _cached: boolean;
}

export interface Article {
  title: string;
  description: string;
  url: string;
  image: string | null;
  source: string;
  publishedAt: string;
}

export interface NewsResult {
  total: number;
  articles: Article[];
  _cached: boolean;
}

export interface Photo {
  id: string;
  description: string | null;
  urls: { full: string; regular: string; small: string; thumb: string };
  author: string;
  author_link: string;
}

export interface ImagesResult {
  total: number;
  photos: Photo[];
  _cached: boolean;
}

export interface Fixture {
  id: number;
  date: string;
  status: string;
  league: string;
  home: string;
  away: string;
  score: string;
}

export interface FootballFixturesResult {
  fixtures: Fixture[];
  _cached: boolean;
}

export interface CryptoPriceResult {
  currency: string;
  prices: Array<{
    coin: string;
    price: number;
    market_cap: number;
    change_24h: number;
  }>;
  _cached: boolean;
}

export interface GoldPriceResult {
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
  _cached: boolean;
}

export interface WikipediaResult {
  query: string;
  language: string;
  results: Array<{
    title: string;
    snippet: string;
    url: string;
    wordcount: number;
    timestamp: string;
  }>;
  _cached: boolean;
}

export interface BooksResult {
  total: number;
  books: Array<{
    title: string;
    author: string;
    year: number;
    isbn: string | undefined;
    cover: string | null;
    url: string;
  }>;
  _cached: boolean;
}

// --- New Utility Interfaces ---

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

export interface HexToRgbResult {
  r: number;
  g: number;
  b: number;
}

export interface HttpStatusResult {
  code: number;
  message: string;
}

export declare class Bemora {
  constructor(keys?: BemoraKeys, options?: BemoraOptions);

  weather: {
    current(params: { city: string; units?: 'metric' | 'imperial' | 'standard' }): Promise<WeatherResult>;
    forecast(params: { city: string; units?: string }): Promise<ForecastResult>;
  };

  currency: {
    rates(params: { base?: string; symbols?: string[] }): Promise<CurrencyRatesResult>;
    convert(params: { from: string; to: string; amount: number }): Promise<ConvertResult>;
  };

  news: {
    headlines(params?: { country?: string; category?: string; q?: string; pageSize?: number }): Promise<NewsResult>;
    search(params: { q: string; language?: string; sortBy?: string; pageSize?: number }): Promise<NewsResult>;
  };

  images: {
    search(params: { query: string; perPage?: number; orientation?: string }): Promise<ImagesResult>;
    random(params?: { query?: string; orientation?: string }): Promise<Photo>;
    pexels(params: { query: string; perPage?: number }): Promise<ImagesResult>;
  };

  football: {
    fixtures(params?: { league?: number; date?: string }): Promise<FootballFixturesResult>;
    standings(params: { league: number; season: number }): Promise<any>;
    teams(params: { name: string }): Promise<any>;
  };

  crypto: {
    price(params: { coins: string | string[]; currency?: string }): Promise<CryptoPriceResult>;
    trending(): Promise<any>;
    top(params?: { currency?: string; limit?: number }): Promise<any>;
  };

  gold: {
    price(params?: { currency?: string }): Promise<GoldPriceResult>;
    silver(params?: { currency?: string }): Promise<any>;
  };

  research: {
    wikipedia(params: { query: string; language?: string; limit?: number }): Promise<WikipediaResult>;
    article(params: { title: string; language?: string }): Promise<any>;
    books(params: { query: string; limit?: number }): Promise<BooksResult>;
  };

  // --- New Utilities ---
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
    hexToRgb(params: { hex: string }): HexToRgbResult;
    rgbToHex(params: { r: number; g: number; b: number }): { hex: string };
    httpStatus(params: { code: number }): HttpStatusResult;
    shorten(params: { url: string }): Promise<any>;
    time(params: { timezone: string }): Promise<any>;
    timezones(): Promise<string[]>;
    holidays(params: { country: string; year?: number }): Promise<any>;
    quote(params?: { tag?: string }): Promise<any>;
    quotes(params?: { limit?: number; tag?: string }): Promise<any>;
    define(params: { word: string; language?: string }): Promise<any>;
    trivia(params?: { amount?: number; category?: number; difficulty?: 'easy' | 'medium' | 'hard'; type?: 'multiple' | 'boolean' }): Promise<any>;
    color(params: { hex: string }): Promise<any>;
  };
}

export default Bemora;
