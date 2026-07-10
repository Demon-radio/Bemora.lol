/**
 * Redis cache adapter for bemora.
 *
 * Implements the same interface as the built-in node-cache adapter so it
 * can be dropped in via `api.cache.setAdapter(adapter)`.
 *
 * The Redis client is NOT bundled — pass in your own ioredis or redis@4 instance:
 *
 *   import Redis from 'ioredis';
 *   import { createRedisAdapter } from 'bemora/src/core/cache-redis.js';
 *
 *   const redis = new Redis(process.env.REDIS_URL);
 *   const adapter = createRedisAdapter(redis);
 *
 *   const api = new Bemora({}, { cacheAdapter: adapter });
 *
 * Compatible with: ioredis, @redis/client (redis@4+), upstash/redis.
 */

/**
 * Race a promise against a wall-clock timeout so that a stalled Redis
 * connection never causes bemora callers to hang indefinitely.
 *
 * Rejects with a plain Error when the timeout fires; the adapter's outer
 * try/catch converts that into the appropriate safe default.
 *
 * @param {Promise<T>} promise
 * @param {number} ms
 * @returns {Promise<T>}
 */
function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`[bemora-redis] operation timed out after ${ms}ms`)),
      ms,
    );
    promise.then(
      (v) => { clearTimeout(timer); resolve(v); },
      (e) => { clearTimeout(timer); reject(e); },
    );
  });
}

/**
 * @param {object} redisClient — any client with `get(key)`, `set(key, value, options?)`, `del(key)`, `keys(pattern)` methods.
 * @param {{ prefix?: string, defaultTtl?: number, operationTimeoutMs?: number }} [opts]
 * @returns {object} bemora cache adapter
 */
export function createRedisAdapter(redisClient, {
  prefix = 'bemora:',
  defaultTtl = 300,
  operationTimeoutMs = 2000,
} = {}) {
  function k(key) { return prefix + key; }
  function safe(promise) { return withTimeout(promise, operationTimeoutMs); }

  return {
    async get(key) {
      try {
        const raw = await safe(redisClient.get(k(key)));
        if (raw === null || raw === undefined) return undefined;
        return JSON.parse(raw);
      } catch {
        return undefined;
      }
    },

    async set(key, value, ttlSeconds = defaultTtl) {
      try {
        const serialized = JSON.stringify(value);
        // Support ioredis (EX option) and @redis/client (options object)
        if (typeof redisClient.set === 'function') {
          try {
            // ioredis: set(key, val, 'EX', ttl)
            await safe(redisClient.set(k(key), serialized, 'EX', ttlSeconds));
          } catch {
            // @redis/client: set(key, val, { EX: ttl })
            await safe(redisClient.set(k(key), serialized, { EX: ttlSeconds }));
          }
        }
        return true;
      } catch {
        return false;
      }
    },

    async del(key) {
      try {
        await safe(redisClient.del(k(key)));
        return true;
      } catch {
        return false;
      }
    },

    async flush() {
      try {
        // Get all bemora keys and delete them
        const allKeys = await safe(redisClient.keys(`${prefix}*`));
        if (allKeys.length > 0) {
          await safe(redisClient.del(...allKeys));
        }
        return true;
      } catch {
        return false;
      }
    },

    async has(key) {
      try {
        const exists = await safe(redisClient.exists(k(key)));
        return exists > 0;
      } catch {
        return false;
      }
    },

    async ttl(key) {
      try {
        return await safe(redisClient.ttl(k(key)));
      } catch {
        return -1;
      }
    },

    async keys(pattern = '*') {
      try {
        const allKeys = await safe(redisClient.keys(`${prefix}${pattern}`));
        return allKeys.map((kk) => kk.slice(prefix.length));
      } catch {
        return [];
      }
    },

    /** Adapter metadata for health/debug endpoints */
    _type: 'redis',
    _prefix: prefix,
    _operationTimeoutMs: operationTimeoutMs,
  };
}

/**
 * Create an adapter from a Redis URL (uses ioredis under the hood).
 * Requires ioredis to be installed separately.
 *
 * @param {string} redisUrl
 * @param {{ prefix?: string, defaultTtl?: number }} [opts]
 */
export async function createRedisAdapterFromUrl(redisUrl, opts = {}) {
  let Redis;
  try {
    const mod = await import('ioredis');
    Redis = mod.default || mod;
  } catch {
    throw new Error('[bemora-redis] ioredis is not installed. Run: npm install ioredis');
  }
  const client = new Redis(redisUrl);
  return createRedisAdapter(client, opts);
}
