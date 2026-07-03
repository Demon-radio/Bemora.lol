#!/usr/bin/env node
import 'dotenv/config';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { Bemora } from '../index.js';
import { logger } from '../core/logger.js';

const api = new Bemora({}, { logLevel: 'error' });

const PROVIDER_INFO = {
  weather: {
    description: "Weather data (current conditions and forecasts) for cities worldwide",
    requiresKey: true,
    keyName: "BEMORA_WEATHER_KEY",
    keyUrl: "https://openweathermap.org/api",
    methods: {
      current: "Get current weather conditions (temperature, humidity, wind speed, etc.) for a city",
      forecast: "Get 5-day weather forecast for a city"
    }
  },
  currency: {
    description: "Currency exchange rates and conversions",
    requiresKey: true,
    keyName: "BEMORA_CURRENCY_KEY",
    keyUrl: "https://www.exchangerate-api.com",
    methods: {
      rates: "Get current exchange rates for a base currency",
      convert: "Convert an amount from one currency to another"
    }
  },
  news: {
    description: "Top news headlines and article search",
    requiresKey: true,
    keyName: "BEMORA_NEWS_KEY",
    keyUrl: "https://newsapi.org/register",
    methods: {
      headlines: "Get top news headlines by country/category",
      search: "Search news articles by keyword"
    }
  },
  images: {
    description: "High-quality photos from Unsplash and Pexels",
    requiresKey: true,
    keyName: "BEMORA_UNSPLASH_KEY or BEMORA_PEXELS_KEY",
    keyUrl: "https://unsplash.com/developers",
    methods: {
      search: "Search Unsplash photos",
      random: "Get a random Unsplash photo",
      pexels: "Search Pexels photos"
    }
  },
  football: {
    description: "Live football (soccer) fixtures, standings, and team info",
    requiresKey: true,
    keyName: "BEMORA_FOOTBALL_KEY",
    keyUrl: "https://dashboard.api-football.com/register",
    methods: {
      fixtures: "Get football fixtures by date/league",
      standings: "Get league standings",
      teams: "Search for football teams"
    }
  },
  crypto: {
    description: "Cryptocurrency prices, trending coins, and market data",
    requiresKey: false,
    methods: {
      price: "Get current price for one or more coins",
      trending: "Get currently trending cryptocurrencies",
      top: "Get top coins by market cap"
    }
  },
  gold: {
    description: "Gold and silver prices",
    requiresKey: true,
    keyName: "BEMORA_GOLD_KEY",
    keyUrl: "https://goldapi.io",
    methods: {
      price: "Get current gold price per ounce/gram in a currency",
      silver: "Get current silver price per ounce/gram in a currency"
    }
  },
  research: {
    description: "Wikipedia articles and book search",
    requiresKey: false,
    methods: {
      wikipedia: "Search Wikipedia articles",
      article: "Get a Wikipedia article summary",
      books: "Search for books on Open Library"
    }
  },
  location: {
    description: "Geocoding, reverse geocoding, and distance calculations",
    requiresKey: false,
    methods: {
      geocode: "Convert an address to coordinates",
      reverse: "Convert coordinates to an address",
      distance: "Calculate distance between two points"
    }
  },
  ip: {
    description: "IP address lookup with location and ISP data",
    requiresKey: false,
    methods: {
      lookup: "Look up an IP address or your current IP",
      batchLookup: "Look up multiple IP addresses at once"
    }
  },
  countries: {
    description: "Comprehensive country information (flags, currencies, languages, etc.)",
    requiresKey: false,
    methods: {
      byName: "Find country by name",
      byCode: "Find country by ISO code",
      byRegion: "Find all countries in a region",
      all: "Get all countries"
    }
  },
  translate: {
    description: "Text translation and language detection",
    requiresKey: false,
    methods: {
      text: "Translate text from one language to another",
      many: "Translate text to multiple languages at once",
      detect: "Detect the language of a text"
    }
  },
  movies: {
    description: "Movie and TV show data from TMDB",
    requiresKey: true,
    keyName: "BEMORA_MOVIES_KEY",
    keyUrl: "https://www.themoviedb.org/settings/api",
    methods: {
      search: "Search movies",
      details: "Get detailed information about a movie",
      trending: "Get trending movies/TV",
      tv: "Search TV shows"
    }
  },
  food: {
    description: "Recipes, ingredients, and cooking instructions",
    requiresKey: false,
    methods: {
      searchMeals: "Search meals by name",
      randomMeal: "Get a random meal recipe",
      byCategory: "Find meals by category",
      categories: "List all meal categories"
    }
  },
  space: {
    description: "NASA data, ISS position, Mars photos, and more",
    requiresKey: true,
    keyName: "BEMORA_NASA_KEY",
    keyUrl: "https://api.nasa.gov",
    methods: {
      apod: "Get NASA's Astronomy Picture of the Day",
      mars: "Get photos from Mars rovers",
      asteroids: "Get near-Earth asteroid data",
      issPosition: "Get current ISS position (no key needed)"
    }
  },
  search: {
    description: "Web search and instant answers",
    requiresKey: false,
    methods: {
      instant: "Get DuckDuckGo instant answers",
      web: "Full-text Wikipedia search"
    }
  },
  stocks: {
    description: "Stock market quotes, searches, and company info",
    requiresKey: true,
    keyName: "BEMORA_STOCKS_KEY",
    keyUrl: "https://www.alphavantage.co/support/#api-key",
    methods: {
      quote: "Get current stock quote",
      search: "Search for stocks by keyword",
      overview: "Get detailed company overview"
    }
  },
  music: {
    description: "Music artists, albums, and songs from MusicBrainz and iTunes",
    requiresKey: false,
    methods: {
      artist: "Search for music artists",
      album: "Search for music albums",
      itunes: "Search for music on iTunes Store"
    }
  },
  social: {
    description: "GitHub profiles, repos, trending, Hacker News, Product Hunt",
    requiresKey: false,
    methods: {
      githubUser: "Get GitHub user profile",
      githubRepo: "Get GitHub repo info",
      githubTrending: "Get trending GitHub repos",
      hackerNews: "Get top Hacker News stories",
      productHunt: "Get Product Hunt top products"
    }
  },
  ai: {
    description: "AI chat and image generation with Groq, OpenAI, and more",
    requiresKey: true,
    keyName: "BEMORA_GROQ_KEY or BEMORA_OPENAI_KEY",
    keyUrl: "https://console.groq.com",
    methods: {
      groq: "Fast AI chat with Groq (free tier available)",
      openai: "AI chat with OpenAI GPT models",
      smartChat: "Smart AI router (tries Groq first)",
      imagine: "Generate images with DALL-E 3",
      embed: "Create text embeddings"
    }
  },
  utils: {
    description: "Useful utilities (QR codes, UUIDs, base64, QR, and more)",
    requiresKey: false,
    methods: {
      qr: "Generate a QR code",
      uuid: "Generate a random UUID",
      passwordStrength: "Check password strength",
      hash: "Generate a hash of text",
      base64Encode: "Encode text to base64",
      base64Decode: "Decode base64 text",
      loremIpsum: "Generate dummy text",
      emojiSearch: "Search for emojis",
      randomEmoji: "Get a random emoji",
      hexToRgb: "Convert HEX color to RGB",
      rgbToHex: "Convert RGB color to HEX",
      shorten: "Shorten a URL",
      time: "Get current time in a timezone",
      timezones: "List all timezones",
      holidays: "Get public holidays for a country",
      quote: "Get a random quote",
      define: "Define a word",
      trivia: "Get trivia questions",
      color: "Get color information from HEX"
    }
  },
  islamic: {
    description: "Quran, Azkar (remembrances), and prayer times",
    requiresKey: false,
    methods: {
      quranChapters: "Get list of all Quran chapters (surahs)",
      quranChapter: "Get a specific Quran chapter with verses",
      randomVerse: "Get a random verse from the Quran",
      azkar: "Get morning/evening Azkar",
      prayerTimes: "Get daily prayer times for a city"
    }
  },
  memes: {
    description: "Random memes and meme search",
    requiresKey: false,
    methods: {
      random: "Get a random meme",
      fromSubreddit: "Get memes from a specific subreddit"
    }
  },
  animals: {
    description: "Random animal photos and facts",
    requiresKey: false,
    methods: {
      randomDog: "Get a random dog photo",
      randomCat: "Get a random cat photo",
      randomFox: "Get a random fox photo",
      randomDuck: "Get a random duck photo",
      randomPanda: "Get a random panda photo + fact",
      randomBird: "Get a random bird photo + fact"
    }
  },
  spaceExtended: {
    description: "Extended space data from NASA and ISS",
    requiresKey: false,
    methods: {
      apod: "Get NASA's Astronomy Picture of the Day",
      marsPhotos: "Get photos from Mars rovers",
      nearEarthObjects: "Get near-Earth asteroid data",
      issPosition: "Get current ISS position"
    }
  },
  gaming: {
    description: "Gaming content (PUBG, Free Fire, Crossfire news/info)",
    requiresKey: false,
    methods: {
      freeFirePlayer: "Free Fire player stats",
      pubgPlayer: "PUBG player stats",
      crossfireNews: "Crossfire news",
      freeFireNews: "Free Fire news",
      pubgPatchNotes: "PUBG patch notes"
    }
  },
  // Add more providers here as needed!
};

