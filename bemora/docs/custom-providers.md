# Building your own provider

Bemora is an ecosystem, not just a bundle: any developer can add a provider without forking. Two paths, pick one.

## Path A — community provider (no core changes, recommended)

Ship a plugin that adds a namespace. This is the full provider experience — methods, hooks, validation — with zero changes to `src/`:

```js
// bemora-plugin-jokes/index.js
import { ValidationError, wrapProviderError } from 'bemora/errors';

export default {
  name: 'jokes',
  install(api) {
    api.jokes = {
      async random() {
        /* fetch + wrapProviderError(err, 'jokes') */
      },
    };
  },
};
```

```js
import Bemora from 'bemora';
import jokes from 'bemora-plugin-jokes';

const api = new Bemora();
api.use(jokes);
await api.jokes.random();
```

Working starter: `examples/custom-provider/` (`my-provider.js` + `demo.js`, runnable offline). Contract details: `docs/plugins.md`.

### Rules for a good provider

1. **Method shape:** `async method({ ...params })` → plain JSON-serializable data. MCP serializes results — no `Response` objects, no streams, no class instances.
2. **Validate first:** missing/invalid params throw `ValidationError` (from `bemora/errors`) before any network call.
3. **Wrap HTTP errors:** `throw wrapProviderError(err, '<provider-id>')` so retries, circuit breakers, and metrics classify failures correctly. Reuse the shared `httpClient` (timeouts + User-Agent handled centrally).
4. **No secrets in code:** keys come from the host app (`api` constructor / env), never hardcoded. Never log them.
5. **Respect upstreams:** cache aggressively (`src/core/cache.js`), send a `User-Agent`, stay within rate limits.
6. **Name it `bemora-plugin-<name>`** on npm. (Scoped `@bemora/*` names are reserved for a future official scope — don't publish under them.)

## Path B — first-party provider (core contribution)

For providers that belong in Bemora itself, follow `CONTRIBUTING.md`: new file in `src/providers/`, the 3 wiring edits in `src/index.js` (import + constructor + `_buildX()`), an entry in `src/mcp-server/provider-info.js`, and a schema in `src/mcp-server/schemas.js`. The MCP catalog test fails if any of those drift, so you can't forget one.

## Version compatibility

Providers target the `Bemora` instance API (`use`, namespaces of plain async functions), which is stable within the 1.x line. Breaking the instance API requires a major version — community providers keep working across minors.
