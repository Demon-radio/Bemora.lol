const DEFAULT_RETRY_STATUS_CODES = [408, 429, 500, 502, 503, 504];

function getStatusCode(err) {
  return err?.response?.status ?? err?.status ?? null;
}

/**
 * Decide whether an error is worth retrying.
 * - Network errors with no response (timeouts, DNS, connection reset) are retried.
 * - HTTP errors are retried only if their status code is in retryOn.
 * - Client errors like 400/401/403/404/422 are NEVER retried by default — retrying a
 *   bad request or bad credential just burns time and rate-limit quota.
 */
function isRetryable(err, retryOn) {
  const status = getStatusCode(err);
  if (status === null) return true; // no HTTP status => network/timeout error, worth retrying
  return retryOn.includes(status);
}

/**
 * Retry a function with exponential backoff, aware of HTTP status codes.
 *
 * @param {Function} fn - async function to retry
 * @param {Object} [opts]
 * @param {number} [opts.retries=3] - max retries
 * @param {number} [opts.baseDelay=300] - base delay ms
 * @param {number} [opts.maxDelay=5000] - max delay ms
 * @param {number[]} [opts.retryOn] - HTTP status codes worth retrying
 * @param {AbortSignal} [opts.signal] - if aborted, retrying stops immediately
 * @returns {Promise<any>}
 */
export async function withRetry(fn, { retries = 3, baseDelay = 300, maxDelay = 5000, retryOn = DEFAULT_RETRY_STATUS_CODES, signal } = {}) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    if (signal?.aborted) {
      throw signal.reason instanceof Error ? signal.reason : new Error('Aborted');
    }
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (signal?.aborted || attempt === retries || !isRetryable(err, retryOn)) break;
      const delay = Math.min(baseDelay * 2 ** attempt + Math.random() * 100, maxDelay);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastError;
}

export const _defaultRetryStatusCodes = DEFAULT_RETRY_STATUS_CODES;
