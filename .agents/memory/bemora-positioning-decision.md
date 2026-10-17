---
name: Bemora positioning decision — narrow resilience package vs. broad aggregator
description: Why a standalone `resilify` package was extracted from bemora instead of adding more provider breadth, and what "organic adoption" actually requires
---

The user compared bemora's small download count to `public-apis/public-apis`
(449k GitHub stars) and felt the project was worthless. That comparison is
invalid — that repo is a crowd-sourced markdown list with no runtime code,
while bemora is a maintained library with retry/circuit-breaker/failover
logic, tests, and an MCP server. But the underlying goal ("get found without
marketing, like zod") is legitimate and revealed a real positioning problem.

**Why:** Zod-style organic adoption comes from solving one narrow, painful,
universal problem better than alternatives — not from breadth. A 100+-provider
aggregator that mixes trivia/gaming APIs with enterprise providers (Stripe,
Clerk, S3) reads as a hobby project to an enterprise evaluator, even though
its reliability engineering (circuit breakers, smart failover) is genuinely
good and rare in that space.

**How to apply:** When a broad aggregator library wants enterprise-grade,
low-marketing adoption, look for the one piece of its infrastructure that is
independently valuable and generalizable to problems outside the aggregator's
own domain — extract it as its own tightly-scoped package rather than
continuing to add more surface area to the aggregator. In this case: bemora's
`core/{retry,circuit,fallback,ratelimit}.js` (originally coupled to bemora's
provider system) was generalized and extracted into `packages/resilify/` — a
zero-dependency "wrap any async call with retry + circuit breaker + failover"
package usable for any HTTP call, DB query, or SDK, not just bemora's own
providers. Positioning it as solving one hard, common reliability problem is
the actual path to the kind of discovery the user wants; continuing to add
provider #106 is not.
