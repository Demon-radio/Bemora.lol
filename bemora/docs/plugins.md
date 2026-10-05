# Plugins

```js
import Bemora from 'bemora';
const api = new Bemora();

// Object form (full contract)
const prayerPlugin = {
  name: 'prayer-times',
  install(api) {
    api.prayerTimes = {
      async today({ city, country = 'EG' }) {
        /* ... */
      },
    };
  },
  async beforeRequest({ provider }) {
    /* observe/mutate */
  },
  async afterResponse({ provider, result }) {
    /* observe/mutate */
  },
  async onError({ provider, error }) {
    /* observe */
  },
};
api.use(prayerPlugin);

// Function form (shorthand) — name from fn.pluginName, the function
// name, or opts.name. Hooks attach as function properties.
async function prayerTimes(api) {
  api.prayerTimes = {
    async today({ city }) {
      /* ... */
    },
  };
}
prayerTimes.beforeRequest = async ({ provider }) => console.log(provider);
api.use(prayerTimes);
api.use(async () => {}, { name: 'anonymous-needs-opts-name' });
```

## Contract

- `use(plugin, opts?)` accepts `{ name, install, ...hooks }` or a bare `install(api)` function. Returns `this` (chainable).
- `use()` validates before registering: a missing name or `install` throws immediately.
- `install(api)` runs synchronously at registration; if it throws, nothing is registered (fail-fast, safe to retry).
- Registration is idempotent per name — a second `use()` with an existing name is a no-op (this also resolves name conflicts deterministically: first wins).
- Optional hooks: `beforeRequest({ provider, args })`, `afterResponse({ provider, args, result })`, `onError({ provider, args, error })`. Hook errors are swallowed so a bad plugin can't crash the host.
- No runtime uninstall: create a fresh `Bemora` instance (or `withTenant()`) for isolation.
- `loadPlugin('bemora-plugin-foo')` dynamic-imports an npm package and calls `use()` on its default (or named `plugin`) export, in either form. Publish yours as `bemora-plugin-<name>`.
- See the complete example in `examples/plugins/prayer-times.js` and the contract tests in `tests/unit/plugin-contracts.test.js`.
