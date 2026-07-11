---
name: Bemora workspace install quirk
description: bemora/ is a standalone npm package excluded from the root pnpm workspace; installing its deps needs a separate step.
---

`bemora/` has its own `package.json` + `pnpm-lock.yaml` but is **not** listed under
`packages:` in the root `pnpm-workspace.yaml` (only `artifacts/*`, `lib/*`, `lib/integrations/*`,
`scripts` are). Running `pnpm install` at the repo root does not install bemora's own
dependencies (axios, dotenv, etc.) — importing `bemora/src/index.js` fails with
`ERR_MODULE_NOT_FOUND` for any transitive dep until you additionally run:

```
cd bemora && pnpm install --ignore-workspace
```

**Why:** bemora is published standalone to npm; keeping it out of the root workspace
avoids the monorepo's catalog/hoisting rules leaking into the published package's own
lockfile.

**How to apply:** whenever you need to actually run/import/test code in `bemora/`
(not just edit files), run the install command above first if `bemora/node_modules`
doesn't exist yet.
