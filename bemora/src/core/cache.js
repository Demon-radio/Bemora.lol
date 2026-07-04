/**
 * Bemora cache module.
 * Uses node-cache in Node.js environments; falls back to a pure Map-based
 * implementation in edge / browser runtimes (Cloudflare Workers, Vercel Edge,
 * Deno, etc.) where node-cache is unavailable.
 *
 * The setAdapter() function lets callers swap the implementation at runtime
 * (e.g. a Redis adapter for distributed caching).
 */

const meta = new Map(); // key -> { ttl, setAt }

// ---------------------------------------------------------------------------
// Map-based fallback cache (edge / browser compatible)
// ---------------------------------------------------------------------------
function createMapCache() {
  const store = new Map();
  const timers = new Map();

  return {
    get(k) {
      return store.get(k);
    },
    set(k, v, ttl = 300) {
      if (timers.has(k)) clearTimeout(timers.get(k));
      store.set(k, v);
      const timer = setTimeout(() => {
        store.delete(k);
        timers.delete(k);
        meta.delete(k);
      }, ttl * 1000);
      // Allow the timer to be GC'd in environments without unref
      if (timer?.unref) timer.unref();
      timers.set(k, timer);
      return true;
    },
    del(k) {
      if (timers.has(k)) clearTimeout(timers.get(k));
      store.delete(k);
      timers.delete(k);
    },
    flush() {
      timers.forEach((t) => clearTimeout(t));
      store.clear();
      timers.clear();
    },
    keys() {
      return [...store.keys()];
    },
  };
}

// ---------------------------------------------------------------------------
// Bootstrap: try node-cache, fall back to Map
// ---------------------------------------------------------------------------
let currentCache;

try {
  // Dynamic import so edge bundlers can tree-shake / mark as optional
  const { default: NodeCache } = await import('node-cache');
  const _nc = new NodeCache({ stdTTL: 300, checkperiod: 60 });
  // Wrap in the normalized interface (NodeCache uses flushAll() not flush())
  currentCache = {
    get: (k) => _nc.get(k),
    set: (k, v, ttl = 300) => _nc.set(k, v, ttl),
    del: (k) => _nc.del(k),
    flush: () => _nc.flushAll(),
    keys: () => _nc.keys(),
  };
} catch {
  // Edge / browser runtime — node-cache not available
  currentCache = createMapCache();
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Set custom cache adapter
 * @param {Object} adapter - must have get/set/del/flush/keys methods
 */
export function setAdapter(adapter) {
  if (
    typeof adapter.get !== 'function' ||
    typeof adapter.set !== 'function' ||
    typeof adapter.del !== 'function' ||
    typeof adapter.flush !== 'function' ||
    typeof adapter.keys !== 'function'
  ) {
    throw new Error('Cache adapter must implement get, set, del, flush, keys methods');
  }
  currentCache = adapter;
}

/**
 * Get a value from cache
 * @param {string} key
 * @returns {any|null}
 */
export function get(key) {
  return currentCache.get(key) ?? null;
}

/**
 * Get a value along with cache metadata (hit/miss, TTL, age).
 * Used to attach Cache-Control / X-Cache-Status style info to responses.
 * @param {string} key
 * @returns {{ hit: boolean, value: any|null, ttl: number|null, ageSeconds: number|null }}
 */
export function getWithMeta(key) {
  const value = currentCache.get(key);
  if (value === undefined || value === null) {
    // Distinguish "not found" from "found with value null"
    if (currentCache.keys().includes(key)) {
      // Actually cached as null (rare), treat as hit
      const m = meta.get(key);
      const ageSeconds = m ? Math.floor((Date.now() - m.setAt) / 1000) : null;
      return { hit: true, value: null, ttl: m?.ttl ?? null, ageSeconds };
    }
    return { hit: false, value: null, ttl: null, ageSeconds: null };
  }
  const m = meta.get(key);
  const ageSeconds = m ? Math.floor((Date.now() - m.setAt) / 1000) : null;
  return { hit: true, value, ttl: m?.ttl ?? null, ageSeconds };
}

/**
 * Set a value in cache
 * @param {string} key
 * @param {any} value
 * @param {number} ttl - seconds (default 300)
 */
export function set(key, value, ttl = 300) {
  currentCache.set(key, value, ttl);
  meta.set(key, { ttl, setAt: Date.now() });
}

/**
 * Delete a key from cache
 * @param {string} key
 */
export function del(key) {
  currentCache.del(key);
  meta.delete(key);
}

/**
 * Clear all cache
 */
export function flush() {
  currentCache.flush();
  meta.clear();
}

/**
 * Get all cache keys
 * @returns {string[]}
 */
export function keys() {
  return currentCache.keys();
}
