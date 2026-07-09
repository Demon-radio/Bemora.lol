# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Fixed
- CLI (`src/cli.js`) had a leading blank line before the `#!/usr/bin/env node`
  shebang, which some shells/package managers reject when invoking the binary
  directly (e.g. via `npx bemora ...`). The shebang is now the first line.
- README badges/links pointed at a non-existent `github.com/bemora/bemora`
  repo; corrected to `github.com/Demon-radio/Bemora.lol`.

### Added
- `LICENSE` (MIT, matching `package.json`).
- `SECURITY.md` with a vulnerability reporting policy.
- `src/core/headers.js` exporting a single shared `USER_AGENT` constant, used
  in place of several inconsistent per-provider User-Agent strings.
- `src/core/http.js` exporting an `httpClient()` factory (default 8s timeout,
  shared User-Agent, AbortSignal passthrough) for providers to standardize on.

## [4.0.0] - prior to this changelog
See git history / README for earlier changes.
