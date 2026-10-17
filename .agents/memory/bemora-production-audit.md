---
name: Bemora production audit fixes
description: What was fixed vs. intentionally skipped from a third-party production-readiness audit, and why.
---

# Bemora Production Audit Fixes

## Edge-runtime safety pattern
**Rule:** All Node-only built-ins (`events`, `path`, `fs/promises`, `ws`) must be loaded via `await import(...)` — never static `import` statements — so bundlers can tree-shake them and edge runtimes don't fail at module-load time.

**Files fixed:**
- `src/providers/realtime.js` — `events` moved to top-level `await import()` with MinimalEmitter stub; `ws` remains lazy inside `loadWebSocket()`
- `src/core/export.js` — `path` moved to lazy `joinPath()` helper; `fs/promises` was already lazy
- `src/index.js` — `dotenv/config` wrapped in `if (process.versions?.node)` guard using top-level await

**Why:** Static Node-only imports fail at module resolution time in Cloudflare Workers, Vercel Edge, and browser environments even when the import path is never executed.

## Cache adapter normalization
**Rule:** NodeCache uses `flushAll()` not `flush()`. Always wrap NodeCache in an adapter with a normalized `flush()` method.

**Why:** Previous code called `currentCache.flush()` directly on a NodeCache instance, causing test failures.

## Test suite isolation
**Rule:** Default `npm test` runs `tests/unit/**` only via `vitest.config.js`. Integration tests (`tests/integration/**`) run via `npm run test:integration` using a separate `vitest.config.integration.js`.

**Why:** Integration tests hit real external APIs (network), are slow/flaky, and should not block local development CI.

## AI streaming passthrough
**Rule:** `groqStream` and `openaiStream` return `AsyncGenerator` and must be exposed as direct passthroughs (not wrapped via `_wrap()`), to preserve `for await...of` semantics.
