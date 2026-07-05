---
name: Bemora production audit fixes
description: What was fixed vs. intentionally skipped from the third-party production-readiness audit, and all improvements implemented.
---

## Audit: Bemora v3.6.0 Production Readiness Report (July 2026)

### All 10 original bugs confirmed fixed in v3.6.0
Health check naming collision, fake rate limiting, in-memory-only cache, silent error swallowing, dedup race condition, sync file writes, overlapping monitor runs, fake health checks, non-status-aware retries, host injection.

### Improvements implemented post-audit (current state)

**P0 — Circuit Breaker** (`src/core/circuit.js`)
- Full CLOSED → OPEN → HALF_OPEN state machine per provider
- `getBreaker(provider, opts)` global registry; `resetBreaker`, `resetAllBreakers`, `getAllBreakerStates`
- Configurable: `failureThreshold` (default 5), `successThreshold` (default 2), `openDuration` (default 60 000 ms)
- Wired into `_wrap`: OPEN → `CircuitBreakerError` thrown, HALF_OPEN → single probe with `startProbe`/`endProbe`
- Exposed on `api.circuits.{status, statusOf, reset, resetAll, open, close}`

**P0 — AbortController / AbortSignal**
- `withRetry` already respected `signal`; `_wrap` extracts `{ signal }` from the first argument of any method call and passes it through

**P1 — Per-provider Timeouts**
- `options.timeout` (global default 30 000 ms) and `options.timeouts[provider]` override
- `_wrap` wraps `fn(...args)` in a `Promise` race with `setTimeout` — throws `TimeoutError` on expiry
- `TimeoutError` triggers circuit breaker failure recording

**P1 — Structured JSON Logging** (`src/core/logger.js`)
- `BEMORA_LOG_FORMAT=json` → newline-delimited JSON to stdout/stderr
- `BEMORA_LOG_LEVEL` env controls verbosity
- `logger.setTransport(fn)` — custom sink for Datadog / ELK / CloudWatch
- Each log entry includes: `ts`, `level`, `msg`, `provider?`, `latencyMs?`, `cacheStatus?`

**P1 — Metrics / Observability** (`src/core/metrics.js`)
- Per-provider: `requests`, `errors`, `errorRate`, `cacheHits`, `cacheMisses`, `cacheHitRate`
- Latency: `p50`, `p95`, `p99`, `min`, `max`, `avg` (ring-buffer, last 1 000 samples)
- `toPrometheusText()` → Prometheus text exposition format
- Exposed on `api.getMetrics(provider?)` and `api.metricsPrometheus()`
- `_wrap` calls `metrics.record(provider, { latencyMs, success, cacheHit })` on every call

**P2 — Multi-Tenant Key Management**
- `api.setKey(name, value)` — hot-rotate without restart
- `api.forTenant(tenantId, keys)` — returns new `Bemora` instance with tenant keys + shared options

**P2 — Cache Headers**
- `options.cacheHeaders: true` adds `_cacheControl`, `_xCacheStatus`, `_etag` to responses with `_cached`

**P2 — Plugin Ecosystem Convention**
- Convention `bemora-plugin-*` documented in README
- `loadPlugin(name)` warns if name doesn't follow convention
- Plugin interface: `{ name: string, install(api): void }`

### New error types
- `CircuitBreakerError` (code: `CIRCUIT_BREAKER_OPEN`) — thrown when circuit is OPEN
- `TimeoutError` (code: `TIMEOUT`) — thrown when per-provider timeout elapses

### Test counts (after audit improvements)
- Unit: 155 tests (14 files) — added `circuit.test.js` (17 tests) and `metrics.test.js` (13 tests)
- Integration: 13 tests (all free-tier providers)

### Known external failures (not library bugs)
- Wikipedia: IP-level block (datacenter IPs), no fix possible from library side
- WorldTimeAPI: intermittently ECONNRESET, provider is unstable
- dog.ceo: Cloudflare 520 (upstream server issue)
- Jikan: ETIMEDOUT (provider known slow/overloaded)
- CoinGecko: occasional 429 from shared IPs

### Intentionally NOT implemented (deferred)
- OpenTelemetry spans (P2 — needs optional dep)
- Audit logging for key rotation (P2 — needs persistence layer)
- Webhook/push system beyond existing `api.watch()` (P2 — complex)
- Edge test suite on actual Cloudflare Workers (P2 — needs separate environment)
