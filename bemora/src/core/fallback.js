import { logger } from './logger.js';
import * as cache from './cache.js';

/**
 * Smart Fallback Chain
 * Tries each provider in order. Returns first success.
 * On total failure, returns last valid cached value if available.
 *
 * @param {string} cacheKey - key for emergency cache fallback
 * @param {Array<{ name: string, fn: () => Promise<any> }>} chain
 * @param {number} cacheTTL - cache TTL for successful results
 * @returns {Promise<any>}
 *
 * @example
 * const data = await fallbackChain('weather:Cairo', [
 *   { name: 'openweathermap', fn: () => getOWM() },
 *   { name: 'open-meteo',     fn: () => getOpenMeteo() },
 *   { name: 'wttr.in',        fn: () => getWttr() },
 * ]);
 */
export async function fallbackChain(cacheKey, chain, cacheTTL = 300) {
  const errors = [];

  for (const { name, fn } of chain) {
    try {
      logger.debug(`Trying provider: ${name}`);
      const result = await fn();
      cache.set(cacheKey, result, cacheTTL);
      return { ...result, _provider: name, _fallback_errors: errors };
    } catch (err) {
      logger.warn(`Provider "${name}" failed: ${err.message}`);
      errors.push({ provider: name, error: err.message });
    }
  }

  // All failed — try emergency cache
  const emergency = cache.get(cacheKey);
  if (emergency) {
    logger.warn(`All providers failed. Returning stale cache for: ${cacheKey}`);
    return { ...emergency, _stale: true, _provider: 'cache', _fallback_errors: errors };
  }

  throw new Error(
    `All providers failed for "${cacheKey}":\n` +
    errors.map((e) => `  • ${e.provider}: ${e.error}`).join('\n')
  );
}

/**
 * Aggregate results from multiple providers and merge by strategy.
 *
 * @param {Array<{ name: string, fn: () => Promise<any> }>} sources
 * @param {Object} opts
 * @param {'first'|'majority'|'average'|'all'} opts.strategy
 * @param {string} [opts.field] - field to average/majority-vote on
 * @returns {Promise<Object>}
 */
export async function aggregate(sources, { strategy = 'first', field } = {}) {
  const results = await Promise.allSettled(sources.map((s) => s.fn()));

  const successes = results
    .map((r, i) => r.status === 'fulfilled' ? { name: sources[i].name, data: r.value } : null)
    .filter(Boolean);

  const failures = results
    .map((r, i) => r.status === 'rejected' ? { name: sources[i].name, error: r.reason?.message } : null)
    .filter(Boolean);

  if (!successes.length) {
    throw new Error('All sources failed:\n' + failures.map((f) => `  • ${f.name}: ${f.error}`).join('\n'));
  }

  if (strategy === 'all') {
    return { results: successes, failures, strategy };
  }

  if (strategy === 'first') {
    return { ...successes[0].data, _provider: successes[0].name, _sources_tried: successes.length, failures };
  }

  if (strategy === 'average' && field) {
    const values = successes.map((s) => parseFloat(s.data[field])).filter((v) => !isNaN(v));
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    return {
      [field]: parseFloat(avg.toFixed(4)),
      _providers: successes.map((s) => s.name),
      _individual_values: successes.map((s) => ({ provider: s.name, value: s.data[field] })),
      failures,
      strategy: 'average',
    };
  }

  if (strategy === 'majority' && field) {
    const values = successes.map((s) => s.data[field]);
    const sorted = [...values].sort();
    const median = sorted[Math.floor(sorted.length / 2)];
    return {
      [field]: median,
      _providers: successes.map((s) => s.name),
      _individual_values: successes.map((s) => ({ provider: s.name, value: s.data[field] })),
      failures,
      strategy: 'majority',
    };
  }

  return { ...successes[0].data, _provider: successes[0].name, failures };
}
