# resilify

**Wrap any async call — HTTP, DB, third-party SDK — with retries, a circuit breaker, bulkhead, rate limiting, and automatic multi-provider failover. One function. Zero config required.**

## Project layout

```
packages/resilify/       ← the library
  src/
    index.js             ← main entry point; exports resilient(), resilientFailover(), Bulkhead, etc.
    retry.js             ← withRetry() — exponential backoff, AbortSignal support
    circuit.js           ← CircuitBreaker class + registry helpers
    ratelimit.js         ← RateLimiter class + RateLimitError
    fallback.js          ← failover() and aggregate() (multi-source strategies)
    bulkhead.js          ← Bulkhead class + BulkheadError (concurrency limiter)
    index.d.ts           ← TypeScript definitions
  tests/                 ← Vitest test suite
    resilient.test.js
    circuit.test.js
    retry.test.js
    fallback.test.js
    ratelimit.test.js
    bulkhead.test.js
```

## Running tests

```bash
cd packages/resilify
pnpm install --ignore-workspace   # first time only
pnpm test
```

The `resilify/` package is intentionally excluded from the root `pnpm-workspace.yaml`; its dependencies must be installed from inside the package directory.

## Key exports

| Export | Description |
|---|---|
| `resilient(fn, opts?)` | Main entry point: timeout + retry + circuit breaker in one call |
| `resilientFailover(chain, opts?)` | Tries providers in order; each gets its own circuit breaker |
| `withRetry(fn, opts?)` | Retry with exponential backoff and AbortSignal support |
| `withCircuitBreaker(key, fn, opts?)` | Low-level circuit breaker wrapper |
| `CircuitBreaker` | State machine class (CLOSED → OPEN → HALF_OPEN) |
| `CircuitOpenError` | Thrown when a call is rejected by an open circuit |
| `Bulkhead` | Limits concurrent calls to protect downstream services |
| `BulkheadError` | Thrown when the bulkhead queue is full |
| `RateLimiter` | Client-side outbound rate-limit tracker |
| `RateLimitError` | Thrown when a configured budget is exceeded |
| `failover(chain, opts?)` | Sequential fallback across a provider list |
| `aggregate(sources, opts?)` | Concurrent multi-source with first/all/average/majority/median strategies |
| `TimeoutError` | Thrown when a call times out |

## Subpath imports (supported via `exports` map)

```js
import { getBreaker } from 'resilify/circuit';
import { withRetry }  from 'resilify/retry';
import { RateLimiter } from 'resilify/ratelimit';
import { failover, aggregate } from 'resilify/fallback';
import { Bulkhead } from 'resilify/bulkhead';
```

## Publishing

```bash
cd packages/resilify
pnpm publish --no-git-checks --access public
```

Requires `NPM_TOKEN` to be set in the environment or `~/.npmrc`.

## Developer notes

- The `resilify/` package is excluded from the root pnpm workspace by design — install its deps with `pnpm install --ignore-workspace` inside the package directory.
- All source is plain ESM JavaScript (`"type": "module"`). TypeScript definitions are in `src/index.d.ts`.
