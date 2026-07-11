#!/usr/bin/env node
import 'dotenv/config';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { Bemora, CircuitBreakerError, TimeoutError } from '../index.js';
import { logger } from '../core/logger.js';
import PROVIDER_INFO from './provider-info.js';

const VERSION = '4.0.0';

const api = new Bemora({}, {
  logLevel: 'error',
  timeout: 20_000,          // 20 s global timeout for MCP tool calls
  timeouts: { anime: 45_000, jikan: 45_000 }, // known-slow providers get more time
});

// ── Key availability check ────────────────────────────────────────────────────
const checkProviderKey = (providerName) => {
  const info = PROVIDER_INFO[providerName];
  if (!info?.requiresKey) return { available: true };

  const keyPresent = info.keyName.split(/ and | or /).some(keyName =>
    process.env[keyName.trim()]
  );

  return {
    available: keyPresent,
    required: true,
    keyName: info.keyName,
    keyUrl: info.keyUrl,
  };
};

// ── Parameter schemas ─────────────────────────────────────────────────────────
const getParameterSchema = (providerName, methodName) => {
  const commonSchemas = {
    weather: {
      current:  { type: 'object', properties: { city: { type: 'string' }, units: { type: 'string' } }, required: [] },
      forecast: { type: 'object', properties: { city: { type: 'string' }, units: { type: 'string' } }, required: [] },
    },
    currency: {
      rates:   { type: 'object', properties: { base: { type: 'string' }, symbols: { type: 'array', items: { type: 'string' } } }, required: [] },
      convert: { type: 'object', properties: { from: { type: 'string' }, to: { type: 'string' }, amount: { type: 'number' } }, required: [] },
    },
    crypto: {
      price: { type: 'object', properties: { coins: { type: 'string' }, currency: { type: 'string' } }, required: [] },
      top:   { type: 'object', properties: { limit: { type: 'number' }, currency: { type: 'string' } }, required: [] },
    },
    translate: {
      text: { type: 'object', properties: { text: { type: 'string' }, from: { type: 'string' }, to: { type: 'string' } }, required: ['text', 'to'] },
    },
    countries: {
      byName:   { type: 'object', properties: { name: { type: 'string' } }, required: ['name'] },
      byCode:   { type: 'object', properties: { code: { type: 'string' } }, required: ['code'] },
      byRegion: { type: 'object', properties: { region: { type: 'string' } }, required: ['region'] },
    },
    location: {
      geocode: { type: 'object', properties: { address: { type: 'string' } }, required: ['address'] },
      reverse: { type: 'object', properties: { lat: { type: 'number' }, lon: { type: 'number' } }, required: ['lat', 'lon'] },
    },
    pokemon: {
      get:     { type: 'object', properties: { name: { type: 'string' } }, required: ['name'] },
      ability: { type: 'object', properties: { name: { type: 'string' } }, required: ['name'] },
      species: { type: 'object', properties: { name: { type: 'string' } }, required: ['name'] },
    },
    social: {
      githubUser:     { type: 'object', properties: { username: { type: 'string' } }, required: ['username'] },
      githubRepo:     { type: 'object', properties: { owner: { type: 'string' }, repo: { type: 'string' } }, required: ['owner', 'repo'] },
      githubTrending: { type: 'object', properties: {}, required: [] },
    },
    free: {
      weather: { type: 'object', properties: { lat: { type: 'number' }, lon: { type: 'number' }, city: { type: 'string' } }, required: [] },
      wttr:    { type: 'object', properties: { city: { type: 'string' }, format: { type: 'string' } }, required: [] },
    },
    smart: {
      weather:          { type: 'object', properties: { city: { type: 'string' }, units: { type: 'string' } }, required: ['city'] },
      news:             { type: 'object', properties: { topic: { type: 'string' }, limit: { type: 'number' } }, required: [] },
      currency:         { type: 'object', properties: { base: { type: 'string' }, symbols: { type: 'array', items: { type: 'string' } } }, required: [] },
      cryptoPrice:      { type: 'object', properties: { id: { type: 'string' }, symbol: { type: 'string' }, currency: { type: 'string' } }, required: ['id'] },
      ip:               { type: 'object', properties: { ip: { type: 'string' } }, required: [] },
      translate:        { type: 'object', properties: { text: { type: 'string' }, from: { type: 'string' }, to: { type: 'string' } }, required: ['text', 'to'] },
      holidays:         { type: 'object', properties: { country: { type: 'string' }, year: { type: 'number' } }, required: ['country'] },
      weatherAggregate: { type: 'object', properties: { city: { type: 'string' } }, required: ['city'] },
    },
    ip: {
      lookup: { type: 'object', properties: { ip: { type: 'string' } }, required: [] },
    },
    govspending: {
      searchAwards:   { type: 'object', properties: { keyword: { type: 'string' }, startDate: { type: 'string' }, endDate: { type: 'string' }, limit: { type: 'number' } }, required: [] },
      agencySpending: { type: 'object', properties: { fiscalYear: { type: 'number' } }, required: [] },
    },
    wikidata: {
      search:    { type: 'object', properties: { query: { type: 'string' }, language: { type: 'string' }, limit: { type: 'number' } }, required: ['query'] },
      getEntity: { type: 'object', properties: { id: { type: 'string' }, language: { type: 'string' } }, required: ['id'] },
    },
    arxiv: {
      search: { type: 'object', properties: { query: { type: 'string' }, maxResults: { type: 'number' } }, required: ['query'] },
    },
    biodiversity: {
      searchSpecies: { type: 'object', properties: { query: { type: 'string' }, limit: { type: 'number' } }, required: ['query'] },
      occurrences:   { type: 'object', properties: { species: { type: 'string' }, country: { type: 'string' }, limit: { type: 'number' } }, required: ['species'] },
    },
    research: {
      wikipedia: { type: 'object', properties: { query: { type: 'string' }, language: { type: 'string' }, limit: { type: 'number' } }, required: ['query'] },
      article:   { type: 'object', properties: { title: { type: 'string' }, language: { type: 'string' } }, required: ['title'] },
      books:     { type: 'object', properties: { query: { type: 'string' }, limit: { type: 'number' } }, required: ['query'] },
    },
    ai: {
      chat:       { type: 'object', properties: { messages: { type: 'array' }, model: { type: 'string' } }, required: ['messages'] },
      smartChat:  { type: 'object', properties: { messages: { type: 'array' } }, required: ['messages'] },
      groqChat:   { type: 'object', properties: { messages: { type: 'array' }, model: { type: 'string' } }, required: ['messages'] },
      openaiChat: { type: 'object', properties: { messages: { type: 'array' }, model: { type: 'string' } }, required: ['messages'] },
    },
    utils: {
      time:       { type: 'object', properties: { timezone: { type: 'string' } }, required: ['timezone'] },
      holidays:   { type: 'object', properties: { country: { type: 'string' }, year: { type: 'number' } }, required: ['country'] },
      define:     { type: 'object', properties: { word: { type: 'string' } }, required: ['word'] },
      shorten:    { type: 'object', properties: { url: { type: 'string' } }, required: ['url'] },
      trivia:     { type: 'object', properties: { amount: { type: 'number' }, difficulty: { type: 'string' } }, required: [] },
    },
    food: {
      searchMeals:   { type: 'object', properties: { name: { type: 'string' } }, required: ['name'] },
      getRandomMeal: { type: 'object', properties: {}, required: [] },
    },
  };

  return commonSchemas[providerName]?.[methodName] ?? {
    type: 'object',
    properties: {},
    required: [],
    additionalProperties: true,
  };
};

