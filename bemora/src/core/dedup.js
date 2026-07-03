/**
 * Request deduplication — if the same async call is in-flight,
 * subsequent callers share the same Promise instead of making duplicate HTTP requests.
 */
const inFlight = new Map();

/**
 * @param {string} key - unique request key
 * @param {Function} fn - async factory
 * @returns {Promise<any>}
 */
export async function dedup(key, fn) {
  if (inFlight.has(key)) return inFlight.get(key);
  const promise = fn().finally(() => inFlight.delete(key));
  inFlight.set(key, promise);
  return promise;
}
