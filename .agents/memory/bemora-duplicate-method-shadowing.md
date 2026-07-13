---
name: Duplicate method/key definitions silently shadow code in bemora
description: A JS class body or object literal with two same-named method/key definitions keeps only the last one — no error, no warning. Happened twice in this library.
---

`bemora/src/index.js` and `src/mcp-server/provider-info.js` each independently
ended up with two definitions of the same key (`_buildSmart()` method twice in
the index.js class body; a duplicate `"smart"` entry in provider-info.js's
object literal). JS silently keeps only the last-defined one — the earlier,
richer version became dead code with no syntax error, no runtime error, and no
lint warning.

**Why:** this happens easily when a provider/method is added incrementally
across multiple edits (e.g. adding a manual entry, then later running a
scripted bulk edit over the same file) without checking whether the key
already exists.

**How to apply:** after any bulk/scripted edit to a large config object or
class body in this codebase (provider-info.js, index.js provider wiring),
grep for duplicate top-level keys/method names before trusting the file —
e.g. `grep -c '"category"'` vs. counting actual unique provider keys via
`Object.keys(await import(...))`. A count mismatch means a duplicate is
hiding inside one block rather than missing from another.
