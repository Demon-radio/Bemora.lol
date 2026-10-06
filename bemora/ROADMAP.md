# Roadmap

Organized by area. Items marked ✅ are done. Everything else is a direction, not a promise — no dates, no fake commitments.

## Core

- ✅ Request pipeline: timeout + retry (exponential backoff) + circuit breaker + rate-limit tracking + cache metadata in `_wrap()` (`src/index.js`, `src/core/{retry,circuit,ratelimit,cache}.js`)
- ✅ Per-provider timeouts (`options.timeouts[provider]`), `AbortSignal` support
- ✅ Stale-while-revalidate (`src/core/stale.js`), request dedup (`src/core/dedup.js`), batch runner (`src/core/batch.js`)
- 🔲 Full eslint config with style rules (today `pnpm run lint` is `node --check` syntax verification only)
- 🔲 Prettier-clean the full tree (today only changed files are formatted; legacy files predate the config)

## Providers

- ✅ 90+ providers across weather, finance, research, geo, media, sports, science, government, developer tools, gaming (incl. CrossFire via Fandom MediaWiki API), AI
- ✅ `smart.*` auto-failover layer (CoinGecko → Binance → stale cache, etc.)
- ✅ Community provider path: any developer can ship `bemora-plugin-*` adding a namespace via `use()` — starter in `examples/custom-provider/`, contract in `docs/custom-providers.md`, pattern locked by `tests/unit/custom-provider-template.test.js`
- ✅ Removed dead/fictional providers from MCP catalog (`pokemon`, `harrypotter`, `starwars`, `rickmorty`, `chucknorris`, `bored`, `kanye`, `dadjokes`, `advice`, `randomuser`, `fun`, `memes`, `zodiac` — pruned in `1.0.0-alpha.1`, catalog fixed after)
- 🔲 Live provider health dashboard (expand `core/health.js` coverage beyond the current 18 no-key providers)
- 🔲 MCP exposure for enterprise namespaces (`payments`, `email`, `sms`, `auth`, `storage`, `vectordb`, …) — intentionally not exposed yet; needs authZ guardrails before AI-tool access

## Plugins

- ✅ `PluginSystem` with `beforeRequest`/`afterResponse`/`onError` hooks; unified contract — object form `{ name, install, ...hooks }` and function form (bare `install(api)`, name from `fn.pluginName` / function name / `opts.name`); `loadPlugin('bemora-plugin-*')` accepts both; contract tests in `tests/unit/plugin-contracts.test.js`
- ✅ Complete example: `examples/plugins/prayer-times.js`
- ✅ Provider SDK docs: `docs/custom-providers.md` (community path + first-party path + rules)
- 🔲 First-party `bemora-plugin-redis-cache` package

## MCP

- ✅ 90+ tools generated from `provider-info.js`, `bemora_status`/`bemora_metrics`/`bemora_rate_limits`/`bemora_list_categories`/`bemora_providers_in_category` observability tools
- ✅ Per-tool `inputSchema` for 344/348 catalog methods (`src/mcp-server/schemas.js`, locked by tests); only websocket streams and static lookups keep the generic fallback
- 🔲 Rich descriptions for all tools (most are still `Call {provider}.{method} method`)

## CLI

- ✅ `bemora` CLI with weather/currency/news/crypto/utils/wikipedia/books commands; version now read from `package.json`
- 🔲 Cover remaining 90+ providers (gaming/CrossFire, smart failover, enterprise) in the CLI

## AI

- ✅ `ai.groq`/`ai.openai`/`ai.anthropic`/`ai.gemini`/`ai.cohere`/`ai.mistral`/`ai.together`/`ai.perplexity` + streaming variants (passthrough async generators, not `_wrap()`-ed)
- ✅ `examples/agent-power.js` tool map for agent builders
- 🔲 Structured-output helpers (JSON-schema-constrained responses) for agent reliability

## Documentation

- ✅ `docs/` skeleton (getting-started through api-reference)
- ✅ 60-second no-key quickstart + value proposition on both READMEs (executed calls only)
- 🔲 Auto-generate `docs/api-reference.md` from `src/index.js` + `provider-info.js` so they can't drift again

## Developer experience

- ✅ `pnpm run lint` / `typecheck` / `format` / `format:check` scripts; CI runs lint + typecheck + unit + integration + audit on Node 18/20/22
- ✅ Root `.github/workflows/ci.yml` (GitHub only reads workflows from the repo root; `bemora/.github/workflows/ci.yml` alone never ran)
- 🔲 Changesets or semantic-release for versioning (today releases are manual `npm version` + GitHub Release + `npm publish`)

## Security

- ✅ PII/key redaction in logger, constant-time webhook comparison, AWS SigV4 from scratch, SSRF guards in `websites.js`, `SECURITY.md` reporting policy
- 🔲 Automated secret scanning in CI (e.g. gitleaks) — today protection is `.gitignore` + review only

## Performance

- ✅ Cache adapters (in-memory + Redis with hang-resilience timeouts), dedup, batch parallelism
- 🔲 Benchmarks for the `_wrap()` pipeline overhead (never measured; don't optimize blindly)
