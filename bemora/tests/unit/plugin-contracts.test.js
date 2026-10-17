/**
 * Plugin contract: object form vs function form.
 * Covers valid/invalid plugins, init, registration, errors, multiples, conflicts.
 */
import { describe, it, expect, vi } from 'vitest';
import Bemora from '../../src/index.js';
import { PluginSystem, normalizePlugin } from '../../src/core/plugins.js';

const fresh = () => new Bemora({}, { logLevel: 'silent', retries: 0 });

describe('normalizePlugin', () => {
  it('passes object plugins through unchanged', () => {
    const p = { name: 'x', install: () => {} };
    expect(normalizePlugin(p)).toBe(p);
  });

  it('wraps a named function, keeping attached hooks', () => {
    async function myPlugin() {}
    myPlugin.beforeRequest = async () => {};
    const n = normalizePlugin(myPlugin);
    expect(n.name).toBe('myPlugin');
    expect(n.install).toBe(myPlugin);
    expect(typeof n.beforeRequest).toBe('function');
    expect(n.afterResponse).toBeUndefined();
  });

  it('prefers fn.pluginName over the function name', () => {
    async function whatever() {}
    whatever.pluginName = 'custom';
    expect(normalizePlugin(whatever).name).toBe('custom');
  });

  it('uses opts.name for anonymous functions', () => {
    expect(normalizePlugin(async () => {}, { name: 'anon' }).name).toBe('anon');
  });

  it('throws for anonymous functions without opts.name', () => {
    expect(() => normalizePlugin(async () => {})).toThrow(/must have a name/);
  });

  it('throws for invalid object plugins', () => {
    expect(() => normalizePlugin(null)).toThrow(/must have a name/);
    expect(() => normalizePlugin({ name: 'x' })).toThrow(/must have a name/);
    expect(() => normalizePlugin({ install: () => {} })).toThrow(/must have a name/);
  });
});

describe('Bemora.use contract', () => {
  it('installs a valid object plugin and exposes its namespace', () => {
    const api = fresh();
    api.use({
      name: 'greet',
      install(a) {
        a.greet = { hi: () => 'hi' };
      },
    });
    expect(api.plugins()).toContain('greet');
    expect(api.greet.hi()).toBe('hi');
  });

  it('installs a named function plugin', () => {
    const api = fresh();
    async function metrics(api) {
      api.flag = true;
    }
    api.use(metrics);
    expect(api.plugins()).toContain('metrics');
    expect(api.flag).toBe(true);
  });

  it('runs hooks attached to function plugins', async () => {
    const api = fresh();
    const seen = [];
    async function tracer() {}
    tracer.beforeRequest = async ({ provider }) => seen.push(provider);
    api.use(tracer);
    // utils.uuid is a pure sync util (not _wrap-ped), so drive the pipeline
    // through a wrapped call that fails fast on the missing key — hooks run
    // before the key check, with no network touched.
    await api.weather.current({ city: 'Nowhere' }).catch(() => {});
    expect(seen).toContain('openweathermap');
  });

  it('throws for invalid plugins', () => {
    const api = fresh();
    expect(() => api.use(null)).toThrow();
    expect(() => api.use({ name: 'no-install' })).toThrow();
    expect(() => api.use(async () => {})).toThrow(/must have a name/);
    expect(api.plugins()).toEqual([]);
  });

  it('a throwing install() propagates and registers nothing (retry works)', () => {
    const api = fresh();
    let fail = true;
    const flaky = {
      name: 'flaky',
      install() {
        if (fail) throw new Error('boom');
      },
    };
    expect(() => api.use(flaky)).toThrow('boom');
    expect(api.plugins()).not.toContain('flaky');
    fail = false;
    api.use(flaky);
    expect(api.plugins()).toContain('flaky');
  });

  it('supports multiple plugins with ordered hooks', async () => {
    const api = fresh();
    const order = [];
    api.use({ name: 'one', install() {}, beforeRequest: async () => order.push('one') });
    api.use({ name: 'two', install() {}, beforeRequest: async () => order.push('two') });
    await api.weather.current({ city: 'Nowhere' }).catch(() => {});
    expect(order).toEqual(['one', 'two']);
  });

  it('treats same-name function and object plugins as one (conflict = idempotent)', () => {
    const api = fresh();
    const install = vi.fn();
    async function dup() {}
    api.use({ name: 'dup', install });
    api.use(dup, { name: 'dup' });
    expect(install).toHaveBeenCalledOnce();
    expect(api.plugins()).toEqual(['dup']);
  });

  it('use() is chainable', () => {
    const api = fresh();
    const ret = api.use({ name: 'c', install() {} });
    expect(ret).toBe(api);
  });
});

describe('PluginSystem opts passthrough', () => {
  it('forwards opts.name to function plugins', () => {
    const ps = new PluginSystem();
    ps.use(async () => {}, {}, { name: 'via-opts' });
    expect(ps.list()).toContain('via-opts');
  });
});
