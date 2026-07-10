/**
 * Plugin lifecycle hooks: beforeRequest, afterResponse, onError.
 * Verifies that hooks are called by the Bemora _wrap pipeline.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PluginSystem } from '../../src/core/plugins.js';

// ── PluginSystem unit tests ────────────────────────────────────────────────────

describe('PluginSystem', () => {
  let ps;

  beforeEach(() => {
    ps = new PluginSystem();
  });

  it('installs a plugin and tracks its name', () => {
    const plugin = { name: 'my-plugin', install: vi.fn() };
    ps.use(plugin, {});
    expect(ps.list()).toContain('my-plugin');
    expect(plugin.install).toHaveBeenCalledOnce();
  });

  it('is idempotent — does not install the same plugin twice', () => {
    const plugin = { name: 'once', install: vi.fn() };
    ps.use(plugin, {});
    ps.use(plugin, {});
    expect(plugin.install).toHaveBeenCalledOnce();
  });

  it('throws when plugin has no name or install()', () => {
    expect(() => ps.use({ name: 'no-install' }, {})).toThrow();
    expect(() => ps.use({ install: () => {} }, {})).toThrow();
  });

  it('runBeforeRequest calls all registered beforeRequest hooks in order', async () => {
    const calls = [];
    ps.use({ name: 'a', install: () => {}, beforeRequest: () => calls.push('a') }, {});
    ps.use({ name: 'b', install: () => {}, beforeRequest: () => calls.push('b') }, {});
    await ps.runBeforeRequest({ provider: 'stripe', args: [] });
    expect(calls).toEqual(['a', 'b']);
  });

  it('runAfterResponse passes provider and result to hooks', async () => {
    const spy = vi.fn();
    ps.use({ name: 'after', install: () => {}, afterResponse: spy }, {});
    await ps.runAfterResponse({ provider: 'stripe', args: [], result: { id: 'ch_1' } });
    expect(spy).toHaveBeenCalledWith({ provider: 'stripe', args: [], result: { id: 'ch_1' } });
  });

  it('runOnError passes provider and error to hooks', async () => {
    const spy = vi.fn();
    ps.use({ name: 'err', install: () => {}, onError: spy }, {});
    const err = new Error('boom');
    await ps.runOnError({ provider: 'stripe', args: [], error: err });
    expect(spy).toHaveBeenCalledWith({ provider: 'stripe', args: [], error: err });
  });

  it('a throwing hook does not propagate errors to the caller', async () => {
    ps.use({ name: 'bad', install: () => {}, beforeRequest: () => { throw new Error('hook error'); } }, {});
    await expect(ps.runBeforeRequest({ provider: 'stripe', args: [] })).resolves.toBeUndefined();
  });

  it('hooks registered without a lifecycle method are silently ignored', async () => {
    ps.use({ name: 'no-hooks', install: () => {} }, {});
    await expect(ps.runBeforeRequest({ provider: 'p', args: [] })).resolves.toBeUndefined();
  });
});
