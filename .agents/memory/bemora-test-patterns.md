---
name: Bemora test patterns and key naming
description: ESM mock patterns, constructor key naming conventions, and cache-redis hang resilience for bemora-enterprise.
---

## Constructor key naming
The Bemora constructor accepts **long-form** key names (`stripeKey`, `anthropicKey`, etc.) and maps them to short internal names (`_keys.stripe`, `_keys.anthropic`). Short-form aliases were added so `withTenant('id', { stripe: 'sk_...' })` also works — every simple string key now checks both `keys.stripeKey || keys.stripe`.

**Object-valued keys** (s3, twilio, paypal, auth0, ses, r2, gcs, qdrant, weaviate, pusher, onesignal, algolia, meilisearch, cloudflare, fcm) accept either the full object directly (`keys.s3`) or individual long-form fields (`keys.s3AccessKeyId`). Pass the object via the short-form name.

**Pinecone** is stored as a plain API-key string in `_keys.pinecone` (normalized from either `pineconeKey` or `pinecone` or `{ apiKey, host }.apiKey`). All `pineconeProvider.*` functions expect a plain string `apiKey` argument.

**Why:** `forTenant(tenantId, keys)` just calls `new Bemora(keys, this._options)` — tenants need to pass short-form keys to get isolation working correctly.

## ESM mock pattern for vitest
```js
const { mockGet, mockPost, mockPut } = vi.hoisted(() => ({
  mockGet: vi.fn(), mockPost: vi.fn(), mockPut: vi.fn(),
}));
vi.mock('../../src/core/http.js', () => ({
  httpClient: vi.fn(() => ({ get: mockGet, post: mockPost, put: mockPut })),
}));
```
Mocks must be declared at the top level of the file, before any `import`. `vi.hoisted` makes the mock factories available before module evaluation.

## Error assertion: single-call pattern
Never call the same function twice to check both the instance type and the properties — the second call will have no mock set up. Use one call and capture the error:
```js
let thrown;
try { await someProvider.call(); } catch (e) { thrown = e; }
expect(thrown).toBeInstanceOf(AuthError);
expect(thrown.code).toBe('AUTH_ERROR');
```

## Cache-redis hang resilience
`createRedisAdapter` wraps every client call in `withTimeout(promise, operationTimeoutMs)` (default 2000ms). Stalled connections never block bemora callers — each method returns its safe default (undefined, false, []) within the timeout. Configure via `{ operationTimeoutMs: 500 }` for fast tests.

**Why:** Without timeout protection, a misconfigured Redis (e.g. wrong host, firewall block) causes a silent hang — the provider call never settles and the end-user request times out with no useful error.
