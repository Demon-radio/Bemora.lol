# Contributing to bemora

Thanks for helping make bemora a genuinely maintainable open-source project.

## Quick start

```bash
git clone https://github.com/Demon-radio/Bemora.lol
cd Bemora.lol/bemora

# bemora/ is intentionally excluded from the root pnpm workspace,
# so install its deps from inside bemora/ itself:
pnpm install --ignore-workspace

pnpm test            # unit tests (tests/unit)
pnpm run test:integration  # live-API tests, no key needed for most
pnpm run lint        # node --check over src/examples/tests
pnpm run typecheck   # tsc --noEmit (validates src/types/index.d.ts)
pnpm run format:check  # prettier check for changed files
```

Node 18+ required (`engines: node >= 18`). CI runs 18/20/22.

## How to add a provider

Wiring is hand-rolled (see `.agents/memory/bemora-provider-wiring.md`), so all three edits are required:

1. Create `src/providers/<name>.js` exporting named functions, e.g. `export async function getX(params)`.
2. In `src/index.js`: `import * as <name> from './providers/<name>.js';` (the `.js` extension is required for ESM), add `this.<name> = this._build<Name>();` in the constructor, and add a `_build<Name>()` block returning `{ method: this._wrap('<provider-id>', (p) => <name>.fn(p)) }`.
3. In `src/mcp-server/provider-info.js`: add a `"<name>"` entry with `description`, `requiresKey`, `category`, and `methods` so the MCP server exposes it. After any bulk edit, grep for duplicate keys (JS silently keeps the last duplicate).

Then verify live — syntax checks won't catch dead domains:

```bash
node --check src/index.js
node -e "import('./src/index.js').then(async m => { const a = new m.Bemora(); console.log(await a.<name>.<method>({})); })"
```

Key rules:

- Free/no-key providers are preferred. Before wiring a "no key needed" provider, make a live request first — several once-free endpoints (Etherscan gas oracle v1, exchangerate.host, animechan.xyz) have moved behind paywalls or died.
- Send an explicit `User-Agent` header on Wikipedia/MediaWiki calls (they 403 without one).
- Never log API keys. All log output passes through PII redaction (`src/core/logger.js`).
- Validate host-like params (Fandom subdomain, Wikipedia language) against a strict regex before interpolating into a URL (host-injection risk).

## How to add a plugin

See `examples/plugins/prayer-times.js` for a complete working plugin:

```js
const plugin = {
  name: 'my-plugin',
  install(api) {
    api.myNamespace = {
      async today(p) {
        /* ... */
      },
    };
  },
};
api.use(plugin);

// Shorthand form also works: a bare install function. The name comes
// from fn.pluginName, the function name, or opts.name:
async function myPlugin(api) {
  api.myNamespace = {
    async today(p) {
      /* ... */
    },
  };
}
api.use(myPlugin);
```

- `use(plugin, opts?)` accepts the object form or a bare install function; it is idempotent per name and validates `name` + `install()` (a throwing `install()` registers nothing).
- Optional lifecycle hooks: `beforeRequest({ provider, args })`, `afterResponse({ provider, args, result })`, `onError({ provider, args, error })` — hook errors are swallowed so a bad plugin can't crash the host app.
- Publish as `bemora-plugin-<name>` on npm. Full contract: `docs/plugins.md`.

## Tests

- Unit tests live in `tests/unit/` and must mock external APIs (see `.agents/memory/bemora-test-patterns.md` for the `vi.hoisted` + `vi.mock('../../src/core/http.js')` pattern). Tests must NOT depend on third-party services being online.
- Integration tests live in `tests/integration/` and hit real free APIs. They are excluded from `pnpm test` by design.
- `tests/bemora.test.js` and `tests/core/` are legacy paths not matched by either vitest config — do not add new tests there.

## Commit conventions

- Small, focused commits. Name branches `feature/<what>` or `fix/<what>`.
- Do not commit `.env`, credentials, `node_modules/`, `dist/`, or `coverage/`.
- Update `CHANGELOG.md` under `[Unreleased]` for user-visible changes. Do not invent historical entries.

## Pull requests

Fill out `../.github/pull_request_template.md` (repo root). CI must be green (lint + typecheck + unit + integration + audit). Document any unavoidable breaking change with a deprecation path — backward compatibility is a hard requirement for this package.
