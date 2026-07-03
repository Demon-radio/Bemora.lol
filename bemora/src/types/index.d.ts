export interface BemoraKeys {
  weatherKey?: string;
  currencyKey?: string;
  newsKey?: string;
  unsplashKey?: string;
  pexelsKey?: string;
  footballKey?: string;
  goldKey?: string;
}

export interface BemoraOptions {
  logLevel?: 'silent' | 'error' | 'warn' | 'info' | 'debug';
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
    headlines(params: { country?: string; category?: string; q?: string; pageSize?: number }): Promise<NewsResult>;
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
}

export default Bemora;
