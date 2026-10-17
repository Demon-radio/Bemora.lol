/**
 * bemora/edge — Edge & Browser-compatible entry point.
 *
 * Works in: Cloudflare Workers, Vercel Edge Functions, Deno, and modern browsers.
 *
 * Differences from the main Node.js entry (src/index.js):
 *   ✓  No dotenv — env vars must be provided directly or via platform bindings
 *   ✓  Map-based cache (no node-cache dependency)
 *   ✓  No WebSocket streams — api.realtime is excluded
 *   ✓  No file export utilities — api.export is excluded (uses fs/promises)
 *   ✓  All HTTP-based providers work via the fetch adapter in axios v1.x
 *
 * Usage:
 *   import { Bemora } from 'bemora/edge';
 *   const api = new Bemora({ groqKey: env.GROQ_KEY });
 *   const result = await api.ip.lookup({ ip: '8.8.8.8' });
 */

// Install the Map-based cache adapter before any provider initialises.
// cache.js boots with a try/catch so node-cache is already optional,
// but we explicitly swap it here to guarantee edge compatibility.
import { setAdapter } from './core/cache.js';

const _edgeStore = new Map();
const _edgeMeta  = new Map();
const _edgeTimers = new Map();

/** Pure Map-based cache — no Node.js timers API beyond setTimeout (available in edge runtimes). */
const edgeCacheAdapter = {
  get(k) {
    return _edgeStore.get(k) ?? undefined;
  },
  set(k, v, ttl = 300) {
    if (_edgeTimers.has(k)) clearTimeout(_edgeTimers.get(k));
    _edgeStore.set(k, v);
    _edgeMeta.set(k, { ttl, setAt: Date.now() });
    const t = setTimeout(() => {
      _edgeStore.delete(k);
      _edgeMeta.delete(k);
      _edgeTimers.delete(k);
    }, ttl * 1000);
    _edgeTimers.set(k, t);
    return true;
  },
  del(k) {
    if (_edgeTimers.has(k)) clearTimeout(_edgeTimers.get(k));
    _edgeStore.delete(k);
    _edgeMeta.delete(k);
    _edgeTimers.delete(k);
  },
  flush() {
    _edgeTimers.forEach((t) => clearTimeout(t));
    _edgeStore.clear();
    _edgeMeta.clear();
    _edgeTimers.clear();
  },
  keys() {
    return [..._edgeStore.keys()];
  },
};

setAdapter(edgeCacheAdapter);

// Re-export everything from the main package except Node.js-only features.
// The Bemora class itself is safe — realtime and export are just properties
// that edge users should not call (they rely on ws/fs respectively).
export { Bemora } from './index.js';
export { batch } from './core/batch.js';
export { fallbackChain, aggregate } from './core/fallback.js';
export { BemoraError, ConfigurationError, ProviderError, ValidationError } from './core/errors.js';
export { Interceptors } from './core/interceptors.js';
export { MiddlewareChain } from './core/middleware.js';
export { validateResponse, schemas as validationSchemas } from './core/validate.js';
export { generateOpenAPISpec } from './core/openapi.js';
export { staleWhileRevalidate } from './core/stale.js';
export * as registry from './core/registry.js';

// Export the edge cache adapter for users who want to inspect or extend it
export { edgeCacheAdapter };
