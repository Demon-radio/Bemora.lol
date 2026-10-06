/**
 * Custom-provider template contract (examples/custom-provider/).
 * Locks the SDK story: a community provider installs via use(), validates
 * inputs with ValidationError, and returns JSON-serializable data.
 * Fully offline.
 */
import { describe, it, expect } from 'vitest';
import Bemora from '../../src/index.js';
import { ValidationError } from '../../src/core/errors.js';
import helloProvider from '../../examples/custom-provider/my-provider.js';

describe('custom provider template', () => {
  it('installs as a namespace via object form', async () => {
    const api = new Bemora({}, { logLevel: 'silent' });
    api.use(helloProvider);
    expect(api.plugins()).toContain('hello');
    expect(await api.hello.greet({ name: 'Bemora' })).toEqual({
      greeting: 'Hello, Bemora!',
      provider: 'hello',
    });
  });

  it('computes stats correctly', async () => {
    const api = new Bemora({}, { logLevel: 'silent' });
    api.use(helloProvider);
    expect(await api.hello.stats({ numbers: [3, 1, 2] })).toEqual({
      count: 3,
      min: 1,
      max: 3,
      mean: 2,
      provider: 'hello',
    });
  });

  it('rejects invalid input with ValidationError (not a crash, not silent)', async () => {
    const api = new Bemora({}, { logLevel: 'silent' });
    api.use(helloProvider);
    let thrown;
    try {
      await api.hello.greet({});
    } catch (e) {
      thrown = e;
    }
    expect(thrown).toBeInstanceOf(ValidationError);
    expect(thrown.code).toBe('VALIDATION_ERROR');
  });

  it('results are JSON-serializable (MCP-safe)', async () => {
    const api = new Bemora({}, { logLevel: 'silent' });
    api.use(helloProvider);
    const res = await api.hello.stats({ numbers: [1] });
    expect(() => JSON.stringify(res)).not.toThrow();
    expect(JSON.parse(JSON.stringify(res))).toEqual(res);
  });
});
