# resilify

**Production-grade resilience for any async call — retries, circuit breaker, bulkhead, rate limiting, and multi-provider failover. One function. Zero config required.**

```bash
npm install resilify
```

[![npm version](https://img.shields.io/npm/v/resilify?style=flat-square&color=6366f1)](https://www.npmjs.com/package/resilify)
[![npm downloads](https://img.shields.io/npm/dm/resilify?style=flat-square&color=8b5cf6)](https://www.npmjs.com/package/resilify)
[![license](https://img.shields.io/npm/l/resilify?style=flat-square&color=06b6d4)](LICENSE)
[![node](https://img.shields.io/node/v/resilify?style=flat-square&color=10b981)](package.json)

---

## The problem

Every codebase that talks to a third-party API ends up rewriting the same defensive code, slightly differently, in a dozen places:

```js
// This, or some variant of it, everywhere you call an external service:
let attempts = 0;
while (attempts < 3) {
  try {
    return await axios.get(url);
  } catch (err) {
    attempts++;
    if (attempts === 3) throw err;
    await sleep(attempts * 500);
  }
}
```

It doesn't back off correctly, doesn't stop hammering a service that's already down, doesn't know a `404` should never be retried, and doesn't have a plan B when the whole provider is unreachable. And it definitely doesn't protect your app from a slow dependency consuming all your threads.

## The fix

```js
import { resilient } from 'resilify';

const rates = await resilient(() => axios.get('https://api.example.com/rates'), {
  key: 'rates-api',
  timeout: 5000,
  retries: 3,
});
```

That one call now:
- **Retries** with exponential backoff + jitter — but only on errors worth retrying (`429`, `5xx`, network timeouts); a `404` or `401` fails immediately.
- **Times out** and aborts calls that hang.
- **Trips a circuit breaker** after repeated failures, so a dead dependency fails fast instead of piling up timeouts under load — and automatically probes for recovery.

---

## Features

| Pattern | What it does |
|---|---|
| **Retry + backoff** | Exponential backoff with jitter, configurable status codes, AbortSignal support |
| **Circuit breaker** | CLOSED → OPEN → HALF_OPEN state machine, per-key, auto-recovery probes |
| **Bulkhead** | Caps concurrent calls to a dependency; queues or rejects excess immediately |
| **Rate limiter** | Client-side outbound quota guard; throws `RateLimitError` before burning quota |
| **Failover** | Sequential fallback across providers; stale-cache last resort |
| **Aggregate** | Concurrent multi-source with `first` / `all` / `average` / `majority` / `median` |
| **Timeout** | Per-call deadline with `TimeoutError` |

---

## Quick start

```js
import { resilient, resilientFailover, Bulkhead } from 'resilify';

// ── Single call ───────────────────────────────────────────────────────────
const data = await resilient(() => fetch('https://api.example.com/data').then(r => r.json()), {
  key: 'my-api',
  timeout: 5000,
  retries: 3,
});

// ── Failover across providers ─────────────────────────────────────────────
const price = await resilientFailover([
  { name: 'coingecko', fn: () => coingecko.getPrice('bitcoin') },
  { name: 'binance',   fn: () => binance.getPrice('BTCUSDT') },
  { name: 'kraken',    fn: () => kraken.getPrice('XBTUSD') },
]);
console.log(price._source); // whichever provider actually answered

// ── Bulkhead: cap concurrent calls ────────────────────────────────────────
const db = new Bulkhead({ concurrency: 5, queue: 20 });
const result = await db.run(() => pool.query('SELECT ...'));
```

---

## API

### `resilient(fn, opts?)`

| option | default | description |
|---|---|---|
| `key` | `'default'` | identifies this call's circuit breaker bucket |
| `timeout` | — | ms before the call is aborted with `TimeoutError` |
| `retries` | `3` | max retry attempts (0 = no retries) |
| `baseDelay` | `300` | base backoff delay in ms |
| `maxDelay` | `5000` | max backoff delay in ms |
| `retryOn` | `[408,429,500,502,503,504]` | HTTP status codes worth retrying |
| `signal` | — | `AbortSignal` — aborts retries immediately when fired |
| `circuitBreaker` | `true` | set `false` to disable the breaker for this call |
| `circuitOptions` | — | `{ failureThreshold, successThreshold, openDuration }` |

### `resilientFailover(chain, opts?)`

Same options as `resilient`, plus:

| option | description |
|---|---|
| `cache` | `{ get, set }` adapter — used for stale-value fallback when every source fails |
| `cacheKey` | key passed to the cache adapter |
| `onProviderError` | `(name, err) => void` — called each time a source fails |

### `Bulkhead`

```js
import { Bulkhead, BulkheadError } from 'resilify';
// or: import { Bulkhead } from 'resilify/bulkhead';

const payments = new Bulkhead({ concurrency: 5, queue: 20 });

try {
  const result = await payments.run(() => paymentsApi.charge(order));
} catch (err) {
  if (err instanceof BulkheadError) {
    // Queue was full — request rejected before ever hitting the API
  }
}

console.log(payments.active); // calls currently in flight
console.log(payments.queued); // calls waiting for a slot
console.log(payments.getStats()); // { active, queued, concurrency, queueLimit }
```

| option | default | description |
|---|---|---|
| `concurrency` | `10` | max simultaneous in-flight calls |
| `queue` | `Infinity` | max calls allowed to wait; excess throw `BulkheadError` immediately |

### `aggregate(sources, opts?)`

Concurrent multi-source combinator.

```js
import { aggregate } from 'resilify';

const result = await aggregate([
  { name: 'provider-a', fn: () => a.getPrice() },
  { name: 'provider-b', fn: () => b.getPrice() },
  { name: 'provider-c', fn: () => c.getPrice() },
], { strategy: 'median', field: 'price' });
```

| strategy | description |
|---|---|
| `'first'` | first source to resolve wins |
| `'all'` | returns all results and failures |
| `'average'` | numeric average of `field` across sources |
| `'majority'` | most frequently occurring value of `field` (mode) |
| `'median'` | median value of `field` — robust to outliers |

### Low-level building blocks

All are exported individually and available as subpath imports:

```js
import { withRetry }             from 'resilify/retry';
import { CircuitBreaker,
         withCircuitBreaker,
         CircuitOpenError }      from 'resilify/circuit';
import { RateLimiter,
         RateLimitError }        from 'resilify/ratelimit';
import { failover, aggregate }   from 'resilify/fallback';
import { Bulkhead, BulkheadError } from 'resilify/bulkhead';
```

#### `withRetry(fn, opts?)`
```js
import { withRetry } from 'resilify/retry';

const result = await withRetry(() => fetch(url), {
  retries: 3,
  baseDelay: 300,
  maxDelay: 5000,
  retryOn: [429, 500, 502, 503, 504],
  signal: abortController.signal, // abort mid-sleep instantly
});
```

#### `CircuitBreaker` (low-level)
```js
import { getBreaker, CircuitOpenError } from 'resilify/circuit';

const breaker = getBreaker('payments-api', { failureThreshold: 5, openDuration: 60_000 });
// States: CLOSED → OPEN → HALF_OPEN → CLOSED
breaker.forceOpen();  // maintenance window
breaker.forceClose(); // after confirmed fix
```

#### `RateLimiter`
```js
import { RateLimiter, RateLimitError } from 'resilify/ratelimit';

const limiter = new RateLimiter();
limiter.configure('openai', { limit: 60, window: 'minute' });

try {
  limiter.record('openai');     // throws RateLimitError if over budget
  await callOpenAI();
} catch (err) {
  if (err instanceof RateLimitError) {
    console.log(`Hit quota for ${err.key}: ${err.limit}/${err.window}`);
  }
}
```

---

## Error types

| Class | When thrown |
|---|---|
| `TimeoutError` | Call exceeded the configured `timeout` |
| `CircuitOpenError` | Circuit is OPEN — call rejected without hitting the function |
| `BulkheadError` | Bulkhead queue is full — call rejected immediately |
| `RateLimitError` | Client-side rate budget exhausted |

All error classes are exported from the main entry point and catchable with `instanceof`.

---

## TypeScript

Full TypeScript support — types ship with the package, no `@types/*` needed.

```ts
import { resilient, Bulkhead, ResilientOptions, BulkheadOptions } from 'resilify';

const opts: ResilientOptions = { key: 'my-api', timeout: 5000 };
const bh = new Bulkhead({ concurrency: 3 });
```

---

## Requirements

- Node.js ≥ 18
- Zero runtime dependencies

---

## License

MIT © [Demon-radio](https://github.com/Demon-radio)
