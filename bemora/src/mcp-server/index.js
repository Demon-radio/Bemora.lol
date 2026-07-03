
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
import PROVIDER_INFO from './provider-info.js';

const api = new Bemora({}, { logLevel: 'error' });

// Helper to check if provider needs a key and it's present
const checkProviderKey = (providerName) => {
  const info = PROVIDER_INFO[providerName];
  if (!info?.requiresKey) return { available: true };

  const keyPresent = info.keyName.split(/ and | or /).some(keyName => process.env[keyName.trim()]);

  return {
    available: keyPresent,
    required: true,
    keyName: info.keyName,
    keyUrl: info.keyUrl
  };
};

// Helper to get parameter schema for methods (default is flexible)
const getParameterSchema = (providerName, methodName) => {
  // Common patterns for common methods
  const commonSchemas = {
    weather: {
      current: { type: 'object', properties: { city: { type: 'string' }, units: { type: 'string' } }, required: [] },
      forecast: { type: 'object', properties: { city: { type: 'string' }, units: { type: 'string' } }, required: [] }
    },
    currency: {
      rates: { type: 'object', properties: { base: { type: 'string' }, symbols: { type: 'array', items: { type: 'string' } } }, required: [] },
      convert: { type: 'object', properties: { from: { type: 'string' }, to: { type: 'string' }, amount: { type: 'number' } }, required: [] }
    },
    crypto: {
      price: { type: 'object', properties: { coins: { type: ['string', 'array'] } }, required: [] },
      top: { type: 'object', properties: { limit: { type: 'number' } }, required: [] }
    },
    pokemon: {
      get: { type: 'object', properties: { name: { type: 'string' } }, required: ['name'] },
      ability: { type: 'object', properties: { name: { type: 'string' } }, required: ['name'] },
      species: { type: 'object', properties: { name: { type: 'string' } }, required: ['name'] }
    },
    translate: {
      text: { type: 'object', properties: { text: { type: 'string' }, from: { type: 'string' }, to: { type: 'string' } }, required: ['text'] }
    },
    countries: {
      byName: { type: 'object', properties: { name: { type: 'string' } }, required: ['name'] },
      byCode: { type: 'object', properties: { code: { type: 'string' } }, required: ['code'] },
      byRegion: { type: 'object', properties: { region: { type: 'string' } }, required: ['region'] }
    },
    location: {
      geocode: { type: 'object', properties: { address: { type: 'string' } }, required: ['address'] },
      reverse: { type: 'object', properties: { lat: { type: 'number' }, lon: { type: 'number' } }, required: [] }
    },
    free: {
      weather: { type: 'object', properties: { lat: { type: 'number' }, lon: { type: 'number' }, city: { type: 'string' } }, required: [] },
      wttr: { type: 'object', properties: { city: { type: 'string' }, format: { type: 'string' } }, required: [] }
    },
    smart: {
      weather: { type: 'object', properties: { city: { type: 'string' }, units: { type: 'string' } }, required: ['city'] },
      news: { type: 'object', properties: { topic: { type: 'string' }, limit: { type: 'number' } }, required: [] }
    }
  };

  if (commonSchemas[providerName] && commonSchemas[providerName][methodName]) {
    return commonSchemas[providerName][methodName];
  }

  // Default schema: accepts any object properties
  return {
    type: 'object',
    properties: {},
    required: [],
    additionalProperties: true
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
        inputSchema: getParameterSchema(providerName, methodName)
      });
    });
  });

  return tools;
};

const allTools = generateTools();

// Helper to trim large responses
const trimResponse = (data, depth = 0) => {
  if (depth > 3) return '[Truncated]';
  if (typeof data === 'string') return data;

  if (Array.isArray(data)) {
    // Limit arrays to max 10 items
    return data.slice(0, 10).map(item => trimResponse(item, depth + 1));
  }

  if (typeof data === 'object' && data !== null) {
    const trimmed = {};
    Object.keys(data).slice(0, 30).forEach(key => {
      trimmed[key] = trimResponse(data[key], depth + 1);
    });
    return trimmed;
  }

  return data;
};

const server = new Server(
  { name: 'bemora', version: '3.4.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: allTools };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result;

    // Handle tool name (provider_method)
    const parts = name.split('_');
    const methodName = parts.pop();
    const providerName = parts.join('_');

    if (!providerName || !methodName || !api[providerName] || typeof api[providerName][methodName] !== 'function') {
      return { content: [{ type: 'text', text: `Unknown tool: ${name}` }], isError: true };
    }

    // Check if provider needs a key
    const keyCheck = checkProviderKey(providerName);
    if (!keyCheck.available) {
      return {
        content: [{
          type: 'text',
          text: `This tool requires an API key: ${keyCheck.keyName}.\nGet one for free at ${keyCheck.keyUrl}\nAdd it to your .env file.`
        }],
        isError: true
      };
    }

    result = await api[providerName][methodName](args);

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
logger.info('📦 Version: 3.4.0');
logger.info(`🔧 ${allTools.length} tools available!`);
