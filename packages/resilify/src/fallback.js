/**
 * Multi-provider failover chain. Tries each source in order and returns the
 * first success. Optionally falls back to a stale cached value (if you pass
 * a `cache` adapter) when every source fails.
 *
 * @param {Array<{ name: string, fn: () => Promise<any> }>} chain
 * @param {Object} [opts]
 * @param {{ get: (key: string) => any, set: (key: string, value: any) => void }} [opts.cache]
 * @param {string} [opts.cacheKey]
 * @param {(name: string, err: Error) => void} [opts.onProviderError] - called each time a source fails
 * @returns {Promise<any>}
 *
 * @example
 * const data = await failover([
 *   { name: 'primary',   fn: () => primaryApi.get('/rates') },
 *   { name: 'secondary', fn: () => secondaryApi.get('/rates') },
 * ], { cache: myCache, cacheKey: 'rates' });
 */
export async function failover(chain, { cache, cacheKey, onProviderError } = {}) {
  const errors = [];

  for (const { name, fn } of chain) {
    try {
      const result = await fn();
      if (cache && cacheKey) cache.set(cacheKey, result);
      return { ...wrapResult(result), _source: name, _failedSources: errors };
    } catch (err) {
      onProviderError?.(name, err);
      errors.push({ source: name, error: err.message });
    }
  }

  if (cache && cacheKey) {
    const stale = cache.get(cacheKey);
    if (stale !== undefined && stale !== null) {
      return { ...wrapResult(stale), _stale: true, _source: 'cache', _failedSources: errors };
    }
  }

  throw new Error(
    `All sources failed:\n` + errors.map((e) => `  • ${e.source}: ${e.error}`).join('\n')
  );
}

function wrapResult(result) {
  // Non-object results (numbers, strings) can't carry metadata fields —
  // callers get the raw value back without _source/_failedSources spread onto it.
  return result !== null && typeof result === 'object' && !Array.isArray(result) ? result : { value: result };
}

/**
 * Call multiple sources concurrently and combine their results by strategy.
 *
 * @param {Array<{ name: string, fn: () => Promise<any> }>} sources
 * @param {Object} [opts]
 * @param {'first'|'majority'|'average'|'all'} [opts.strategy='first']
 * @param {string} [opts.field] - field to average/majority-vote on (required for those strategies)
 * @returns {Promise<Object>}
 */
export async function aggregate(sources, { strategy = 'first', field } = {}) {
  const results = await Promise.allSettled(sources.map((s) => s.fn()));

  const successes = results
    .map((r, i) => (r.status === 'fulfilled' ? { name: sources[i].name, data: r.value } : null))
    .filter(Boolean);

  const failures = results
    .map((r, i) => (r.status === 'rejected' ? { name: sources[i].name, error: r.reason?.message } : null))
    .filter(Boolean);

  if (!successes.length) {
    throw new Error('All sources failed:\n' + failures.map((f) => `  • ${f.name}: ${f.error}`).join('\n'));
  }

  if (strategy === 'all') {
    return { results: successes, failures, strategy };
  }

  if (strategy === 'first') {
    return { ...successes[0].data, _source: successes[0].name, _sourcesTried: successes.length, failures };
  }

  if (strategy === 'average' && field) {
    const values = successes.map((s) => parseFloat(s.data[field])).filter((v) => !isNaN(v));
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    return {
      [field]: parseFloat(avg.toFixed(4)),
      _sources: successes.map((s) => s.name),
      _individualValues: successes.map((s) => ({ source: s.name, value: s.data[field] })),
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
      _sources: successes.map((s) => s.name),
      _individualValues: successes.map((s) => ({ source: s.name, value: s.data[field] })),
      failures,
      strategy: 'majority',
    };
  }

  return { ...successes[0].data, _source: successes[0].name, failures };
}
