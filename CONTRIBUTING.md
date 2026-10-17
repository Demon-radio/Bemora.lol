# Contributing to Bemora.lol

This repo is a monorepo. The published package lives in `bemora/` — start there:

- **Package guide:** [`bemora/CONTRIBUTING.md`](bemora/CONTRIBUTING.md) (setup, providers, plugins, tests, PRs)
- **Docs:** [`bemora/docs/`](bemora/docs/)
- **Roadmap:** [`bemora/ROADMAP.md`](bemora/ROADMAP.md)

## Getting help

- Questions and ideas: [GitHub Discussions](../../discussions)
- Bugs and features: [Issues](../../issues) (templates provided — no public issues for security problems)
- Security problems: see [`.github/SECURITY.md`](.github/SECURITY.md) — private advisories only

## Ground rules

- Backward compatibility is a hard requirement for `bemora` — no renamed/removed public APIs without a deprecation path.
- Every user-visible change updates `bemora/CHANGELOG.md` under `[Unreleased]` (no invented history).
- Never commit secrets (`.env`, API keys, tokens). CI must be green before merge.