// Helper to check if provider needs a key and it's present
const checkProviderKey = (providerName) => {
  const info = PROVIDER_INFO[providerName];
  if (!info?.requiresKey) return { available: true };
  
  const keyPresent = info.keyName.split(' or ').some(keyName => process.env[keyName]);
  
  return {
    available: keyPresent,
    required: true,
    keyName: info.keyName,
    keyUrl: info.keyUrl
  };
};

// Generate tools from provider info
const generateTools = () => {
  const tools = [];
  
  // Add all provider methods
  Object.keys(PROVIDER_INFO).forEach(providerName => {
    const provider = PROVIDER_INFO[providerName];
    const keyCheck = checkProviderKey(providerName);
    
    Object.keys(provider.methods).forEach(methodName => {
      const descriptionParts = [provider.methods[methodName]];
      if (!keyCheck.available) {
        descriptionParts.push(`[NEEDS KEY: ${keyCheck.keyName} - Get one at ${keyCheck.keyUrl}]`);
      }
      
      tools.push({
        name: `${providerName}_${methodName}`,
        description: descriptionParts.join(' '),
        inputSchema: {
          type: "object",
          properties: {},
          required: []
        }
      });
    });
  });
  
  // Add smart tools
  tools.push({
    name: "smart_weather",
    description: "Get weather with automatic fallback (works without API key!)",
    inputSchema: { type: "object", properties: { city: { type: "string", description: "City name" }, units: { type: "string", enum: ["metric", "imperial"] } }, required: ["city"] }
  });
  
  tools.push({
    name: "smart_news",
    description: "Get news with fallback to RSS feeds if API key is missing",
    inputSchema: { type: "object", properties: { topic: { type: "string" }, limit: { type: "number" } } }
  });
  
  tools.push({
    name: "free_weather",
    description: "Get weather from Open-Meteo (100% free, no key needed)",
    inputSchema: { type: "object", properties: { lat: { type: "number" }, lon: { type: "number" }, city: { type: "string" } } }
  });
  
  tools.push({
    name: "rss_aggregate",
    description: "Aggregate news from multiple RSS sources",
    inputSchema: { type: "object", properties: { sources: { type: "array", items: { type: "string" } }, limit: { type: "number" } } }
  });
  
  return tools;
};

