/**
 * Run multiple Bemora calls in parallel and return all results.
 * Failed calls return { error: message } instead of throwing.
 *
 * @param {Array<{ id: string, fn: () => Promise<any> }>} calls
 * @returns {Promise<Record<string, any>>}
 *
 * @example
 * const results = await batch([
 *   { id: 'weather', fn: () => api.weather.current({ city: 'Cairo' }) },
 *   { id: 'btc',     fn: () => api.crypto.price({ coins: 'bitcoin' }) },
 *   { id: 'gold',    fn: () => api.gold.price() },
 * ]);
 * console.log(results.weather, results.btc, results.gold);
 */
export async function batch(calls) {
  const settled = await Promise.allSettled(calls.map((c) => c.fn()));
  return Object.fromEntries(
    calls.map((c, i) => [
      c.id,
      settled[i].status === 'fulfilled'
        ? settled[i].value
        : { error: settled[i].reason?.message || 'Unknown error' },
    ])
  );
}
