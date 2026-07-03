/**
 * Retry a function with exponential backoff
 * @param {Function} fn - async function to retry
 * @param {Object} opts
 * @param {number} opts.retries - max retries (default 3)
 * @param {number} opts.baseDelay - base delay ms (default 300)
 * @param {number} opts.maxDelay - max delay ms (default 5000)
 * @returns {Promise<any>}
 */
export async function withRetry(fn, { retries = 3, baseDelay = 300, maxDelay = 5000 } = {}) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt === retries) break;
      const delay = Math.min(baseDelay * 2 ** attempt + Math.random() * 100, maxDelay);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastError;
}
