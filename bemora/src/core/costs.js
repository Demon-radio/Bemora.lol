/**
 * AI cost tracking.
 *
 * Records token usage and estimated USD cost per provider, model, and tenant.
 * Wire into the AI provider wrappers to auto-track spend.
 *
 * Usage:
 *   import { recordCost, snapshot, snapshotForTenant, reset } from '../core/costs.js';
 *
 *   recordCost({ provider: 'openai', model: 'gpt-4o', inputTokens: 500, outputTokens: 200, tenantId: 'cust_123' });
 *   const spend = snapshot(); // { totalUsd, byProvider, byTenant, byModel }
 */

// ── Token pricing table (USD per 1 000 tokens) ───────────────────────────────
// These are approximate list prices as of mid-2025. Update as pricing changes.

const PRICING = {
  // OpenAI
  'openai:gpt-4o':                { input: 0.005,    output: 0.015 },
  'openai:gpt-4o-mini':           { input: 0.00015,  output: 0.0006 },
  'openai:gpt-4-turbo':           { input: 0.01,     output: 0.03 },
  'openai:gpt-3.5-turbo':         { input: 0.0005,   output: 0.0015 },
  'openai:text-embedding-3-small': { input: 0.00002, output: 0 },
  'openai:text-embedding-3-large': { input: 0.00013, output: 0 },
  // Anthropic
  'anthropic:claude-3-5-sonnet-20241022': { input: 0.003, output: 0.015 },
  'anthropic:claude-3-5-haiku-20241022':  { input: 0.0008, output: 0.004 },
  'anthropic:claude-3-opus-20240229':     { input: 0.015, output: 0.075 },
  // Google
  'google:gemini-1.5-flash':  { input: 0.000075, output: 0.0003 },
  'google:gemini-1.5-pro':    { input: 0.00125,  output: 0.005 },
  'google:gemini-2.0-flash':  { input: 0.00010,  output: 0.0004 },
  // Groq (very cheap inference)
  'groq:llama3-8b-8192':      { input: 0.00005, output: 0.00008 },
  'groq:llama3-70b-8192':     { input: 0.00059, output: 0.00079 },
  'groq:mixtral-8x7b-32768':  { input: 0.00024, output: 0.00024 },
  // Cohere
  'cohere:command-r':         { input: 0.00015, output: 0.0006 },
  'cohere:command-r-plus':    { input: 0.003,   output: 0.015 },
  // Mistral
  'mistral:mistral-small':    { input: 0.001, output: 0.003 },
  'mistral:mistral-medium':   { input: 0.0027, output: 0.0081 },
  'mistral:mistral-large':    { input: 0.004, output: 0.012 },
  // Together AI
  'together:llama-3-70b':     { input: 0.0009, output: 0.0009 },
  'together:mixtral-8x7b':    { input: 0.0006, output: 0.0006 },
  // Perplexity
  'perplexity:llama-3.1-sonar-small-128k-online': { input: 0.0002, output: 0.0002 },
  'perplexity:llama-3.1-sonar-large-128k-online': { input: 0.001, output: 0.001 },
};

// ── Storage ───────────────────────────────────────────────────────────────────

/** @type {Map<string, { inputTokens, outputTokens, requests, costUsd }>} */
const _byProvider = new Map();
const _byModel    = new Map();
const _byTenant   = new Map();
let   _totalCostUsd = 0;
const _events     = [];

// ── Core ──────────────────────────────────────────────────────────────────────

/**
 * Estimate cost in USD for a given provider/model/token combination.
 */
export function estimateCost({ provider, model, inputTokens = 0, outputTokens = 0 } = {}) {
  const key = `${provider}:${model}`;
  const pricing = PRICING[key];
  if (!pricing) return null; // unknown model
  return (inputTokens / 1000) * pricing.input + (outputTokens / 1000) * pricing.output;
}

/**
 * Record a completed AI call.
 * @param {{ provider: string, model: string, inputTokens: number, outputTokens: number, tenantId?: string, requestId?: string }} params
 */
export function recordCost({ provider, model, inputTokens = 0, outputTokens = 0, tenantId, requestId } = {}) {
  const costUsd = estimateCost({ provider, model, inputTokens, outputTokens }) ?? 0;

  // By provider
  const pKey = provider;
  const p = _byProvider.get(pKey) || { inputTokens: 0, outputTokens: 0, requests: 0, costUsd: 0 };
  _byProvider.set(pKey, { inputTokens: p.inputTokens + inputTokens, outputTokens: p.outputTokens + outputTokens, requests: p.requests + 1, costUsd: p.costUsd + costUsd });

  // By model
  const mKey = `${provider}:${model}`;
  const m = _byModel.get(mKey) || { inputTokens: 0, outputTokens: 0, requests: 0, costUsd: 0 };
  _byModel.set(mKey, { inputTokens: m.inputTokens + inputTokens, outputTokens: m.outputTokens + outputTokens, requests: m.requests + 1, costUsd: m.costUsd + costUsd });

  // By tenant
  if (tenantId) {
    const t = _byTenant.get(tenantId) || {};
    const tp = t[provider] || { inputTokens: 0, outputTokens: 0, requests: 0, costUsd: 0 };
    t[provider] = { inputTokens: tp.inputTokens + inputTokens, outputTokens: tp.outputTokens + outputTokens, requests: tp.requests + 1, costUsd: tp.costUsd + costUsd };
    _byTenant.set(tenantId, t);
  }

  _totalCostUsd += costUsd;

  const entry = { provider, model, inputTokens, outputTokens, costUsd, tenantId, requestId, ts: new Date().toISOString() };
  _events.push(entry);

  return entry;
}

/**
 * Get a spend snapshot.
 * @returns {{ totalUsd: number, byProvider: object, byModel: object, byTenant: object, events: Array }}
 */
export function snapshot() {
  return {
    totalUsd: _totalCostUsd,
    byProvider: Object.fromEntries(_byProvider),
    byModel: Object.fromEntries(_byModel),
    byTenant: Object.fromEntries([..._byTenant.entries()].map(([tid, v]) => [tid, v])),
    eventCount: _events.length,
  };
}

/**
 * Get spend snapshot for a single tenant.
 */
export function snapshotForTenant(tenantId) {
  const t = _byTenant.get(tenantId);
  if (!t) return { tenantId, totalUsd: 0, byProvider: {} };
  const totalUsd = Object.values(t).reduce((acc, v) => acc + v.costUsd, 0);
  return { tenantId, totalUsd, byProvider: t };
}

/**
 * Reset all cost counters (e.g. at billing period boundary).
 */
export function reset() {
  _byProvider.clear();
  _byModel.clear();
  _byTenant.clear();
  _totalCostUsd = 0;
  _events.length = 0;
}

/**
 * Get raw event log (most recent N events).
 */
export function events(limit = 100) {
  return _events.slice(-limit);
}

/**
 * Get pricing table.
 */
export function pricingTable() {
  return { ...PRICING };
}
