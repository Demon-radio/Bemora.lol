import { withRetry } from './retry.js';
import { withCircuitBreaker, getBreaker, resetBreaker, resetAllBreakers, getAllBreakerStates, CircuitOpenError, CircuitBreaker } from './circuit.js';
import { failover, aggregate } from './fallback.js';
import { RateLimiter, configure as configureRateLimit, isLimited, record as recordRateLimit, getStatus as getRateLimitStatus, reset as resetRateLimit } from './ratelimit.js';

export class TimeoutError extends Error {
  constructor(ms) {
    super(`Call timed out after ${ms}ms`);
    this.name = 'TimeoutError';
  }
}

async function withTimeout(fn, ms) {
  if (!ms) return fn();
  let timer;
  try {
    return await Promise.race([
      fn(),
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new TimeoutError(ms)), ms);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * The single entry point most users need: wrap any async call with a
 * timeout, retries, and a circuit breaker, in one composable function.
 *
 * @param {() => Promise<any>} fn - the call to protect
 * @param {Object} [opts]
 * @param {string} [opts.key='default'] - identifies this call's circuit breaker / rate limit bucket
 * @param {number} [opts.timeout] - ms before the call is aborted as timed out
 * @param {number} [opts.retries=3] - max retry attempts (0 disables retries)
 * @param {number} [opts.baseDelay=300] - base backoff delay in ms
 * @param {number} [opts.maxDelay=5000] - max backoff delay in ms
 * @param {number[]} [opts.retryOn] - HTTP status codes worth retrying
 * @param {boolean} [opts.circuitBreaker=true] - set false to disable the breaker for this call
 * @param {Object} [opts.circuitOptions] - { failureThreshold, successThreshold, openDuration }
 * @returns {Promise<any>}
 *
 * @example
 * import { resilient } from 'resilify';
 *
 * const data = await resilient(() => axios.get('https://api.example.com/rates'), {
 *   key: 'rates-api',
 *   timeout: 5000,
 *   retries: 3,
 * });
 */
export async function resilient(fn, opts = {}) {
  const {
    key = 'default',
    timeout,
    circuitBreaker: useCircuitBreaker = true,
    circuitOptions,
    ...retryOpts
  } = opts;

  const attempt = () => withTimeout(fn, timeout);

  if (useCircuitBreaker) {
    return withCircuitBreaker(key, () => withRetry(attempt, retryOpts), circuitOptions);
  }
  return withRetry(attempt, retryOpts);
}

/**
 * Try a list of alternative calls in order, returning the first success.
 * Thin, opinionated wrapper around `failover()` that also runs each
 * candidate through `resilient()` first.
 *
 * @param {Array<{ name: string, fn: () => Promise<any> }>} chain
 * @param {Object} [opts] - same shape as `resilient()`'s opts, plus `cache`/`cacheKey`
 */
export async function resilientFailover(chain, opts = {}) {
  const { cache, cacheKey, onProviderError, ...resilientOpts } = opts;
  const wrapped = chain.map(({ name, fn }) => ({
    name,
    fn: () => resilient(fn, { ...resilientOpts, key: resilientOpts.key ?? name }),
  }));
  return failover(wrapped, { cache, cacheKey, onProviderError });
}

export {
  withRetry,
  withCircuitBreaker,
  getBreaker,
  resetBreaker,
  resetAllBreakers,
  getAllBreakerStates,
  CircuitOpenError,
  CircuitBreaker,
  failover,
  aggregate,
  RateLimiter,
  configureRateLimit,
  isLimited,
  recordRateLimit,
  getRateLimitStatus,
  resetRateLimit,
  withTimeout,
};

export default resilient;
