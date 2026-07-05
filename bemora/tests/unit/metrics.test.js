import { describe, it, expect, beforeEach } from 'vitest';
import { record, getMetrics, resetMetrics, toPrometheusText, _store } from '../../src/core/metrics.js';

beforeEach(() => {
  resetMetrics();
});

describe('metrics', () => {
  // ── record ────────────────────────────────────────────────────────────────
  it('record() increments request count', () => {
    record('coingecko', { success: true });
    record('coingecko', { success: true });
    const m = getMetrics('coingecko');
    expect(m.requests).toBe(2);
  });

  it('record() increments error count on failure', () => {
    record('coingecko', { success: false });
    record('coingecko', { success: true });
    const m = getMetrics('coingecko');
    expect(m.errors).toBe(1);
    expect(m.errorRate).toBeCloseTo(0.5, 2);
  });

  it('record() tracks cache hits and misses', () => {
    record('ip-api', { success: true, cacheHit: true });
    record('ip-api', { success: true, cacheHit: true });
    record('ip-api', { success: true, cacheHit: false });
    const m = getMetrics('ip-api');
    expect(m.cacheHits).toBe(2);
    expect(m.cacheMisses).toBe(1);
    expect(m.cacheHitRate).toBeCloseTo(2 / 3, 2);
  });

  it('record() ignores invalid latency values', () => {
    record('test', { success: true, latencyMs: -1 });
    record('test', { success: true, latencyMs: undefined });
    const m = getMetrics('test');
    expect(m.latency.samples).toBe(0);
  });

  // ── getMetrics ────────────────────────────────────────────────────────────
  it('getMetrics(provider) returns null for unknown provider', () => {
    expect(getMetrics('unknown-xyz')).toBeNull();
  });

  it('getMetrics() (no arg) returns an array of all providers', () => {
    record('a', { success: true });
    record('b', { success: false });
    const all = getMetrics();
    expect(Array.isArray(all)).toBe(true);
    expect(all.map((x) => x.provider)).toEqual(expect.arrayContaining(['a', 'b']));
  });

  // ── latency percentiles ───────────────────────────────────────────────────
  it('computes correct p50 / p95 / p99 percentiles', () => {
    // Record 100 samples: 1ms … 100ms
    for (let i = 1; i <= 100; i++) {
      record('latency-test', { success: true, latencyMs: i });
    }
    const m = getMetrics('latency-test');
    expect(m.latency.p50).toBe(50);
    expect(m.latency.p95).toBe(95);
    expect(m.latency.p99).toBe(99);
    expect(m.latency.min).toBe(1);
    expect(m.latency.max).toBe(100);
    // avg of 1..100 = 5050/100 = 50.5, Math.round → 51
    expect(m.latency.avg).toBe(51);
  });

  it('returns zero latencies when no samples have been recorded', () => {
    record('empty-lat', { success: true }); // no latencyMs
    const m = getMetrics('empty-lat');
    expect(m.latency.p50).toBe(0);
    expect(m.latency.p99).toBe(0);
    expect(m.latency.samples).toBe(0);
  });

  // ── ring-buffer cap ────────────────────────────────────────────────────────
  it('caps latency samples at 1000', () => {
    for (let i = 0; i < 1200; i++) {
      record('ring', { success: true, latencyMs: i });
    }
    const entry = _store.get('ring');
    expect(entry.latencies.length).toBeLessThanOrEqual(1000);
  });

  // ── toPrometheusText ──────────────────────────────────────────────────────
  it('toPrometheusText() returns non-empty text after recording', () => {
    record('prom-test', { success: true, latencyMs: 50, cacheHit: false });
    const text = toPrometheusText();
    expect(text).toContain('bemora_requests_total');
    expect(text).toContain('prom-test');
    expect(text).toContain('bemora_latency_p50_ms');
  });

  it('toPrometheusText() returns empty string when no data', () => {
    expect(toPrometheusText()).toBe('');
  });

  // ── resetMetrics ──────────────────────────────────────────────────────────
  it('resetMetrics() clears all data', () => {
    record('x', { success: true });
    resetMetrics();
    expect(getMetrics()).toEqual([]);
    expect(getMetrics('x')).toBeNull();
  });

  // ── isolated providers ─────────────────────────────────────────────────────
  it('tracks multiple providers independently', () => {
    record('pA', { success: true, latencyMs: 10 });
    record('pA', { success: false, latencyMs: 20 });
    record('pB', { success: true, latencyMs: 5 });
    const a = getMetrics('pA');
    const b = getMetrics('pB');
    expect(a.requests).toBe(2);
    expect(b.requests).toBe(1);
    expect(a.errors).toBe(1);
    expect(b.errors).toBe(0);
  });
});
