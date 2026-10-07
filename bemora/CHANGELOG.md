# Changelog

All notable changes to this project are documented in this file.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

### Fixed

- ISS position migrated from dead open-notify.org to wheretheiss.at (`space.getISSPosition` keeps its `{ lat, lon, timestamp }` shape plus altitude/velocity; `spaceExtended` keeps `{ position, timestamp }`). Provider id renamed `open-notify` → `wheretheiss`.

---

## [1.0.0-alpha.6] — 2026-10-07

### Added

- Two new no-key provider namespaces: `api.scholarly` (OpenAlex works search + Crossref DOI metadata for citations/RAG) and `api.registry` (PyPI + npm metadata, OSV.dev vulnerability checks for pinned versions) — all endpoints live-verified, with MCP catalog entries, input schemas, and mocked unit tests. A third candidate (Certificate Transparency via crt.sh) was prototyped and **rejected**: the endpoint hangs 30–45s+ per query, failing the reliability bar — documented here instead of shipped.

---

## [1.0.0-alpha.5] — 2026-10-06

### Added

- MCP input schemas for 344/348 catalog methods (`src/mcp-server/schemas.js`, extracted from the server into an import-safe, unit-tested module); only websocket streams and static lookups keep the generic fallback. Locked by 5 new tests in `tests/unit/mcp-catalog.test.js`.
- Community provider path: `examples/custom-provider/` starter (runnable offline) + `docs/custom-providers.md` guide + `tests/unit/custom-provider-template.test.js` (4 tests).
- 60-second no-key quickstart and "Why Bemora instead of one SDK per API?" value proposition at the top of both READMEs (real, executed calls only).

### Fixed

- Package README badge and transparency note updated (`alpha.2` → `alpha.4`, 327 → 348 tests).

---

## [1.0.0-alpha.4] — 2026-10-05

### Added

