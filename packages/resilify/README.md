# resilify

**Wrap any async call — HTTP, a third-party SDK, a database query — with retries, a circuit breaker, and automatic multi-provider failover. One function. Zero config required.**

```bash
npm install resilify
```

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

It doesn't back off correctly, doesn't stop hammering a service that's already down, doesn't know a `404` should never be retried, and doesn't have a plan B when the whole provider is unreachable.

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
- Retries with exponential backoff — but only on errors worth retrying (timeouts, `429`, `5xx`); a `404` or `401` fails immediately, because retrying those just burns time.
- Times out and aborts calls that hang.
- Trips a circuit breaker after repeated failures, so a dead dependency fails fast instead of piling up timeouts under load — and automatically probes for recovery.

## Failover across providers

When one provider isn't enough:

```js
import { resilientFailover } from 'resilify';

const price = await resilientFailover([
  { name: 'coingecko', fn: () => coingecko.getPrice('bitcoin') },
  { name: 'binance', fn: () => binance.getPrice('BTCUSDT') },
  { name: 'kraken', fn: () => kraken.getPrice('XBTUSD') },
]);

console.log(price._source); // whichever one actually answered
```

Each source is retried and circuit-broken independently; the chain only moves to the next source once a candidate is truly exhausted. Pass a `cache` adapter (`{ get, set }`) and `cacheKey` to fall back to the last known-good value if every source fails.

## API

### `resilient(fn, opts?)`

| option | default | description |
|---|---|---|
| `key` | `'default'` | identifies this call's circuit breaker / rate-limit bucket |
| `timeout` | none | ms before the call is aborted |
| `retries` | `3` | max retry attempts |
| `baseDelay` / `maxDelay` | `300` / `5000` | exponential backoff bounds (ms) |
| `retryOn` | `[408,429,500,502,503,504]` | status codes worth retrying |
| `circuitBreaker` | `true` | set `false` to disable the breaker for this call |
| `circuitOptions` | — | `{ failureThreshold, successThreshold, openDuration }` |

### `resilientFailover(chain, opts?)`

Same options as `resilient`, plus `cache` and `cacheKey` for stale-value fallback.

### Lower-level building blocks

If you want to compose the pieces yourself rather than use `resilient()`:

```js
import { withRetry } from 'resilify';
import { withCircuitBreaker, getBreaker, getAllBreakerStates } from 'resilify';
import { failover, aggregate } from 'resilify';
import { RateLimiter } from 'resilify';
```

- `withRetry(fn, opts)` — just the backoff logic.
- `withCircuitBreaker(key, fn, opts)` / `getBreaker(key)` — just the breaker; `getBreaker(key).getState()` gives you a serializable snapshot for a health/status endpoint.
- `failover(chain, opts)` — first-success-wins across sources, no retry/breaker wrapping.
- `aggregate(sources, { strategy, field })` — call every source concurrently and combine by `'first' | 'majority' | 'average' | 'all'`.
- `RateLimiter` — a small client-side budget tracker (protect your own outbound quota against a third party's rate limit).

## Why not just use `axios-retry` / `opossum` / `p-retry`?

Those each solve one slice of this (retry-only, breaker-only). `resilify` composes retry + timeout + circuit breaker + multi-provider failover behind one call, with zero dependencies, so you're not hand-wiring three libraries together and hoping their defaults agree with each other.

## License

MIT