// ── Built-in observability tools ──────────────────────────────────────────────
const OBSERVABILITY_TOOLS = [
  {
    name: 'bemora_status',
    description: 'Get the health status of all bemora providers, including circuit breaker state (CLOSED/OPEN/HALF_OPEN), failure counts, and registry health.',
    inputSchema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'bemora_metrics',
    description: 'Get per-provider metrics: request counts, error rates, cache hit rates, and latency percentiles (p50/p95/p99).',
    inputSchema: { type: 'object', properties: { provider: { type: 'string', description: 'Optional: filter to a specific provider name.' } }, required: [] },
  },
  {
    name: 'bemora_rate_limits',
    description: 'Check rate limit usage for all tracked providers. Shows used/limit counts and whether any provider is near its limit.',
    inputSchema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'bemora_list_categories',
    description: 'List every provider category (e.g. weather, finance, research, government, science) with a count of providers in each. Call this first when you are not sure which provider covers what you need — with 100+ providers, browsing by category beats scanning the full tool list.',
    inputSchema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'bemora_providers_in_category',
    description: 'List every provider (with description and available methods) belonging to a given category. Use bemora_list_categories first to see valid category names.',
    inputSchema: {
      type: 'object',
      properties: { category: { type: 'string', description: 'Category name, e.g. "weather", "finance", "research", "government".' } },
      required: ['category'],
    },
  },
];

