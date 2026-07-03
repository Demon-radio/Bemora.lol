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

const server = new Server(
  { name: 'bemora', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

const tools = [
  {
    name: 'getWeather',
    description: 'Get current weather for a city',
    inputSchema: {
      type: 'object',
      properties: {
        city: { type: 'string', description: 'City name' },
        units: { type: 'string', enum: ['metric', 'imperial'], description: 'Temperature units' },
      },
      required: ['city'],
    },
  },
  {
    name: 'getWeatherForecast',
    description: 'Get 5-day weather forecast for a city',
    inputSchema: {
      type: 'object',
      properties: {
        city: { type: 'string' },
        units: { type: 'string', enum: ['metric', 'imperial'] },
      },
      required: ['city'],
    },
  },
  {
    name: 'convertCurrency',
    description: 'Convert amount between currencies',
    inputSchema: {
      type: 'object',
      properties: {
        from: { type: 'string', description: 'Source currency code (e.g. USD)' },
        to: { type: 'string', description: 'Target currency code (e.g. EGP)' },
        amount: { type: 'number', description: 'Amount to convert' },
      },
      required: ['from', 'to', 'amount'],
    },
  },
  {
    name: 'getExchangeRates',
    description: 'Get exchange rates for a base currency',
    inputSchema: {
      type: 'object',
      properties: {
        base: { type: 'string', description: 'Base currency (default: USD)' },
        symbols: { type: 'array', items: { type: 'string' }, description: 'Filter currencies' },
      },
    },
  },
  {
    name: 'getNews',
    description: 'Get top news headlines',
    inputSchema: {
      type: 'object',
      properties: {
        country: { type: 'string', description: 'Country code (e.g. us, eg, gb)' },
        category: { type: 'string', enum: ['business','entertainment','health','science','sports','technology'] },
        q: { type: 'string', description: 'Search query' },
        pageSize: { type: 'number' },
      },
    },
  },
  {
    name: 'searchNews',
    description: 'Search news articles by keyword',
    inputSchema: {
      type: 'object',
      properties: {
        q: { type: 'string', description: 'Search query' },
        language: { type: 'string' },
        pageSize: { type: 'number' },
      },
      required: ['q'],
    },
  },
  {
    name: 'searchImages',
    description: 'Search photos on Unsplash',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string' },
        perPage: { type: 'number' },
        orientation: { type: 'string', enum: ['landscape','portrait','squarish'] },
      },
      required: ['query'],
    },
  },
  {
    name: 'searchPexels',
    description: 'Search photos on Pexels',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string' },
        perPage: { type: 'number' },
      },
      required: ['query'],
    },
  },
  {
    name: 'getFootballFixtures',
    description: 'Get live or scheduled football fixtures',
    inputSchema: {
      type: 'object',
      properties: {
        league: { type: 'number', description: 'League ID' },
        date: { type: 'string', description: 'Date (YYYY-MM-DD)' },
      },
    },
  },
  {
    name: 'getFootballStandings',
    description: 'Get league standings',
    inputSchema: {
      type: 'object',
      properties: {
        league: { type: 'number' },
        season: { type: 'number', description: 'Season year (e.g. 2024)' },
      },
      required: ['league', 'season'],
    },
  },
  {
    name: 'getCryptoPrice',
    description: 'Get cryptocurrency price(s)',
    inputSchema: {
      type: 'object',
      properties: {
        coins: { description: 'Coin id or array of ids (e.g. bitcoin, ethereum)' },
        currency: { type: 'string', description: 'Target currency (default: usd)' },
      },
      required: ['coins'],
    },
  },
  {
    name: 'getTrendingCrypto',
    description: 'Get trending cryptocurrencies',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'getTopCrypto',
    description: 'Get top coins by market cap',
    inputSchema: {
      type: 'object',
      properties: {
        currency: { type: 'string' },
        limit: { type: 'number' },
      },
    },
  },
  {
    name: 'getGoldPrice',
    description: 'Get current gold price',
    inputSchema: {
      type: 'object',
      properties: {
        currency: { type: 'string', description: 'Currency code (default: USD)' },
      },
    },
  },
  {
    name: 'searchWikipedia',
    description: 'Search Wikipedia articles',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string' },
        language: { type: 'string', description: 'Language code (default: en)' },
        limit: { type: 'number' },
      },
      required: ['query'],
    },
  },
  {
    name: 'getWikipediaArticle',
    description: 'Get Wikipedia article summary',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        language: { type: 'string' },
      },
      required: ['title'],
    },
  },
  {
    name: 'searchBooks',
    description: 'Search books via Open Library',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string' },
        limit: { type: 'number' },
      },
      required: ['query'],
    },
  },
];

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result;
    switch (name) {
      case 'getWeather':             result = await api.weather.current(args); break;
      case 'getWeatherForecast':     result = await api.weather.forecast(args); break;
      case 'convertCurrency':        result = await api.currency.convert(args); break;
      case 'getExchangeRates':       result = await api.currency.rates(args); break;
      case 'getNews':                result = await api.news.headlines(args); break;
      case 'searchNews':             result = await api.news.search(args); break;
      case 'searchImages':           result = await api.images.search(args); break;
      case 'searchPexels':           result = await api.images.pexels(args); break;
      case 'getFootballFixtures':    result = await api.football.fixtures(args); break;
      case 'getFootballStandings':   result = await api.football.standings(args); break;
      case 'getCryptoPrice':         result = await api.crypto.price(args); break;
      case 'getTrendingCrypto':      result = await api.crypto.trending(); break;
      case 'getTopCrypto':           result = await api.crypto.top(args); break;
      case 'getGoldPrice':           result = await api.gold.price(args); break;
      case 'searchWikipedia':        result = await api.research.wikipedia(args); break;
      case 'getWikipediaArticle':    result = await api.research.article(args); break;
      case 'searchBooks':            result = await api.research.books(args); break;
      default:
        return { content: [{ type: 'text', text: `Unknown tool: ${name}` }], isError: true };
    }
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  } catch (err) {
    logger.error(`MCP tool "${name}" failed: ${err.message}`);
    return { content: [{ type: 'text', text: `Error: ${err.message}` }], isError: true };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
logger.info('Bemora MCP server running');
