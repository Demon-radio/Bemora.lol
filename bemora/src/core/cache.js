import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

/**
 * Get a value from cache
 * @param {string} key
 * @returns {any|null}
 */
export function get(key) {
  return cache.get(key) ?? null;
}

/**
 * Set a value in cache
 * @param {string} key
 * @param {any} value
 * @param {number} ttl - seconds (default 300)
 */
export function set(key, value, ttl = 300) {
  cache.set(key, value, ttl);
}

/**
 * Delete a key from cache
 * @param {string} key
 */
export function del(key) {
  cache.del(key);
}

/**
 * Clear all cache
 */
export function flush() {
  cache.flushAll();
}

/**
 * Get all cache keys
 * @returns {string[]}
 */
export function keys() {
  return cache.keys();
}
