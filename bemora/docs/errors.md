# Errors

```js
import { BemoraError, AuthError, RateLimitError } from 'bemora/errors';

try {
  await api.stocks.quote({ symbol: 'AAPL' });
} catch (err) {
  if (err instanceof RateLimitError) {
    console.log(err.code); // 'RATE_LIMITED'
    console.log(err.retryAfter); // from Retry-After header, when present
  }
  console.log(err.toJSON()); // { name, code, message, provider, httpStatus?, requestId, timestamp }
}
```

Hierarchy (`src/core/errors.js`): `BemoraError` → `ConfigurationError`, `ProviderError` → (`AuthError`, `RateLimitError`), `ValidationError`, `TimeoutError`, `CircuitBreakerError`. Aliases `BemoraProviderError` / `BemoraRateLimitError` / `BemoraTimeoutError` / `BemoraAuthError` exist for spec compatibility. `wrapProviderError()` maps HTTP 401/403 → `AuthError`, 429 → `RateLimitError`, timeouts → `TimeoutError`.

Secrets never appear in messages. Every error carries `provider`, `requestId`, and `timestamp`.
