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
