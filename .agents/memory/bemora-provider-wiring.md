---
name: Bemora provider wiring
description: How the bemora npm library wires providers into the main Bemora class and MCP server
---

Adding a new provider to `bemora/src/index.js` requires three separate edits, easy to miss one:
1. `import * as x from './providers/x.js';` at the top (must include `.js` extension — omitting it causes `ERR_MODULE_NOT_FOUND` at runtime, not at edit time).
2. `this.x = this._buildX();` in the constructor.
3. A `_buildX() { return { method: this._wrap('x', (p) => x.method(p)) }; }` block near the bottom of the class.

**Why:** the class is hand-wired, not auto-derived from the `providers/` directory — a file existing in `providers/` does nothing until all three edits are made.

**How to apply:** after adding/editing a provider file, always run `node --check src/index.js` and then actually `import()` the class and call the new methods live — syntax-only checks won't catch missing files or wrong import paths.

Separately, `bemora/src/mcp-server/index.js` has its own static `PROVIDER_INFO` object that drives MCP tool generation — it is NOT derived from the `Bemora` class, so new providers/methods won't show up in the MCP server unless added there too.
