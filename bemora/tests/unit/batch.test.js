import { describe, it, expect, vi } from 'vitest';
import { batch } from '../../src/core/batch.js';

describe('batch', () => {
  it('runs all calls in parallel and returns results keyed by id', async () => {
    const results = await batch([
      { id: 'weather', fn: async () => ({ city: 'Cairo', temp: 30 }) },
      { id: 'crypto',  fn: async () => ({ coin: 'bitcoin', price: 60000 }) },
      { id: 'news',    fn: async () => ({ headlines: 5 }) },
    ]);

    expect(results.weather).toEqual({ city: 'Cairo', temp: 30 });
    expect(results.crypto).toEqual({ coin: 'bitcoin', price: 60000 });
    expect(results.news).toEqual({ headlines: 5 });
  });

  it('returns { error } for failed calls instead of throwing', async () => {
    const results = await batch([
      { id: 'ok',   fn: async () => ({ data: 1 }) },
      { id: 'fail', fn: async () => { throw new Error('Provider down'); } },
    ]);

    expect(results.ok).toEqual({ data: 1 });
    expect(results.fail).toEqual({ error: 'Provider down' });
  });

  it('runs calls concurrently (not sequentially)', async () => {
    const order = [];
    await batch([
      { id: 'slow', fn: async () => { await sleep(50); order.push('slow'); return 'slow'; } },
      { id: 'fast', fn: async () => { await sleep(5);  order.push('fast'); return 'fast'; } },
    ]);
    // fast should finish before slow
    expect(order[0]).toBe('fast');
    expect(order[1]).toBe('slow');
  });

  it('handles all calls failing gracefully', async () => {
    const results = await batch([
      { id: 'a', fn: async () => { throw new Error('a-error'); } },
      { id: 'b', fn: async () => { throw new Error('b-error'); } },
    ]);
    expect(results.a.error).toBe('a-error');
    expect(results.b.error).toBe('b-error');
  });

  it('returns an empty object for an empty call list', async () => {
    const results = await batch([]);
    expect(results).toEqual({});
  });

  it('includes "Unknown error" when the rejection has no message', async () => {
    const results = await batch([
      { id: 'nomsg', fn: async () => { throw {}; } },
    ]);
    expect(results.nomsg.error).toBe('Unknown error');
  });
});

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