// ── Generate provider tools ───────────────────────────────────────────────────
const generateTools = () => {
  const tools = [...OBSERVABILITY_TOOLS];

  Object.keys(PROVIDER_INFO).forEach((providerName) => {
    const provider = PROVIDER_INFO[providerName];
    const keyCheck = checkProviderKey(providerName);

    Object.keys(provider.methods).forEach((methodName) => {
      const descParts = [provider.methods[methodName]];
      if (!keyCheck.available) {
        descParts.push(`[NEEDS KEY: ${keyCheck.keyName} — get one free at ${keyCheck.keyUrl}]`);
      }

      tools.push({
        name: `${providerName}_${methodName}`,
        description: descParts.join(' '),
        inputSchema: getParameterSchema(providerName, methodName),
      });
    });
  });

  return tools;
};

const allTools = generateTools();

// ── Response trimmer (saves AI context) ──────────────────────────────────────
const trimResponse = (data, depth = 0) => {
  if (depth > 3) return '[Truncated]';
  if (typeof data === 'string') return data.length > 2000 ? data.slice(0, 2000) + '…' : data;
  if (Array.isArray(data)) return data.slice(0, 10).map((item) => trimResponse(item, depth + 1));
  if (typeof data === 'object' && data !== null) {
    const trimmed = {};
    Object.keys(data).slice(0, 30).forEach((key) => { trimmed[key] = trimResponse(data[key], depth + 1); });
    return trimmed;
  }
  return data;
};

// ── Error → readable message ──────────────────────────────────────────────────
const formatError = (err, toolName) => {
  if (err instanceof CircuitBreakerError) {
    return `Circuit OPEN for this provider — it has failed repeatedly and is being protected. Try again in ~60 seconds, or check bemora_status for details.`;
  }
  if (err instanceof TimeoutError) {
    return `Provider timed out (${toolName}). The external API is taking too long. Try again later.`;
  }
  if (err?.code === 'CONFIGURATION_ERROR' || err?.message?.includes('Missing API key')) {
    return `API key required. ${err.message}`;
  }
  return err?.message ?? 'Unknown error';
};

// ── MCP Server setup ──────────────────────────────────────────────────────────
const server = new Server(
  { name: 'bemora', version: VERSION },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: allTools }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  // ── Observability tools ─────────────────────────────────────────────────────
  if (name === 'bemora_status') {
    const circuits  = api.circuits.status();
    const registry  = api.providers.status();
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          circuitBreakers: circuits,
          providerRegistry: registry,
          summary: {
            total: circuits.length,
            closed: circuits.filter((c) => c.state === 'CLOSED').length,
            open: circuits.filter((c) => c.state === 'OPEN').length,
            halfOpen: circuits.filter((c) => c.state === 'HALF_OPEN').length,
          },
        }, null, 2),
      }],
    };
  }

  if (name === 'bemora_metrics') {
    const result = args?.provider ? api.getMetrics(args.provider) : api.getMetrics();
    if (result === null) {
      return { content: [{ type: 'text', text: `No metrics recorded yet for provider "${args.provider}".` }] };
    }
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }

  if (name === 'bemora_rate_limits') {
    const limits = api.rateLimits();
    const warning = limits.filter((l) => l.warning);
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({ rateLimits: limits, warnings: warning, hasWarnings: warning.length > 0 }, null, 2),
      }],
    };
  }

  // ── Provider tools ──────────────────────────────────────────────────────────
  try {
    const parts = name.split('_');
    const methodName   = parts.pop();
    const providerName = parts.join('_');

    if (!providerName || !methodName || !api[providerName] || typeof api[providerName][methodName] !== 'function') {
      return { content: [{ type: 'text', text: `Unknown tool: ${name}` }], isError: true };
    }

    const keyCheck = checkProviderKey(providerName);
    if (!keyCheck.available) {
      return {
        content: [{
          type: 'text',
          text: `This tool requires an API key.\nKey name: ${keyCheck.keyName}\nGet one free at: ${keyCheck.keyUrl}\nAdd it to your .env file or MCP server env config.`,
        }],
        isError: true,
      };
    }

    const result = await api[providerName][methodName](args);
    return { content: [{ type: 'text', text: JSON.stringify(trimResponse(result), null, 2) }] };

  } catch (err) {
    const msg = formatError(err, name);
    logger.error(`MCP tool "${name}" failed: ${err.message}`, { provider: name });
    return { content: [{ type: 'text', text: `Error: ${msg}` }], isError: true };
  }
});

// ── Start ─────────────────────────────────────────────────────────────────────
const transport = new StdioServerTransport();
await server.connect(transport);
logger.info(`Bemora MCP server v${VERSION} running — ${allTools.length} tools available`);
