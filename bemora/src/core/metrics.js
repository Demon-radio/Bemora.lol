/**
 * Bemora metrics collector.
 *
 * Tracks per-provider: request count, error count, latency samples
 * (last 1 000), cache hit/miss counts. Computes p50 / p95 / p99
 * percentiles on demand.
 *
 * Usage:
 *   import * as metrics from './metrics.js';
 *   metrics.record('coingecko', { latencyMs: 120, success: true, cacheHit: false });
 *   const all  = metrics.getMetrics();          // array of all providers
 *   const one  = metrics.getMetrics('coingecko'); // single entry or null
 *   metrics.resetMetrics();
 *
 * In the Bemora class this is exposed as:
 *   api.metrics()              → all providers
 *   api.metrics.provider(name) → single provider
 */

const MAX_SAMPLES = 1_000;

const _data = new Map(); // provider → entry

function _entry(provider) {
  if (!_data.has(provider)) {
    _data.set(provider, {
      requests:   0,
      errors:     0,
      latencies:  [], // ring-buffer of latencyMs numbers
      cacheHits:  0,
      cacheMisses: 0,
    });
  }
  return _data.get(provider);
}

function _percentile(sorted, p) {
  if (!sorted.length) return 0;
  const idx = Math.ceil((sorted.length * p) / 100) - 1;
  return sorted[Math.max(0, idx)];
}

function _summarize(provider, e) {
  const sorted = [...e.latencies].sort((a, b) => a - b);
  const total  = e.cacheHits + e.cacheMisses;
  return {
    provider,
    requests:     e.requests,
    errors:       e.errors,
    errorRate:    e.requests ? +(e.errors / e.requests).toFixed(4) : 0,
    cacheHits:    e.cacheHits,
    cacheMisses:  e.cacheMisses,
    cacheHitRate: total ? +(e.cacheHits / total).toFixed(4) : 0,
    latency: {
      p50:  _percentile(sorted, 50),
      p95:  _percentile(sorted, 95),
      p99:  _percentile(sorted, 99),
      min:  sorted.length ? sorted[0]              : 0,
      max:  sorted.length ? sorted[sorted.length - 1] : 0,
      avg:  sorted.length ? Math.round(sorted.reduce((a, b) => a + b, 0) / sorted.length) : 0,
      samples: sorted.length,
    },
  };
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Record a single request outcome.
 * @param {string} provider
 * @param {{ latencyMs?: number, success: boolean, cacheHit?: boolean }} opts
 */
export function record(provider, { latencyMs, success, cacheHit } = {}) {
  const e = _entry(provider);
  e.requests++;
  if (!success) e.errors++;
  if (typeof latencyMs === 'number' && latencyMs >= 0) {
    if (e.latencies.length >= MAX_SAMPLES) e.latencies.shift();
    e.latencies.push(latencyMs);
  }
  if (cacheHit === true)  e.cacheHits++;
  if (cacheHit === false) e.cacheMisses++;
}

/**
 * Get metrics summary.
 * @param {string} [provider] - if omitted, returns all providers as an array
 * @returns {Object|Object[]|null}
 */
export function getMetrics(provider) {
  if (provider !== undefined) {
    const e = _data.get(provider);
    return e ? _summarize(provider, e) : null;
  }
  return [..._data.entries()].map(([p, e]) => _summarize(p, e));
}

/**
 * Get a Prometheus-compatible text exposition.
 * Suitable for scraping by a /metrics endpoint.
 */
export function toPrometheusText() {
  const lines = [];
  for (const [provider, e] of _data) {
    const s = _summarize(provider, e);
    const prov = provider.replace(/[^a-zA-Z0-9_]/g, '_');
    lines.push(`# HELP bemora_requests_total Total requests for ${provider}`);
    lines.push(`# TYPE bemora_requests_total counter`);
    lines.push(`bemora_requests_total{provider="${provider}"} ${s.requests}`);
    lines.push(`bemora_errors_total{provider="${provider}"} ${s.errors}`);
    lines.push(`bemora_cache_hits_total{provider="${provider}"} ${s.cacheHits}`);
    lines.push(`bemora_cache_misses_total{provider="${provider}"} ${s.cacheMisses}`);
    lines.push(`bemora_latency_p50_ms{provider="${provider}"} ${s.latency.p50}`);
    lines.push(`bemora_latency_p95_ms{provider="${provider}"} ${s.latency.p95}`);
    lines.push(`bemora_latency_p99_ms{provider="${provider}"} ${s.latency.p99}`);
  }
  return lines.join('\n');
}

/** Reset all collected metrics. */
export function resetMetrics() {
  _data.clear();
}

/** @internal — exported for tests only */
export const _store = _data;
