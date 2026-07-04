import NodeCache from 'node-cache';

let currentCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });
const meta = new Map(); // key -> { ttl, setAt }

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
  if (value === undefined) return { hit: false, value: null, ttl: null, ageSeconds: null };
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
