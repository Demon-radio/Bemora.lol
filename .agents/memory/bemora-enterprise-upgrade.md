---
name: bemora-enterprise upgrade decisions
description: Key architecture decisions and gotchas from the bemora → bemora-enterprise fork/upgrade
---

## Package
- Package renamed `bemora` → `bemora-enterprise`, version `1.0.0-alpha.1`
- `package.json` lives at `bemora/package.json`

## Provider wiring pattern (index.js)
- All enterprise `_build*` methods inject keys from `this._keys.*` as second argument or spread into `{ ...p, key: this._keys.x }`
- Webhook verify calls must inject secrets *inside the params object*, not as a second arg: `verifyWebhook({ ...p, secret: p.secret ?? this._keys.stripeWebhook })` — provider verify functions take a single destructured object.
- Streaming AI methods (anthropicStream, geminiStream, etc.) are NOT wrapped with `_wrap()` — they return async generators and must bypass the retry/circuit logic.

## SendGrid webhook verification
- SendGrid uses **ECDSA P-256** (not HMAC). Uses `createVerify('sha256')` from `node:crypto`.
- Must import `createVerify` at the **top of the module** (ESM, not inside function).
- The thing to verify is `timestamp + rawBody`; signature is in `X-Twilio-Email-Event-Webhook-Signature` (base64).
- Fail closed: if publicKey is missing, return `{ valid: false }` — never return `valid: true` without crypto verification.

## Logger PII redaction
- `redactSensitive()` scrubs message AND metadata (via `_redactMeta()` which recursively walks object values)
- Patterns: `?api_key=...`, `Bearer ...`, `sk-*` / `pk-*` style tokens

## Pruned providers (Part D)
Deleted from `src/providers/`: chucknorris, kanye, rickmorty, harrypotter, starwars, pokemon, dadjokes, bored, memes, zodiac, advice, randomuser, fun.js
All corresponding imports and `_build*` calls removed from `src/index.js`.

## Enterprise namespace layout on Bemora instance
- `api.payments.{stripe,paypal}` — `api.email.{sendgrid,ses,resend}` — `api.sms.twilio`
- `api.auth.{clerk,auth0}` — `api.jwt` (pure Node crypto)
- `api.storage.{s3,r2,gcs}` — `api.vectordb.{pinecone,qdrant,weaviate,pgvector}`
- `api.sentry` — `api.otel.{wireOtel,withSpan}`
- `api.notifications.{onesignal,pusher,fcm}` — `api.maps.{google,mapbox}`
- `api.searchEnt.{algolia,meilisearch}` — `api.calendar.{google,calendly}`
- `api.captcha.{recaptcha,hcaptcha,turnstile}` — `api.security.{hibp,virustotal,safebrowsing,urlscan}`
- `api.cloudflare.{dns,r2,cache,workers}`
- `api.webhooks.{router,on,route,verify,list}` — `api.costs` — `api.helpers` — `api.keys.rotate`
- `api.withTenant()` = alias for `forTenant()`
- AI extended: `api.ai.{anthropic,anthropicStream,gemini,geminiStream,cohere,cohereStream,mistral,mistralStream,together,togetherStream,perplexity,perplexityStream,...}`

## Top-level exports added (index.js)
`WebhookRouter`, `verifyWebhook`, `recordCost/costSnapshot/costSnapshotForTenant/resetCosts`, `paginate/paginateStream`, `gql/gqlTag/gqlIntrospect`, `uploadFile/uploadPresignedPost/uploadFromUrl`, `redact/redactObject/redactMessages/containsPII`, `createRedisAdapter/createRedisAdapterFromUrl`, `signAwsRequest/presignAwsUrl`, `hmacSign/hmacVerify`

**Why:** Code review flagged that wiring on instance without top-level exports breaks direct-import use cases.
