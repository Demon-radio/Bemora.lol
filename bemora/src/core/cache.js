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
 * Get value and cache metadata
 * @param {string} key
 * @returns {{value: any|null, hit: boolean}
 */
export function getWithMeta(key) {
  const value = currentCache.get(key);
  return { value: value ?? null, hit: value !== undefined };
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

/**
 * Helper to wrap cache operations and add metadata to result
 * @param {string} key
 * @param {function} fetchFn
 * @param {number} ttl
 * @returns {Promise<any>}
 */
export async function wrapCache(key, fetchFn, ttl = 300) {
  const { value: cached, hit } = getWithMeta(key);
  if (hit && cached) {
    return { ...cached, _cacheStatus: 'HIT', _cacheTTL: ttl };
  }

  const result = await fetchFn();
  set(key, result, ttl);
  return { ...result, _cacheStatus: 'MISS', _cacheTTL: ttl };
}
