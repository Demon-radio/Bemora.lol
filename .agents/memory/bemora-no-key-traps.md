---
name: Bemora "no free API" traps
description: Previously-free, no-key endpoints that now require a paid key, plus the no-key replacement found for each.
---

Several APIs commonly assumed to be "free, no key" have quietly moved behind a paywall
or deprecated their free tier. Verify live before trusting README claims or adding a
new provider on top of them:

- **Etherscan gas oracle v1** (`api.etherscan.io/api?module=gastracker&action=gasoracle`)
  is deprecated; V2 requires a key. Replacement used: **Owlracle**
  (`api.owlracle.info/v4/eth/gas`) — free, no key, returns `speeds[]` with
  `acceptance`/`maxFeePerGas`/`baseFee` per confirmation-probability tier.
- **exchangerate.host** (`api.exchangerate.host/latest`) now requires a paid
  `access_key`. Replacement: **frankfurter.app** (ECB-backed, ` /latest?from=&to=`),
  free, no key — already used elsewhere in bemora (`currencyhistory.js`).

**Why:** this library aggregates dozens of third-party free APIs with no automated
monitoring of upstream ToS/pricing changes — breakage is silent until exercised live.

**How to apply:** before wiring a "no key needed" provider (new or existing), make a
live request first; don't assume a doc/blog claiming "free, no key" is still true.
