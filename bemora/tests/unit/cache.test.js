import { describe, it, expect, beforeEach } from 'vitest';
import * as cache from '../../src/core/cache.js';

beforeEach(() => {
  cache.flush();
});

describe('cache', () => {
  it('set and get a value', () => {
    cache.set('key1', { data: 42 });
    expect(cache.get('key1')).toEqual({ data: 42 });
  });

  it('returns null for missing keys', () => {
    expect(cache.get('nonexistent')).toBeNull();
  });

  it('del removes a key', () => {
    cache.set('key2', 'hello');
    cache.del('key2');
    expect(cache.get('key2')).toBeNull();
  });

  it('flush clears all keys', () => {
    cache.set('a', 1);
    cache.set('b', 2);
    cache.flush();
    expect(cache.get('a')).toBeNull();
    expect(cache.get('b')).toBeNull();
  });

  it('keys returns all cached keys', () => {
    cache.set('x', 1);
    cache.set('y', 2);
    const keys = cache.keys();
    expect(keys).toContain('x');
    expect(keys).toContain('y');
  });

  it('getWithMeta returns a cache miss for missing key', () => {
    const meta = cache.getWithMeta('missing');
    expect(meta.hit).toBe(false);
    expect(meta.value).toBeNull();
  });

  it('getWithMeta returns a cache hit with metadata', () => {
    cache.set('meta-key', { result: 'ok' }, 120);
    const meta = cache.getWithMeta('meta-key');
    expect(meta.hit).toBe(true);
    expect(meta.value).toEqual({ result: 'ok' });
    expect(meta.ttl).toBe(120);
    expect(meta.ageSeconds).toBeGreaterThanOrEqual(0);
  });

  it('setAdapter swaps cache implementation', () => {
    const store = new Map();
    const adapter = {
      get: (k) => store.get(k),
      set: (k, v) => store.set(k, v),
      del: (k) => store.delete(k),
      flush: () => store.clear(),
      keys: () => [...store.keys()],
    };

    cache.setAdapter(adapter);
    cache.set('adapted', 'value');
    expect(cache.get('adapted')).toBe('value');

    // Restore node-cache adapter by flushing
    cache.flush();
  });

  it('setAdapter throws if adapter is missing required methods', () => {
    expect(() => cache.setAdapter({ get: () => {} })).toThrow();
  });
});
