# Configuration

```js
const api = new Bemora(
  {
    weatherKey: process.env.BEMORA_WEATHER_KEY,
    groqKey: process.env.BEMORA_GROQ_KEY,
    // long-form (stripeKey) and short-form (stripe) both work;
    // short-form is what withTenant() uses
  },
  {
    retries: 2, // default; exponential backoff with jitter
    timeout: 30_000, // global default (ms)
    timeouts: { anime: 45_000 }, // per-provider override
    logLevel: 'info', // silent | error | warn | info | debug
    validateResponses: false, // opt-in zod validation (src/core/validate.js)
    cacheHeaders: false, // opt-in _cacheControl/_etag metadata
  }
);
```

## Precedence

Constructor keys beat environment variables. `setKey()` / `keys.rotate(name, value)` hot-rotates a key without restarting. `withTenant(id, keys)` (alias `forTenant()`) returns an isolated instance that inherits options but only sees the tenant's keys.

## Environment variables

Every key maps to `BEMORA_<NAME>_KEY` (see `.env.example`). Never commit `.env` — it is git-ignored at both the repo root and in `bemora/`.
