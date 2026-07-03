---
name: Bemora dead/broken APIs
description: Known dead endpoints, missing provider files, and data-shape quirks found in the bemora library's third-party API integrations
---

Found and fixed during a coverage-expansion pass (as of July 2026):
- `statsapi.web.nhl.com` (used by `hockey.js`) is dead (DNS no longer resolves). Current working NHL endpoint is `api-web.nhle.com/v1/...` (e.g. `/standings/now`, `/player/{id}/landing`).
- `src/providers/baseball.js` was referenced in `index.js` but the file didn't exist at all — silently broke the whole module (any import of index.js failed). Rebuilt using the free `statsapi.mlb.com/api/v1` endpoints (teams, schedule).
- `hp-api.onrender.com` (Harry Potter API) returns `wand` as a nested `{wood, core, length}` object, not a flat string — many records also have legitimately empty/null wand or actor fields (non-canonical characters), which is real data, not a bug.

**Why:** this library aggregates ~90 free third-party public APIs with no automated tests; provider breakage is silent until manually exercised.

**How to apply:** when asked to "fix broken providers" in this library, don't just syntax-check — actually `import()` and call each namespace's methods live against the real API to catch dead domains, missing files, and shape mismatches.
