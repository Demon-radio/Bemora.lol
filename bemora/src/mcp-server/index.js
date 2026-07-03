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
  { name: 'bemora', version: '3.1.0' },
  { capabilities: { tools: {} } }
);

const allTools = [];

// Helper to guess input schema from provider method
function createInputSchema(providerName, methodName) {
  // Base schema
  const schema = {
    type: 'object',
    properties: {},
    required: [],
  };

  // Common params by provider/method
  const commonParams = {
    weather: {
      current: { city: 'string', units: { type: 'string', enum: ['metric', 'imperial'] } },
      forecast: { city: 'string', units: { type: 'string', enum: ['metric', 'imperial'] } },
    },
    currency: {
      rates: { base: 'string', symbols: { type: 'array', items: { type: 'string' } } },
      convert: { from: 'string', to: 'string', amount: 'number' },
    },
    crypto: {
      price: { coins: {}, currency: 'string' },
      trending: {},
      top: { currency: 'string', limit: 'number' },
    },
    research: {
      wikipedia: { query: 'string', language: 'string', limit: 'number' },
      article: { title: 'string', language: 'string' },
      books: { query: 'string', limit: 'number' },
    },
    islamic: {
      quranChapters: {},
      quranChapter: { number: 'number', edition: 'string' },
      randomVerse: {},
      azkar: { type: { type: 'string', enum: ['morning', 'evening'] } },
      prayerTimes: { city: 'string', country: 'string', method: 'number' },
    },
    memes: {
      random: {},
      fromSubreddit: { subreddit: 'string', limit: 'number' },
    },
    animals: {
      randomDog: {},
      randomCat: {},
      randomFox: {},
      randomDuck: {},
      randomPanda: {},
      randomBird: {},
    },
    gaming: {
      freeFirePlayer: { playerId: 'string' },
      pubgPlayer: { playerName: 'string', platform: 'string' },
      crossfireNews: {},
      freeFireNews: {},
      pubgPatchNotes: {},
    },
    spaceExtended: {
      apod: { date: 'string', apiKey: 'string' },
      marsPhotos: { rover: 'string', sol: 'number', apiKey: 'string' },
      nearEarthObjects: { startDate: 'string', endDate: 'string', apiKey: 'string' },
      issPosition: {},
    },
    // Add more specific schemas as needed!
  };

  if (commonParams[providerName] && commonParams[providerName][methodName]) {
    const params = commonParams[providerName][methodName];
    Object.keys(params).forEach(key => {
      const paramType = typeof params[key] === 'object' ? params[key] : { type: params[key] };
      schema.properties[key] = paramType;
      if (key !== 'units' && key !== 'language' && key !== 'limit' && key !== 'currency' && key !== 'edition' && key !== 'platform') {
        schema.required.push(key);
      }
    });
  } else {
    // Generic schema
    schema.properties = {
      query: { type: 'string' },
      limit: { type: 'number' },
    };
  }

  return schema;
}

// Auto-generate tools from all providers!
const providerNames = Object.keys(api).filter(key => 
  !['_keys', '_options', '_events', '_plugins', '_monitor', 'use', 'plugins', 'on', 'off', 'health', 'healthOf', 'rateLimits', 'rateLimit', '_require', '_wrap', 'free', 'smart', 'monitor', 'export', 'cache', 'batch'].includes(key)
);

providerNames.forEach(providerName => {
  const provider = api[providerName];
  if (provider && typeof provider === 'object') {
    const methodNames = Object.keys(provider);
    methodNames.forEach(methodName => {
      if (typeof provider[methodName] === 'function') {
        allTools.push({
          name: `${providerName}_${methodName}`,
          description: `${providerName} - ${methodName}`,
          inputSchema: createInputSchema(providerName, methodName),
        });
      }
    });
  }
});

// Add smart tools and free tools!
allTools.push(
  {
    name: 'smart_weather',
    description: 'Get smart weather with automatic fallback (no API key needed!)',
    inputSchema: { type: 'object', properties: { city: { type: 'string' }, units: { type: 'string', enum: ['metric', 'imperial'] } }, required: ['city'] },
  },
  {
    name: 'smart_news',
    description: 'Get smart news with fallback (RSS if API key missing)',
    inputSchema: { type: 'object', properties: { q: { type: 'string' }, limit: { type: 'number' } } },
  },
  {
    name: 'free_weather',
    description: 'Get weather from Open-Meteo (100% free, no key)',
    inputSchema: { type: 'object', properties: { lat: { type: 'number' }, lon: { type: 'number' }, city: { type: 'string' } } },
  },
  {
    name: 'rss_aggregate',
    description: 'Aggregate news from multiple RSS feeds',
    inputSchema: { type: 'object', properties: { sources: { type: 'array', items: { type: 'string' } }, limit: { type: 'number' } } },
  }
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
      if (args.city) {
        result = await api.free.wttr(args);
      } else {
        result = await api.free.weather(args);
      }
    } else if (name === 'rss_aggregate') {
      result = await api.rss.aggregate(args);
    } else {
      // Handle provider methods
      const [providerName, methodName] = name.split('_');
      if (providerName && methodName && api[providerName] && typeof api[providerName][methodName] === 'function') {
        result = await api[providerName][methodName](args);
      } else {
        return { content: [{ type: 'text', text: `Unknown tool: ${name}` }], isError: true };
      }
    }

    return {
      content: [
        { type: 'text', text: JSON.stringify(result, null, 2) }
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

const transport = new StdioServerTransport();
await server.connect(transport);
logger.info('Bemora MCP server running (v3.1.0) with 100+ tools!');