- `docs/` (14 pages: getting-started through api-reference) plus `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `ROADMAP.md`, GitHub issue templates (bug/feature/provider/plugin) and PR template.
- Working `pnpm run lint` (node --check, 221 files), `pnpm run typecheck` (tsc --noEmit), `pnpm run format` / `format:check` (prettier); CI now runs lint + typecheck + unit + integration + audit on Node 18/20/22 via pnpm, with a root `.github/workflows/ci.yml` (GitHub only reads workflows from the repo root).
- `examples/plugins/prayer-times.js` (complete working plugin, verified live) and `examples/gaming-crossfire.js` (CrossFire wiki usage, verified live).
- `package.json`: `files`, `bugs`, `publishConfig.access`, `./package.json` export, `@types/node` + `prettier` + `typescript` devDeps.
- Backward-compat aliases (preferred names documented): `food.search` → `searchMeals`, `weatheralerts.active` → `usAlerts`, `smart.crypto` → `cryptoPrice` (with `{ coin }` → `{ id }` normalization).
- Unified plugin contract: `use(plugin, opts?)` and `loadPlugin()` now accept the object form `{ name, install, ...hooks }` and the function form (bare `install(api)`, name from `fn.pluginName` / function name / `opts.name`); `PluginSystem` and `normalizePlugin` exported from the package root with types (`BemoraPluginFn`, `UsePluginOpts`); contract tests in `tests/unit/plugin-contracts.test.js` (15 tests).
- MCP catalog integrity tests in `tests/unit/mcp-catalog.test.js` (6 tests: no stale names, method resolution, enterprise exclusion locked, tool-name charset, key metadata, no duplicate keys).
- Six new no-key provider namespaces: `api.university` (Hipolabs), `api.nutrition`
  (Open Food Facts), `api.disasters` (NASA EONET), `api.blockchain`
  (blockchain.info / BlockCypher / Owlracle), `api.webtools` (favicon/screenshot/
  link-preview metadata), and `api.worldbank` (World Bank economic indicators).
- `api.smart` — bemora's own cross-provider auto-failover layer. Each call
  (`smart.weather`, `smart.currency`, `smart.cryptoPrice`) races/chains multiple
  independent free providers for the same category and falls back to a stale
  cached value if every provider is down, so a single upstream outage never
  becomes a caller-visible outage. Built on the existing `core/fallback.js`
  chain, which previously had only one real consumer.
- `smart.ip`, `smart.translate`, `smart.holidays`, and `smart.weatherAggregate`
  extend the auto-failover layer to IP geolocation, translation, and holidays,
  plus a cross-provider consensus check that averages temperature across every
  reachable weather provider.
- Four more no-key provider namespaces: `api.govspending` (USAspending.gov federal
  award/agency spending), `api.wikidata` (Wikidata entity search), `api.arxiv`
  (arXiv paper search), and `api.biodiversity` (GBIF species/occurrence data).
- `bemora_list_categories` and `bemora_providers_in_category` MCP tools — browse
  the 100+ providers by category (weather, finance, research, government, ...)
  instead of scanning the full flat tool list.
- Every entry in the MCP provider catalog now carries a `category` field.
- `core/health.js` now covers 18 additional no-key providers (university,
  nutrition, disasters, blockchain, worldbank, webtools, wttr, frankfurter, ip,
  nominatim, mymemory, nager.date, hackernews, xkcd, govspending, wikidata,
  arxiv, biodiversity), so `api.health()` gives a real signal for the free tier,
  not just keyed providers.
- Integration tests for the four new provider modules and the four new smart
  layer methods.

### Fixed

- `public-apis.freeExchangeRates` now uses frankfurter.app instead of the
  now-paid `api.exchangerate.host` endpoint.
- Removed a duplicate `_buildSmart()` method definition in `src/index.js` (and a
  matching duplicate `"smart"` entry in `provider-info.js`) that silently
  shadowed an earlier, richer implementation — only the last-defined method in
  a JS class body survives, so half the smart layer's methods were dead code.
- `translate()` and `detectLanguage()` no longer send the literal string
  `'auto'` as MyMemory's source language (the API rejects it with a 200-status
  error payload, not an HTTP error) — both now use MyMemory's real
  auto-detect keyword `'autodetect'`, and `translate()`'s result reports the
  actually-detected source language instead of echoing back `'auto'`.
- `govspending.agencySpending()` was sending an invalid `sort` parameter to
  USAspending's toptier-agencies endpoint (400 error) and mapping the wrong
  response field names; both are now correct and verified against the live API.
- CLI `--version` and MCP server version are now read from `package.json` (were hardcoded `1.4.0` / `4.0.0`, drifting from the real `1.0.0-alpha.3`).
- Removed 13 fictional MCP catalog entries (`pokemon`, `rickmorty`, `starwars`, `harrypotter`, `chucknorris`, `bored`, `kanye`, `dadjokes`, `advice`, `randomuser`, `fun`, `memes`, `zodiac`) for providers pruned in `1.0.0-alpha.1` but still advertised; removed 4 duplicate `"category"` keys. `examples/with-mcp.js` tool names corrected to `<provider>_<method>`.
- `SECURITY.md` supported-versions table corrected (`4.x` → `1.x`).
- Root `.gitignore` now ignores `.env` (it previously didn't — a local `.env` with real tokens was untracked but unignored).
- README accuracy pass (both repo-root and package READMEs): removed all references to pruned providers from tables, examples, feature lists, and the project-structure tree; replaced the fictional CLI commands (`gold`, `images`, `football`) with real ones; corrected `api.observability.*` → `api.sentry` + `api.otel` and `api.auth.jwt` → `api.jwt`; `docs/cli.md` command syntax fixed (`rates USD`, `utils uuid`, `forecast` without `--units`); `docs/providers.md` now lists all 107 namespaces (added `translate`, `food`, `search`, `university`).
- Fixed the `loadPlugin()` function-vs-object contract mismatch: `use()`/`loadPlugin()` accept both forms (see Added).
- `examples/zero-key-demo.js` now calls `smart.cryptoPrice({ id })` (preferred name; the old `smart.crypto({ coin })` shape keeps working via alias).

### Known limitations

- Unit-test coverage thresholds (80% lines/functions/statements, 70% branches)
  only apply to `src/core/**`. Several core modules — `audit.js`, `export.js`,
  `openapi.js`, `pii.js`, `webhooks.js`, `monitor.js`, and the `core/signing/**`
  helpers — currently have 0–20% unit coverage; they are exercised indirectly
  through integration tests but do not yet have dedicated unit tests. This is
  a known gap, not a regression — flagged here for transparency rather than
  silently claimed as covered.
- Prettier `format:check` reports pre-existing deviations across legacy files;
  only changed files were formatted in this pass to keep the diff reviewable.
  Full-tree formatting is tracked in `ROADMAP.md`.
- MCP catalog intentionally excludes the 15 enterprise namespaces (`payments`,
  `email`, `sms`, `auth`, `jwt`, `storage`, `vectordb`, `sentry`,
  `notifications`, `maps`, `searchEnt`, `calendar`, `captcha`, `security`,
  `cloudflare`) until authorization guardrails exist; locked by
  `tests/unit/mcp-catalog.test.js`. Most catalog tools still use the generic
  input schema — per-tool schemas exist for ~19 providers (see `ROADMAP.md`).

---

## [1.0.0-alpha.3] — 2026-07-10

### Fixed

- Fixed npm dist‑tag chaos (latest now points to 3.6.0 stable; alpha releases tagged `next`)
- Toned down "enterprise‑grade" claim while in alpha
- Added transparency note in README about single maintainer, alpha status, and upcoming security audit

---

## [1.0.0-alpha.2] — 2026-07-10

### Fixed

- JWT constructor secret now correctly passed to `sign` and `verify` methods; now works with constructor-configured secrets
  `api = new Bemora({ jwtSecret: 'xxx' })
  await api.jwt.sign({ sub: 'user_123' }) → no longer throws "missing secret" error.

---

## [1.0.0-alpha.1] — 2026-07-10

### Enterprise Uplift of `bemora`

This release represents a full enterprise uplift of the upstream open-source
`bemora` library. The package is still published as `bemora` for backward compatibility,
with a major version reset to 1.0.0-alpha.1.

---

### Added — Enterprise Providers

**Payments**

- `api.payments.stripe` — createCharge, createPaymentIntent, createCustomer, createSubscription, createRefund, verifyWebhook
- `api.payments.paypal` — createOrder, captureOrder, refundCapture (OAuth2 token caching)

**Email**

- `api.email.sendgrid` — send, batch, stats, getSuppressions, verifyWebhook
- `api.email.ses` — send, sendTemplated, getStats (AWS SigV4 signed)
- `api.email.resend` — send, batch, getEmail, cancelEmail, listDomains, verifyWebhook

**SMS**

- `api.sms.twilio` — send, lookup, listMessages, verifyWebhook

**Auth**

- `api.auth.clerk` — getUser, listUsers, getUserCount, verifySession, revokeSession, createUser, deleteUser
- `api.auth.auth0` — getUser, listUsers, getUserInfo, verifyToken (JWKS), blockUser
- `api.jwt` — sign, verify, decode, refresh, generateSecret (pure Node crypto, zero deps)

**Object Storage**

- `api.storage.s3` — presignedGetUrl, presignedPutUrl, upload, download, deleteObject, list
- `api.storage.r2` — same API as S3 targeting Cloudflare R2
- `api.storage.gcs` — HMAC-signed presigned URLs, upload, download, deleteObject, list

**Vector Databases**

- `api.vectordb.pinecone` — upsert, query, deleteVectors, fetch, listIndexes, describeIndex
- `api.vectordb.qdrant` — upsert, query, deletePoints, getPoints, createCollection, listCollections
- `api.vectordb.weaviate` — upsert, query, deleteObjects, getSchema, createClass
- `api.vectordb.pgvector` — createTable, upsert, query, deleteVectors, getById, count

**AI — additional providers**

- `api.ai.anthropic` / `api.ai.anthropicStream` — Claude messages + async iterator streaming
- `api.ai.gemini` / `api.ai.geminiStream` / `api.ai.geminiEmbed` — Gemini 1.5 Flash/Pro
- `api.ai.cohere` / `api.ai.cohereStream` / `api.ai.cohereEmbed` / `api.ai.cohereRerank`
- `api.ai.mistral` / `api.ai.mistralStream` / `api.ai.mistralEmbed`
- `api.ai.together` / `api.ai.togetherStream` / `api.ai.togetherEmbed`
- `api.ai.perplexity` / `api.ai.perplexityStream` — real-time web-grounded answers

**Observability**

- `api.sentry` — captureException, captureMessage, captureEvent (HTTP envelope API, no SDK dep)
- `api.otel` — wireOtel(), withSpan() (auto-spans via event bus; no-op if @opentelemetry/api absent)

**Notifications**

- `api.notifications.onesignal` — send, cancel, getNotification, addDevice
- `api.notifications.pusher` — trigger, authenticateChannel, getChannel (HMAC signed)
- `api.notifications.fcm` — send, sendMulticast (FCM HTTP v1 API)

**Maps**

- `api.maps.google` — geocode, reverseGeocode, directions, distanceMatrix, staticMap, searchPlaces
- `api.maps.mapbox` — geocode, reverseGeocode, directions, staticMap, isochrone

**Search**

- `api.searchEnt.algolia` — search, addObjects, updateObject, deleteObject, saveObjects, listIndexes
- `api.searchEnt.meilisearch` — search, addDocuments, updateDocuments, deleteDocuments, createIndex

**Calendar**

- `api.calendar.google` — listCalendars, listEvents, createEvent, updateEvent, deleteEvent, freeBusy
- `api.calendar.calendly` — getUser, listEventTypes, listEvents, getEvent, cancelEvent, listInvitees

**CAPTCHA**

- `api.captcha.recaptcha` — server-side verify (v2/v3 with score threshold)
- `api.captcha.hcaptcha` — server-side verify
- `api.captcha.turnstile` — Cloudflare Turnstile server-side verify

**Security**

- `api.security.hibp` — checkPassword (k-anonymity, no key), checkEmail, getAllBreaches, getBreach
- `api.security.virustotal` — scanUrl, getUrlReport, getAnalysis, getFileReport, getIpReport
- `api.security.safebrowsing` — checkUrls, checkUrl (Google Safe Browsing v4)
- `api.security.urlscan` — scan, getResult, search

**Cloudflare**

- `api.cloudflare.dns` — listZones, listRecords, createRecord, updateRecord, deleteRecord, purgeCache
- `api.cloudflare.r2` — listBuckets, createBucket, getBucket, deleteBucket, getBucketCors, setBucketCors
- `api.cloudflare.cache` — purgeFiles, purgeTags, purgePrefixes, purgeAll, getSettings, setCacheLevel
- `api.cloudflare.workers` — listScripts, getScript, putScript, deleteScript, KV CRUD

---

### Added — Core Platform Features

- `api.webhooks` — `WebhookRouter` class with `on()`, `route()`, `verify()` and provider dispatch for Stripe, GitHub, Clerk, Twilio, Resend, SendGrid
- `api.costs` — `snapshot()`, `snapshotForTenant()`, `record()` backed by `core/costs.js` with pricing tables for 8 AI providers
- `api.helpers` — `paginate`, `paginateStream`, `gql`, `gqlTag`, `upload` utilities
- `api.withTenant()` — alias for `forTenant()`
- `api.keys.rotate(name, value)` — alias for `setKey()`
- `core/signing/awsSigV4.js` — AWS SigV4 signed headers + presigned URL generation
- `core/signing/hmac.js` — generic HMAC sign/verify with constant-time comparison
- `core/signing/cloudflare.js` — Cloudflare API auth header builder
- `core/pii.js` — PII redaction (email, phone, SSN, card, API keys, URL params)
- `core/costs.js` — per-provider/model/tenant cost tracking
- `core/cache-redis.js` — Redis cache adapter (ioredis / @redis/client compatible)
- `core/paginate.js` — cursor/offset/page paginator + async stream
- `core/gql.js` — lightweight GraphQL client with introspection
- `core/upload.js` — multipart upload, presigned POST, Cloudinary, URL-forwarding
- `core/webhooks.js` — `WebhookRouter` with provider-aware signature dispatch
- URL redaction in `core/logger.js` — scrubs `api_key`, `access_token`, `Bearer` tokens, and `sk-*` patterns from all log output

---

### Removed — Fun / Non-Enterprise Providers (Part D)

The following providers have been removed to reduce attack surface and bundle size:
`chucknorris`, `kanye`, `rickmorty`, `harrypotter`, `starwars`, `pokemon`,
`dadjokes`, `bored`, `memes`, `zodiac`, `advice`, `randomuser`, `fun`

---

### Changed

- Version: `4.0.0` → `1.0.0-alpha.1`
- Constructor now accepts enterprise key groups: `stripeKey`, `paypalClientId/Secret`, `sendgridKey`, `sesAccessKeyId/SecretAccessKey/Region`, `resendKey`, `twilioAccountSid/AuthToken`, `clerkSecretKey`, `auth0Domain/ClientId/ClientSecret`, `jwtSecret`, `s3*`, `r2*`, `gcs*`, `pineconeKey/Host`, `qdrantUrl/Key`, `weaviateUrl/Key`, `sentryDsn`, `onesignalAppId/Key`, `pusherAppId/Key/Secret/Cluster`, `fcmProjectId`, `googleMapsKey`, `mapboxKey`, `algoliaAppId/Key`, `meilisearchUrl/Key`, `googleCalToken`, `calendlyKey`, `recaptchaSecret`, `hcaptchaSecret`, `turnstileSecret`, `hibpKey`, `virustotalKey`, `safebrowsingKey`, `urlscanKey`, `cloudflareToken/ApiKey/Email/AccountId`, `cohereKey`, `mistralKey`, `togetherKey`, `perplexityKey`
- CI workflow added (`.github/workflows/ci.yml`) — Node 18/20/22 matrix, unit + integration tests, `npm audit`
- `CODEOWNERS` file added

---

### Security

- All log messages now pass through PII/key redaction before output
- Webhook signature verification uses constant-time comparison (`crypto.timingSafeEqual`) to prevent timing attacks
- AWS SigV4 implemented from scratch with no third-party crypto dependencies
- JWT implementation uses Node's built-in `crypto` module only

---

## [4.0.0] — upstream bemora (last synced upstream release)

See https://github.com/Demon-radio/Bemora.lol for upstream history.
