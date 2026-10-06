#!/usr/bin/env node
import 'dotenv/config';
import { createRequire } from 'node:module';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { Bemora, CircuitBreakerError, TimeoutError } from '../index.js';
import { logger } from '../core/logger.js';
import PROVIDER_INFO from './provider-info.js';
import { getParameterSchema } from './schemas.js';

const require = createRequire(import.meta.url);
// Single source of truth: MCP server version always matches package.json.
let VERSION = '0.0.0-dev';
try {
  VERSION = require('../../package.json').version ?? VERSION;
} catch {
  /* keep fallback */
}

const api = new Bemora(
  {},
  {
    logLevel: 'error',
    timeout: 20_000, // 20 s global timeout for MCP tool calls
    timeouts: { anime: 45_000, jikan: 45_000 }, // known-slow providers get more time
  }
);

// ── Key availability check ────────────────────────────────────────────────────
const checkProviderKey = (providerName) => {
  const info = PROVIDER_INFO[providerName];
  if (!info?.requiresKey) return { available: true };

  const keyPresent = info.keyName.split(/ and | or /).some((keyName) => process.env[keyName.trim()]);

  return {
    available: keyPresent,
    required: true,
    keyName: info.keyName,
    keyUrl: info.keyUrl,
  };
};

// ── Parameter schemas live in ./schemas.js (imported above; covered by unit tests) ──

// ── Built-in observability tools ──────────────────────────────────────────────
const OBSERVABILITY_TOOLS = [
  {
    name: 'bemora_status',
    description:
      'Get the health status of all bemora providers, including circuit breaker state (CLOSED/OPEN/HALF_OPEN), failure counts, and registry health.',
    inputSchema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'bemora_metrics',
    description:
      'Get per-provider metrics: request counts, error rates, cache hit rates, and latency percentiles (p50/p95/p99).',
    inputSchema: {
      type: 'object',
      properties: { provider: { type: 'string', description: 'Optional: filter to a specific provider name.' } },
      required: [],
    },
  },
  {
    name: 'bemora_rate_limits',
    description:
      'Check rate limit usage for all tracked providers. Shows used/limit counts and whether any provider is near its limit.',
    inputSchema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'bemora_list_categories',
    description:
      'List every provider category (e.g. weather, finance, research, government, science) with a count of providers in each. Call this first when you are not sure which provider covers what you need — with 100+ providers, browsing by category beats scanning the full tool list.',
    inputSchema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'bemora_providers_in_category',
    description:
      'List every provider (with description and available methods) belonging to a given category. Use bemora_list_categories first to see valid category names.',
    inputSchema: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          description: 'Category name, e.g. "weather", "finance", "research", "government".',
        },
      },
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
    Object.keys(data)
      .slice(0, 30)
      .forEach((key) => {
        trimmed[key] = trimResponse(data[key], depth + 1);
      });
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
const server = new Server({ name: 'bemora', version: VERSION }, { capabilities: { tools: {} } });

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: allTools }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  // ── Observability tools ─────────────────────────────────────────────────────
  if (name === 'bemora_status') {
    const circuits = api.circuits.status();
    const registry = api.providers.status();
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              circuitBreakers: circuits,
              providerRegistry: registry,
              summary: {
                total: circuits.length,
                closed: circuits.filter((c) => c.state === 'CLOSED').length,
                open: circuits.filter((c) => c.state === 'OPEN').length,
                halfOpen: circuits.filter((c) => c.state === 'HALF_OPEN').length,
              },
            },
            null,
            2
          ),
        },
      ],
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
      content: [
        {
          type: 'text',
          text: JSON.stringify({ rateLimits: limits, warnings: warning, hasWarnings: warning.length > 0 }, null, 2),
        },
      ],
    };
  }

  if (name === 'bemora_list_categories') {
    const counts = {};
    Object.values(PROVIDER_INFO).forEach((info) => {
      const cat = info.category || 'uncategorized';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    const categories = Object.keys(counts)
      .sort()
      .map((category) => ({ category, providerCount: counts[category] }));
    return {
      content: [{ type: 'text', text: JSON.stringify({ categories, totalCategories: categories.length }, null, 2) }],
    };
  }

  if (name === 'bemora_providers_in_category') {
    const category = args?.category;
    if (!category) {
      return { content: [{ type: 'text', text: 'Missing required argument: category' }], isError: true };
    }
    const providers = Object.entries(PROVIDER_INFO)
      .filter(([, info]) => info.category === category)
      .map(([name, info]) => ({
        provider: name,
        description: info.description,
        requiresKey: !!info.requiresKey,
        methods: Object.keys(info.methods),
      }));
    if (providers.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: `No providers found in category "${category}". Call bemora_list_categories to see valid categories.`,
          },
        ],
      };
    }
    return { content: [{ type: 'text', text: JSON.stringify({ category, providers }, null, 2) }] };
  }

  // ── Provider tools ──────────────────────────────────────────────────────────
  try {
    const parts = name.split('_');
    const methodName = parts.pop();
    const providerName = parts.join('_');

    if (!providerName || !methodName || !api[providerName] || typeof api[providerName][methodName] !== 'function') {
      return { content: [{ type: 'text', text: `Unknown tool: ${name}` }], isError: true };
    }

    const keyCheck = checkProviderKey(providerName);
    if (!keyCheck.available) {
      return {
        content: [
          {
            type: 'text',
            text: `This tool requires an API key.\nKey name: ${keyCheck.keyName}\nGet one free at: ${keyCheck.keyUrl}\nAdd it to your .env file or MCP server env config.`,
          },
        ],
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