const allTools = generateTools();

// Helper to trim large responses
const trimResponse = (data) => {
  if (typeof data === 'string') return data;
  
  if (Array.isArray(data)) {
    // Limit arrays to max 5 items
    return data.slice(0, 5).map(item => trimResponse(item));
  }
  
  if (typeof data === 'object' && data !== null) {
    const trimmed = {};
    Object.keys(data).slice(0, 20).forEach(key => {
      trimmed[key] = trimResponse(data[key]);
    });
    return trimmed;
  }
  
  return data;
};

const server = new Server(
  { name: 'bemora', version: '3.2.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: allTools };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result;
    
    // Handle smart/free tools
    if (name === 'smart_weather') {
      result = await api.smart.weather(args);
    } else if (name === 'smart_news') {
      result = await api.smart.news(args);
    } else if (name === 'free_weather') {
      if (args.city) result = await api.free.wttr(args);
      else result = await api.free.weather(args);
    } else if (name === 'rss_aggregate') {
      result = await api.rss.aggregate(args);
    } else {
      // Handle provider methods
      const [providerName, methodName] = name.split('_');
      if (!providerName || !methodName || !api[providerName] || typeof api[providerName][methodName] !== 'function') {
        return { content: [{ type: 'text', text: `Unknown tool: ${name}` }], isError: true };
      }
      
      // Check if provider needs a key
      const keyCheck = checkProviderKey(providerName);
      if (!keyCheck.available) {
        return { 
          content: [{ 
            type: 'text', 
            text: `This tool requires an API key: ${keyCheck.keyName}.\nGet one for free at ${keyCheck.keyUrl}\nAdd it to your .env file as ${keyCheck.keyName} or pass in the constructor.` 
          }], 
          isError: true 
        };
      }
      
      result = await api[providerName][methodName](args);
    }

    // Trim response to save context
    const trimmedResult = trimResponse(result);

    return {
      content: [
        { type: 'text', text: JSON.stringify(trimmedResult, null, 2) }
      ]
    };
  } catch (err) {
    logger.error(`MCP tool "${name}" failed: ${err.message}`);
    return {
      content: [{ type: 'text', text: `Error: ${err.message}` }],
      isError: true
    };
  }
});

// Start server
const transport = new StdioServerTransport();
await server.connect(transport);
logger.info('✨ Bemora MCP server running!');
logger.info('📦 Version: 3.2.0');
logger.info(`🔧 ${allTools.length} tools available!`);
