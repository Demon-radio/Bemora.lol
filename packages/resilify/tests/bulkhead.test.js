import { describe, it, expect } from 'vitest';
import { Bulkhead, BulkheadError } from '../src/bulkhead.js';

describe('Bulkhead — construction', () => {
  it('creates with defaults', () => {
    const bh = new Bulkhead();
    expect(bh.active).toBe(0);
    expect(bh.queued).toBe(0);
    expect(bh.getStats().concurrency).toBe(10);
  });

  it('throws on invalid concurrency', () => {
    expect(() => new Bulkhead({ concurrency: 0 })).toThrow(RangeError);
    expect(() => new Bulkhead({ concurrency: -1 })).toThrow(RangeError);
    expect(() => new Bulkhead({ concurrency: 1.5 })).toThrow(RangeError);
  });

  it('throws on invalid queue limit', () => {
    expect(() => new Bulkhead({ concurrency: 1, queue: -1 })).toThrow(RangeError);
    expect(() => new Bulkhead({ concurrency: 1, queue: 1.5 })).toThrow(RangeError);
  });

  it('accepts queue: 0 (no queuing — reject when busy)', () => {
    expect(() => new Bulkhead({ concurrency: 2, queue: 0 })).not.toThrow();
  });
});

describe('Bulkhead — basic execution', () => {
  it('runs a call and returns its result', async () => {
    const bh = new Bulkhead({ concurrency: 2 });
    const result = await bh.run(async () => 42);
    expect(result).toBe(42);
  });

  it('active count reflects in-flight calls', async () => {
    const bh = new Bulkhead({ concurrency: 3 });
    let resolveA;
    const a = bh.run(() => new Promise((r) => { resolveA = r; }));
    // Give the microtask queue a tick to start the call
    await Promise.resolve();
    expect(bh.active).toBe(1);
    resolveA();
    await a;
    expect(bh.active).toBe(0);
  });

  it('decrements active even when the call throws', async () => {
    const bh = new Bulkhead({ concurrency: 2 });
    await expect(bh.run(async () => { throw new Error('boom'); })).rejects.toThrow('boom');
    expect(bh.active).toBe(0);
  });
});

describe('Bulkhead — concurrency limiting', () => {
  it('queues calls beyond the concurrency limit', async () => {
    const bh = new Bulkhead({ concurrency: 1, queue: 5 });
    let firstResolve;

    // Fill the slot with a controllable call
    const first = bh.run(() => new Promise((r) => { firstResolve = r; }));
    await Promise.resolve();
    expect(bh.active).toBe(1);

    // Queue two more (their fns won't run until the slot opens)
    const second = bh.run(async () => 'second');
    const third = bh.run(async () => 'third');
    await Promise.resolve();
    expect(bh.queued).toBe(2);

    // Release the first slot — queued calls drain automatically
    firstResolve();
    const [, r2, r3] = await Promise.all([first, second, third]);
    expect(r2).toBe('second');
    expect(r3).toBe('third');
    expect(bh.active).toBe(0);
    expect(bh.queued).toBe(0);
  });

  it('runs up to concurrency calls simultaneously', async () => {
    const bh = new Bulkhead({ concurrency: 3 });
    let peak = 0;
    let inFlight = 0;

    const tasks = Array.from({ length: 6 }, () =>
      bh.run(async () => {
        inFlight++;
        peak = Math.max(peak, inFlight);
        await new Promise((r) => setTimeout(r, 10));
        inFlight--;
      }),
    );

    await Promise.all(tasks);
    expect(peak).toBeLessThanOrEqual(3);
  });
});

describe('Bulkhead — queue overflow', () => {
  it('throws BulkheadError immediately when the queue is full', async () => {
    const bh = new Bulkhead({ concurrency: 1, queue: 1 });
    const resolvers = [];

    // Fill slot
    bh.run(() => new Promise((r) => resolvers.push(r)));
    await Promise.resolve();
    // Fill queue
    bh.run(() => new Promise((r) => resolvers.push(r)));

    // This one should be rejected immediately
    await expect(bh.run(async () => 'overflow')).rejects.toThrow(BulkheadError);

    resolvers.forEach((r) => r());
  });

  it('BulkheadError message mentions the limits', async () => {
    const bh = new Bulkhead({ concurrency: 1, queue: 0 });
    const resolvers = [];
    bh.run(() => new Promise((r) => resolvers.push(r)));
    await Promise.resolve();

    try {
      await bh.run(async () => 'nope');
      expect.fail('should throw');
    } catch (err) {
      expect(err).toBeInstanceOf(BulkheadError);
      expect(err.message).toMatch(/concurrency/i);
    }
    resolvers.forEach((r) => r());
  });
});

describe('Bulkhead — getStats()', () => {
  it('returns a complete snapshot', () => {
    const bh = new Bulkhead({ concurrency: 5, queue: 20 });
    const stats = bh.getStats();
    expect(stats).toEqual({ active: 0, queued: 0, concurrency: 5, queueLimit: 20 });
    expect(() => JSON.stringify(stats)).not.toThrow();
  });
});
