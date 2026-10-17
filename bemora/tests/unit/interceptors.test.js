import { describe, it, expect, vi } from 'vitest';
import { Interceptors } from '../../src/core/interceptors.js';

describe('Interceptors', () => {
  it('passes value through when no interceptors are registered', async () => {
    const interceptors = new Interceptors();
    const value = { provider: 'test', args: [{ city: 'Cairo' }] };
    const result = await interceptors.request.run(value);
    expect(result).toEqual(value);
  });

  it('request interceptor can mutate the config', async () => {
    const interceptors = new Interceptors();
    interceptors.request.use((config) => {
      return { ...config, extra: 'injected' };
    });

    const result = await interceptors.request.run({ provider: 'test', args: [] });
    expect(result.extra).toBe('injected');
  });

  it('response interceptor can transform the result', async () => {
    const interceptors = new Interceptors();
    interceptors.response.use((data) => ({ ...data, enriched: true }));

    const result = await interceptors.response.run({ temp: 30 });
    expect(result.enriched).toBe(true);
    expect(result.temp).toBe(30);
  });

  it('multiple interceptors chain in order', async () => {
    const interceptors = new Interceptors();
    const order = [];

    interceptors.request.use((c) => { order.push(1); return c; });
    interceptors.request.use((c) => { order.push(2); return c; });
    interceptors.request.use((c) => { order.push(3); return c; });

    await interceptors.request.run({});
    expect(order).toEqual([1, 2, 3]);
  });

  it('interceptors can be async', async () => {
    const interceptors = new Interceptors();
    interceptors.request.use(async (c) => {
      await new Promise((r) => setTimeout(r, 5));
      return { ...c, async: true };
    });

    const result = await interceptors.request.run({});
    expect(result.async).toBe(true);
  });

  it('eject removes an interceptor by id', async () => {
    const interceptors = new Interceptors();
    const fn = vi.fn((c) => ({ ...c, modified: true }));
    const id = interceptors.request.use(fn);
    interceptors.request.eject(id);

    const result = await interceptors.request.run({ original: true });
    expect(result.modified).toBeUndefined();
    expect(fn).not.toHaveBeenCalled();
  });

  it('clear removes all interceptors', async () => {
    const interceptors = new Interceptors();
    const fn = vi.fn((c) => c);
    interceptors.request.use(fn);
    interceptors.request.use(fn);
    interceptors.request.clear();

    await interceptors.request.run({});
    expect(fn).not.toHaveBeenCalled();
  });

  it('throws if interceptor is not a function', () => {
    const interceptors = new Interceptors();
    expect(() => interceptors.request.use('not-a-function')).toThrow();
    expect(() => interceptors.request.use(null)).toThrow();
  });

  it('each interceptor receives the output of the previous one', async () => {
    const interceptors = new Interceptors();
    interceptors.response.use((d) => ({ ...d, step: 1 }));
    interceptors.response.use((d) => ({ ...d, step: d.step + 1 }));
    interceptors.response.use((d) => ({ ...d, step: d.step + 1 }));

    const result = await interceptors.response.run({ step: 0 });
    expect(result.step).toBe(3);
  });
});
