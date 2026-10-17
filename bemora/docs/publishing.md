# Publishing

Two paths — automated (preferred) or manual. No auto-publish on merge in either case.

## Automated (GitHub Release → npm)

Publishing a GitHub Release triggers `.github/workflows/release.yml`, which runs lint + typecheck + unit tests and publishes: prereleases go out under the `alpha` tag, full releases update `latest`.

One-time setup: add an npm automation token at Settings → Secrets and variables → Actions → **New repository secret** named `NPM_TOKEN`.

Suggested order for a first public release:

```text
final review (status → diff)
   ↓
git commit → git push
   ↓
GitHub Release (mark prerelease for alphas)
   ↓
CI publishes to npm automatically
```

## Manual

```bash
cd bemora
pnpm run lint && pnpm run typecheck && pnpm test && pnpm run test:integration
npm pack --dry-run   # or: pnpm run pack:dry — inspect the tarball (no tests/node_modules)
npm version prerelease  # 1.0.0-alpha.3 → 1.0.0-alpha.4 (stay on the alpha track; no 1.0.0 jump yet)
git push --follow-tags
# GitHub Release from the tag, then:
npm publish --access public --tag alpha
```

## Why `--tag alpha`

While the package is a prerelease, never let `latest` point at it. Publish with `--tag alpha` so that:

```bash
npm install bemora         # gets the last stable, NOT the alpha
npm install bemora@alpha  # opt-in to the prerelease
```

Only promote a version to `latest` (`npm dist-tag add bemora@x.y.z latest`) once the API is genuinely stable — expected path: `alpha.N` → `beta.1` → `1.0.0`.

`package.json` `files` limits the tarball to `src/`, `examples/`, docs (`README`, `CHANGELOG`, `SECURITY`, `.env.example`). `publishConfig.access` is `public`. A Changesets/semantic-release flow is tracked in `ROADMAP.md` but not adopted yet.
