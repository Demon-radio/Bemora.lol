# Caching

Caching is optional, provider-aware, and safe to disable. In-memory (`node-cache`) is the default; swap in Redis when you need shared state:

```js
import { createRedisAdapterFromUrl } from 'bemora/redis';

const api = new Bemora({}, { cacheAdapter: await createRedisAdapterFromUrl(process.env.REDIS_URL) });
```

- `set(key, value, ttlSeconds)` — default TTL 300s. `getWithMeta()` exposes hit/miss + age.
- Gaming/Fandom wiki data caches long (weapons/maps 6h, events 30min); volatile data (crypto tickers) caches short or not at all.
- The Redis adapter wraps every call in `operationTimeoutMs` (default 2000ms) — a stalled Redis returns safe defaults instead of hanging your request.
- Sensitive responses (auth, PII-bearing) are never cached by default.
- Related: stale-while-revalidate (`src/core/stale.js`) powers `smart.*` failover — a stale value beats an outage.
