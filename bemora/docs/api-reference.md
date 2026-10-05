# API reference

> This page indexes the surface. Signatures live in JSDoc + `src/types/index.d.ts`. Auto-generation from `src/index.js` is tracked in `ROADMAP.md`.

## Construction / lifecycle

- `new Bemora(keys, options)` · `withTenant(id, keys)` / `forTenant(id, keys)` · `setKey(name, value)` / `keys.rotate(name, value)` · `use(plugin)` / `loadPlugin(name)` · `on/off(event, fn)` · `watch(resource, params, onData)` / `unwatch(id)`

## Observability

- `health()` / `healthOf(name)` · `rateLimits()` / `rateLimit(p)` · `circuits.status()` / `statusOf()` / `reset()` / `resetAll()` / `open()` / `close()` · `getMetrics()` / `metricsPrometheus()` · `providers.status()` / `statusOf()` / `reset()` · `toOpenAPI()` · `monitor` · `export`

## Namespaces

See [providers](providers.md) for the full table. Two call patterns:

```js
await api.weather.current({ city: 'Cairo' }); // keyed (throws ConfigurationError without BEMORA_WEATHER_KEY)
await api.space.issPosition(); // no key, works out of the box
```

## Platform helpers (`helpers`, top-level exports)

- `paginate` / `paginateStream` (`bemora/paginate`) · `gql` / `gqlTag` (`bemora/gql`) · `upload` (`bemora/upload`) · `batch` (`bemora/batch`) · `WebhookRouter` + `verifyWebhook` (`bemora/webhooks`) · `recordCost` / `costSnapshot` · `redact*` / `containsPII` · `createRedisAdapter*` (`bemora/redis`) · `signAwsRequest` / `hmacSign` / `hmacVerify`
