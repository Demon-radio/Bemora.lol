---
name: Bemora production-readiness audit fixes
description: What was actually fixed vs. skipped from the third-party production audit, and why.
---

## Scope decision
The audit listed 30 items (10 bugs, 10 improvements, 10 enterprise features). Only the
concrete correctness bugs were fixed in-code. Large infrastructure asks (Redis-backed
cache, OpenTelemetry tracing, multi-tenant key management, circuit breakers, audit
logging, SLA tracking) were intentionally left undone — they are architecture decisions
for a hobby/library project, not code bugs, and weren't worth doing speculatively without
the user picking a backend/vendor.

**Why:** the highest-value, lowest-risk work is bug-level correctness fixes; infra
features need a real deployment target to be worth building.

## What was fixed
- Rate limiter (`ratelimit.js`) now throws on limit breach instead of just counting.
- Cache (`cache.js`) accepts a pluggable adapter via `setAdapter()` so a real backend
  (Redis, etc.) can be swapped in later without changing call sites.
- `stale.js` / `events.js` log swallowed errors instead of silently dropping them.
- `dedup.js` race condition fixed by creating+storing the in-flight promise atomically.
- `export.js` uses `fs/promises` instead of `writeFileSync` (no event-loop blocking).
- `monitor.js` guards against overlapping interval runs with a `_running` Set.
- `health.js` rewritten to use the caller's real configured keys and distinguish
  `online` / `unauthorized` (401/403) / `degraded` (5xx) / `offline` (network failure) —
  previously it pinged with fake `test` keys and called any non-throwing response "online".
- `retry.js` is now HTTP-status-aware: only retries 408/429/500/502/503/504; never retries
  4xx client errors like 401/404 (retrying those just burns time and rate-limit quota).
- Host-injection guard added anywhere a param was interpolated directly into a URL
  hostname/subdomain (Wikipedia `language`, Fandom `wiki` in both `fandom.js` and
  `gaming.js`'s `searchGameWiki`) — validated against a strict subdomain/locale regex
  before use.

## Real bug found independently (not in the audit)
Wikipedia's API now 403s any request without a `User-Agent` header ("Please set a
user-agent and respect our robot policy"). This broke both `search.webSearch` and the
health-check ping for wikipedia. Fixed by adding an explicit UA header in both places.
**Why this matters:** any provider call built with axios defaults can silently start
failing when the upstream tightens bot policy — worth an explicit UA on every provider,
not just Wikipedia, if similar failures show up again.
