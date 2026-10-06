/**
 * MCP catalog integrity: src/mcp-server/provider-info.js vs the Bemora class.
 *
 * NOTE: src/mcp-server/index.js is intentionally NOT imported here — it
 * connects to stdio on load. These tests cover the catalog data, which is
 * what generates every `bemora_<provider>_<method>` tool.
 */
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Bemora from '../../src/index.js';
import PROVIDER_INFO from '../../src/mcp-server/provider-info.js';
import SCHEMAS, { getParameterSchema } from '../../src/mcp-server/schemas.js';

const root = path.dirname(path.dirname(path.dirname(fileURLToPath(import.meta.url))));

// Enterprise namespaces deliberately NOT exposed as MCP tools: they move
// money, send messages, mint credentials, or touch production infra, and AI
// tool access needs authorization guardrails first (see ROADMAP.md).
const INTENTIONALLY_UNEXPOSED = [
  'payments',
  'email',
  'sms',
  'auth',
  'jwt',
  'storage',
  'vectordb',
  'sentry',
  'notifications',
  'maps',
  'searchEnt',
  'calendar',
  'captcha',
  'security',
  'cloudflare',
];

describe('MCP catalog', () => {
  const api = new Bemora({}, { logLevel: 'silent' });

  it('every catalog entry has a backing namespace on the Bemora class (no stale names)', () => {
    const stale = Object.keys(PROVIDER_INFO).filter((k) => !(k in api));
    expect(stale).toEqual([]);
  });

  it('every cataloged method resolves to a real function', () => {
    const missing = [];
    for (const [provider, info] of Object.entries(PROVIDER_INFO)) {
      for (const method of Object.keys(info.methods)) {
        if (typeof api[provider]?.[method] !== 'function') missing.push(`${provider}.${method}`);
      }
    }
    expect(missing).toEqual([]);
  });

  it('enterprise-sensitive namespaces stay out of the catalog', () => {
    for (const ns of INTENTIONALLY_UNEXPOSED) {
      expect(PROVIDER_INFO[ns]).toBeUndefined();
      expect(api[ns]).toBeDefined(); // they exist — just not AI-callable
    }
  });

  it('generated tool names are MCP-safe (<provider>_<method>, [a-z0-9_])', () => {
    const bad = [];
    for (const [provider, info] of Object.entries(PROVIDER_INFO)) {
      for (const method of Object.keys(info.methods)) {
        const tool = `${provider}_${method}`;
        if (!/^[a-zA-Z0-9_]+$/.test(tool)) bad.push(tool);
      }
    }
    expect(bad).toEqual([]);
  });

  it('keyed providers declare keyName and keyUrl', () => {
    const bad = Object.entries(PROVIDER_INFO)
      .filter(([, info]) => info.requiresKey && (!info.keyName || !info.keyUrl))
      .map(([k]) => k);
    expect(bad).toEqual([]);
  });

  it('provider-info.js has no duplicate top-level keys (JS would silently shadow)', () => {
    const src = fs.readFileSync(path.join(root, 'src', 'mcp-server', 'provider-info.js'), 'utf8');
    const keys = [...src.matchAll(/^  "([^"]+)": \{$/gm)].map((m) => m[1]);
    const dupes = keys.filter((k, i) => keys.indexOf(k) !== i);
    expect(dupes).toEqual([]);
    expect(keys.length).toBe(Object.keys(PROVIDER_INFO).length);
  });
});

describe('MCP input schemas', () => {
  const api = new Bemora({}, { logLevel: 'silent' });

  // Methods that intentionally keep the generic fallback: websocket stream
  // constructors (not JSON-call friendly) and synchronous static lookups.
  const GENERIC_OK = new Set(['rss.sources', 'realtime.binance', 'realtime.kraken', 'prayer.methods']);

  it('every schema entry resolves to a real cataloged method (no dead schemas)', () => {
    const dead = [];
    for (const [provider, methods] of Object.entries(SCHEMAS)) {
      for (const method of Object.keys(methods)) {
        if (!PROVIDER_INFO[provider]?.methods[method]) dead.push(`${provider}.${method}`);
        if (typeof api[provider]?.[method] !== 'function') dead.push(`${provider}.${method} (no impl)`);
      }
    }
    expect(dead).toEqual([]);
  });

  it('every cataloged method has a specific schema except known stream/static exceptions', () => {
    const missing = [];
    for (const [provider, info] of Object.entries(PROVIDER_INFO)) {
      for (const method of Object.keys(info.methods)) {
        if (!SCHEMAS[provider]?.[method] && !GENERIC_OK.has(`${provider}.${method}`)) {
          missing.push(`${provider}.${method}`);
        }
      }
    }
    expect(missing).toEqual([]);
  });

  it('schemas are valid draft-style JSON Schemas with matching required arrays', () => {
    const bad = [];
    const check = (prefix, s) => {
      if (s.type !== 'object' || typeof s.properties !== 'object' || !Array.isArray(s.required)) {
        bad.push(prefix);
        return;
      }
      for (const r of s.required) {
        if (!(r in s.properties)) bad.push(`${prefix} (required ${r} missing from properties)`);
      }
    };
    for (const [provider, methods] of Object.entries(SCHEMAS)) {
      for (const [method, s] of Object.entries(methods)) check(`${provider}.${method}`, s);
    }
    expect(bad).toEqual([]);
  });

  it('getParameterSchema returns specific schemas, generic fallback otherwise', () => {
    expect(getParameterSchema('weather', 'current').properties).toHaveProperty('city');
    expect(getParameterSchema('gaming', 'crossfireSearch').required).toContain('query');
    expect(getParameterSchema('coinWizard', 'convert').required).toContain('id');
    const fallback = getParameterSchema('realtime', 'binance');
    expect(fallback.additionalProperties).toBe(true);
    const unknown = getParameterSchema('nope', 'missing');
    expect(unknown.additionalProperties).toBe(true);
  });

  it('removed providers have no schemas', () => {
    for (const dead of [
      'pokemon',
      'rickmorty',
      'starwars',
      'harrypotter',
      'chucknorris',
      'bored',
      'kanye',
      'dadjokes',
      'advice',
      'randomuser',
      'fun',
      'memes',
      'zodiac',
    ]) {
      expect(SCHEMAS[dead]).toBeUndefined();
    }
  });
});
