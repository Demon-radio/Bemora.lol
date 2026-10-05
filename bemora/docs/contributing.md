# Contributing (short version)

Full guide: [CONTRIBUTING.md](../CONTRIBUTING.md).

```bash
cd bemora
pnpm install --ignore-workspace
pnpm run lint && pnpm run typecheck && pnpm test
```

Add providers in 3 places (`import` + constructor + `_buildX()` in `src/index.js`, plus `src/mcp-server/provider-info.js`), verify live, update `CHANGELOG.md`, and fill out the PR template.
