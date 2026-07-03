import NodeCache from 'node-cache';

let currentCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

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
 * Set a value in cache
 * @param {string} key
 * @param {any} value
 * @param {number} ttl - seconds (default 300)
 */
export function set(key, value, ttl = 300) {
  currentCache.set(key, value, ttl);
}

/**
 * Delete a key from cache
 * @param {string} key
 */
export function del(key) {
  currentCache.del(key);
}

/**
 * Clear all cache
 */
export function flush() {
  currentCache.flush();
}

/**
 * Get all cache keys
 * @returns {string[]}
 */
export function keys() {
  return currentCache.keys();
}
