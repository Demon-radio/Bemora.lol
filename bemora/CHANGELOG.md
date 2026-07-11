# Changelog

All notable changes to this project are documented in this file.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

### Added
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

### Fixed
- `public-apis.freeExchangeRates` now uses frankfurter.app instead of the
  now-paid `api.exchangerate.host` endpoint.

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
