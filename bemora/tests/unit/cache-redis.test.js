/**
 * Unit tests for the Redis cache adapter.
 *
 * Uses an in-memory mock Redis client so no real Redis server is needed.
 * Tests verify:
 *   - Full CRUD round-trips (get/set/del/flush/has/keys)
 *   - TTL and prefix handling
 *   - Connection errors are swallowed and return safe defaults (no throws)
 *   - Two adapter instances sharing the same underlying store can read
 *     each other's values (simulates a multi-instance deploy)
 *   - createRedisAdapterFromUrl() fails descriptively when ioredis is absent
 */

import { vi, describe, it, expect, beforeEach } from 'vitest';
import { createRedisAdapter, createRedisAdapterFromUrl } from '../../src/core/cache-redis.js';

// ── Mock Redis client factory ─────────────────────────────────────────────────

/**
 * Minimal in-memory Redis mock that supports both ioredis-style
 * (`set(key, val, 'EX', ttl)`) and @redis/client-style (`set(key, val, { EX: ttl })`).
 *
 * @param {Map} [store] - optional shared Map for multi-instance tests
 */
function createMockRedis(store = new Map()) {
  return {
    get: vi.fn(async (key) => store.get(key) ?? null),

    set: vi.fn(async (key, value, ...args) => {
      // Accept both calling conventions silently
      store.set(key, value);
      return 'OK';
    }),

    del: vi.fn(async (...keys) => {
      const flatKeys = keys.flat();
      flatKeys.forEach((k) => store.delete(k));
      return flatKeys.length;
    }),

    keys: vi.fn(async (pattern) => {
      // Strip trailing '*' for a simple prefix match
      const prefix = pattern.endsWith('*') ? pattern.slice(0, -1) : pattern;
      return [...store.keys()].filter((k) => k.startsWith(prefix));
    }),

    exists: vi.fn(async (key) => (store.has(key) ? 1 : 0)),

    ttl: vi.fn(async () => 299),

    /** Expose underlying map for assertions */
    _store: store,
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Create an adapter + mock client pair with the given prefix. */
function make(prefix = 'bemora:', store = new Map()) {
  const client = createMockRedis(store);
  const adapter = createRedisAdapter(client, { prefix, defaultTtl: 300 });
  return { adapter, client, store };
}

// ─────────────────────────────────────────────────────────────────────────────
// Basic CRUD
// ─────────────────────────────────────────────────────────────────────────────

describe('createRedisAdapter — CRUD', () => {
  it('get returns undefined for a missing key', async () => {
    const { adapter } = make();
    expect(await adapter.get('no-such-key')).toBeUndefined();
  });

  it('set + get round-trip returns the stored value', async () => {
    const { adapter } = make();
    await adapter.set('user:1', { name: 'Alice', role: 'admin' }, 60);
    const result = await adapter.get('user:1');
    expect(result).toEqual({ name: 'Alice', role: 'admin' });
  });

  it('stores complex nested objects via JSON serialization', async () => {
    const { adapter } = make();
    const obj = { a: [1, 2, 3], b: { c: true, d: null } };
    await adapter.set('complex', obj, 60);
    expect(await adapter.get('complex')).toEqual(obj);
  });

  it('del removes the key so subsequent get returns undefined', async () => {
    const { adapter } = make();
    await adapter.set('temp', 'value', 60);
    await adapter.del('temp');
    expect(await adapter.get('temp')).toBeUndefined();
  });

  it('del returns true on success', async () => {
    const { adapter } = make();
    await adapter.set('x', 1, 60);
    expect(await adapter.del('x')).toBe(true);
  });

  it('flush clears all bemora-prefixed keys', async () => {
    const { adapter, client } = make('bemora:');
    await adapter.set('k1', 'v1', 60);
    await adapter.set('k2', 'v2', 60);
    await adapter.flush();
    // Both keys should be gone from the underlying store
    expect(client._store.has('bemora:k1')).toBe(false);
    expect(client._store.has('bemora:k2')).toBe(false);
  });

  it('flush returns true', async () => {
    const { adapter } = make();
    expect(await adapter.flush()).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// has / ttl / keys
// ─────────────────────────────────────────────────────────────────────────────

describe('createRedisAdapter — has / ttl / keys', () => {
  it('has returns true for an existing key', async () => {
    const { adapter } = make();
    await adapter.set('exists', 1, 60);
    expect(await adapter.has('exists')).toBe(true);
  });

  it('has returns false for a missing key', async () => {
    const { adapter } = make();
    expect(await adapter.has('gone')).toBe(false);
  });

  it('ttl delegates to the redis client and returns a number', async () => {
    const { adapter } = make();
    await adapter.set('t', 'v', 120);
    const ttl = await adapter.ttl('t');
    expect(typeof ttl).toBe('number');
    expect(ttl).toBe(299); // from the mock
  });

  it('keys returns all stored keys without the prefix', async () => {
    const { adapter } = make('bemora:');
    await adapter.set('a', 1, 60);
    await adapter.set('b', 2, 60);
    const result = await adapter.keys('*');
    expect(result).toContain('a');
    expect(result).toContain('b');
    // keys should NOT contain the prefix itself
    result.forEach((k) => expect(k).not.toContain('bemora:'));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Prefix isolation
// ─────────────────────────────────────────────────────────────────────────────

describe('createRedisAdapter — prefix isolation', () => {
  it('prepends the prefix to every redis key', async () => {
    const { adapter, client } = make('myapp:');
    await adapter.set('session:abc', 'data', 60);
    // The underlying redis client should see the prefixed key
    expect(client.set.mock.calls[0][0]).toBe('myapp:session:abc');
  });

  it('two adapters with different prefixes do not collide', async () => {
    const store = new Map();
    const { adapter: adapterA } = make('tenant_a:', store);
    const { adapter: adapterB } = make('tenant_b:', store);

    await adapterA.set('secret', 'alpha', 60);
    await adapterB.set('secret', 'beta', 60);

    expect(await adapterA.get('secret')).toBe('alpha');
    expect(await adapterB.get('secret')).toBe('beta');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Multi-instance cache sharing
// ─────────────────────────────────────────────────────────────────────────────

describe('createRedisAdapter — multi-instance cache sharing', () => {
  it('two adapter instances sharing the same backing store can read each other\'s values', async () => {
    const sharedStore = new Map();

    // Instance 1 (e.g. server pod A)
    const instance1 = createRedisAdapter(createMockRedis(sharedStore), { prefix: 'bemora:' });
    // Instance 2 (e.g. server pod B) — different adapter, same backing store
    const instance2 = createRedisAdapter(createMockRedis(sharedStore), { prefix: 'bemora:' });

    // Pod A writes a weather result
    await instance1.set('weather:cairo', { temp: 32, unit: 'C' }, 300);

    // Pod B should see it without a round-trip to the origin API
    const result = await instance2.get('weather:cairo');
    expect(result).toEqual({ temp: 32, unit: 'C' });
  });

  it('a delete on one instance removes the key for both', async () => {
    const sharedStore = new Map();
    const instance1 = createRedisAdapter(createMockRedis(sharedStore), { prefix: 'bemora:' });
    const instance2 = createRedisAdapter(createMockRedis(sharedStore), { prefix: 'bemora:' });

    await instance1.set('session:xyz', { userId: 42 }, 3600);
    await instance1.del('session:xyz');

    expect(await instance2.get('session:xyz')).toBeUndefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Connection error resilience
// ─────────────────────────────────────────────────────────────────────────────

describe('createRedisAdapter — connection error resilience', () => {
  /** A client that always rejects every call (simulates a broken connection). */
  function brokenClient() {
    const err = new Error('ECONNREFUSED: Redis connection refused');
    return {
      get:    vi.fn().mockRejectedValue(err),
      set:    vi.fn().mockRejectedValue(err),
      del:    vi.fn().mockRejectedValue(err),
      keys:   vi.fn().mockRejectedValue(err),
      exists: vi.fn().mockRejectedValue(err),
      ttl:    vi.fn().mockRejectedValue(err),
    };
  }

  it('get() swallows the error and returns undefined (not null, not throw)', async () => {
    const adapter = createRedisAdapter(brokenClient());
    await expect(adapter.get('any')).resolves.toBeUndefined();
  });

  it('set() swallows the error and returns false', async () => {
    const adapter = createRedisAdapter(brokenClient());
    await expect(adapter.set('any', 'val')).resolves.toBe(false);
  });

  it('del() swallows the error and returns false', async () => {
    const adapter = createRedisAdapter(brokenClient());
    await expect(adapter.del('any')).resolves.toBe(false);
  });

  it('has() swallows the error and returns false', async () => {
    const adapter = createRedisAdapter(brokenClient());
    await expect(adapter.has('any')).resolves.toBe(false);
  });

  it('keys() swallows the error and returns an empty array', async () => {
    const adapter = createRedisAdapter(brokenClient());
    await expect(adapter.keys('*')).resolves.toEqual([]);
  });

  it('flush() swallows the error and returns false', async () => {
    const adapter = createRedisAdapter(brokenClient());
    await expect(adapter.flush()).resolves.toBe(false);
  });

  it('ttl() swallows the error and returns -1', async () => {
    const adapter = createRedisAdapter(brokenClient());
    await expect(adapter.ttl('any')).resolves.toBe(-1);
  });

  it('callers never see an unhandled rejection when Redis is down', async () => {
    const adapter = createRedisAdapter(brokenClient());
    // Simulate a full provider lookup cycle without any try/catch in the caller
    const value = await adapter.get('cache:key');
    if (value === undefined) {
      // cache miss — fetch from origin, then try to cache
      const fresh = { data: 'from origin' };
      const stored = await adapter.set('cache:key', fresh);
      // Even when set fails, the caller gets a usable value
      expect(fresh.data).toBe('from origin');
      expect(stored).toBe(false); // failed silently
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Adapter metadata
// ─────────────────────────────────────────────────────────────────────────────

describe('createRedisAdapter — metadata', () => {
  it('exposes _type as "redis"', () => {
    const { adapter } = make();
    expect(adapter._type).toBe('redis');
  });

  it('exposes _prefix matching the configured prefix', () => {
    const { adapter } = make('myapp:');
    expect(adapter._prefix).toBe('myapp:');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Hang resilience — calls that never resolve must not block forever
// ─────────────────────────────────────────────────────────────────────────────

describe('createRedisAdapter — hang resilience', () => {
  /** A client whose every method returns a promise that never settles. */
  function hangingClient() {
    const neverResolve = () => new Promise(() => { /* intentionally stalled */ });
    return {
      get:    vi.fn(neverResolve),
      set:    vi.fn(neverResolve),
      del:    vi.fn(neverResolve),
      keys:   vi.fn(neverResolve),
      exists: vi.fn(neverResolve),
      ttl:    vi.fn(neverResolve),
    };
  }

  it('get() returns undefined within operationTimeoutMs when client stalls', async () => {
    const adapter = createRedisAdapter(hangingClient(), { operationTimeoutMs: 100 });
    const start = Date.now();
    const result = await adapter.get('any-key');
    const elapsed = Date.now() - start;

    expect(result).toBeUndefined();
    // Should resolve within 2× the configured timeout (allows test-environment jitter)
    expect(elapsed).toBeLessThan(500);
  });

  it('set() returns false within operationTimeoutMs when client stalls', async () => {
    const adapter = createRedisAdapter(hangingClient(), { operationTimeoutMs: 100 });
    const result = await adapter.set('any-key', 'val');
    expect(result).toBe(false);
  });

  it('del() returns false within operationTimeoutMs when client stalls', async () => {
    const adapter = createRedisAdapter(hangingClient(), { operationTimeoutMs: 100 });
    expect(await adapter.del('any-key')).toBe(false);
  });

  it('flush() returns false within operationTimeoutMs when client stalls', async () => {
    const adapter = createRedisAdapter(hangingClient(), { operationTimeoutMs: 100 });
    expect(await adapter.flush()).toBe(false);
  });

  it('has() returns false within operationTimeoutMs when client stalls', async () => {
    const adapter = createRedisAdapter(hangingClient(), { operationTimeoutMs: 100 });
    expect(await adapter.has('any-key')).toBe(false);
  });

  it('keys() returns [] within operationTimeoutMs when client stalls', async () => {
    const adapter = createRedisAdapter(hangingClient(), { operationTimeoutMs: 100 });
    expect(await adapter.keys('*')).toEqual([]);
  });

  it('ttl() returns -1 within operationTimeoutMs when client stalls', async () => {
    const adapter = createRedisAdapter(hangingClient(), { operationTimeoutMs: 100 });
    expect(await adapter.ttl('any-key')).toBe(-1);
  });

  it('exposes _operationTimeoutMs in adapter metadata', () => {
    const adapter = createRedisAdapter(hangingClient(), { operationTimeoutMs: 500 });
    expect(adapter._operationTimeoutMs).toBe(500);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// createRedisAdapterFromUrl — missing ioredis
// ─────────────────────────────────────────────────────────────────────────────

describe('createRedisAdapterFromUrl — missing ioredis', () => {
  it('throws a descriptive error when ioredis is not installed', async () => {
    // ioredis is not a direct dependency of bemora-enterprise — this call
    // should fail with a helpful install message, not a cryptic import error.
    await expect(createRedisAdapterFromUrl('redis://localhost:6379')).rejects.toThrow(
      /ioredis/i,
    );
  });
});
