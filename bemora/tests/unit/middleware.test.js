import { describe, it, expect, vi } from 'vitest';
import { MiddlewareChain } from '../../src/core/middleware.js';

describe('MiddlewareChain', () => {
  it('calls the terminal handler when no middleware is registered', async () => {
    const chain = new MiddlewareChain();
    const terminal = vi.fn(async (ctx) => 'result');

    const result = await chain.run({ provider: 'test' }, terminal);
    expect(result).toBe('result');
    expect(terminal).toHaveBeenCalledTimes(1);
  });

  it('middleware is called before the terminal', async () => {
    const chain = new MiddlewareChain();
    const order = [];

    chain.use(async (ctx, next) => {
      order.push('before');
      await next();
      order.push('after');
    });

    await chain.run({}, async () => { order.push('terminal'); return 'ok'; });
    expect(order).toEqual(['before', 'terminal', 'after']);
  });

  it('multiple middleware run in registration order', async () => {
    const chain = new MiddlewareChain();
    const order = [];

    chain.use(async (ctx, next) => { order.push(1); await next(); order.push(4); });
    chain.use(async (ctx, next) => { order.push(2); await next(); order.push(3); });

    await chain.run({}, async () => { order.push('T'); return 'ok'; });
    expect(order).toEqual([1, 2, 'T', 3, 4]);
  });

  it('ctx object is shared across all middleware and terminal', async () => {
    const chain = new MiddlewareChain();
    chain.use(async (ctx, next) => { ctx.step1 = true; await next(); });
    chain.use(async (ctx, next) => { ctx.step2 = true; await next(); });

    const ctx = {};
    await chain.run(ctx, async (ctx) => { ctx.step3 = true; return 'ok'; });
    expect(ctx.step1).toBe(true);
    expect(ctx.step2).toBe(true);
    expect(ctx.step3).toBe(true);
  });

  it('middleware can short-circuit without calling next()', async () => {
    const chain = new MiddlewareChain();
    const terminal = vi.fn(async () => 'from-terminal');

    chain.use(async (ctx, next) => {
      ctx.result = 'short-circuit';
      // Don't call next()
    });

    await chain.run({}, terminal);
    expect(terminal).not.toHaveBeenCalled();
  });

  it('middleware can measure timing using ctx', async () => {
    const chain = new MiddlewareChain();
    chain.use(async (ctx, next) => {
      const start = Date.now();
      await next();
      ctx.latency = Date.now() - start;
    });

    const ctx = {};
    await chain.run(ctx, async () => { await sleep(10); return 'ok'; });
    expect(ctx.latency).toBeGreaterThanOrEqual(5);
  });

  it('returns the terminal result', async () => {
    const chain = new MiddlewareChain();
    chain.use(async (ctx, next) => { await next(); });

    const result = await chain.run({}, async () => ({ data: 'hello' }));
    expect(result).toEqual({ data: 'hello' });
  });

  it('throws if next() is called twice in a single middleware', async () => {
    const chain = new MiddlewareChain();
    chain.use(async (ctx, next) => {
      await next();
      await next(); // second call should throw
    });

    await expect(chain.run({}, async () => 'ok')).rejects.toThrow('next() called multiple times');
  });

  it('throws if middleware argument is not a function', () => {
    const chain = new MiddlewareChain();
    expect(() => chain.use('not-a-function')).toThrow();
    expect(() => chain.use(42)).toThrow();
  });

  it('list() returns the number of registered middleware', () => {
    const chain = new MiddlewareChain();
    expect(chain.list()).toBe(0);
    chain.use(async (ctx, next) => next());
    chain.use(async (ctx, next) => next());
    expect(chain.list()).toBe(2);
  });

  it('clear() removes all middleware', async () => {
    const chain = new MiddlewareChain();
    const fn = vi.fn(async (ctx, next) => next());
    chain.use(fn);
    chain.use(fn);
    chain.clear();

    await chain.run({}, async () => 'ok');
    expect(fn).not.toHaveBeenCalled();
    expect(chain.list()).toBe(0);
  });

  it('use() is chainable', () => {
    const chain = new MiddlewareChain();
    const result = chain.use(async (ctx, next) => next());
    expect(result).toBe(chain);
  });
});

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
