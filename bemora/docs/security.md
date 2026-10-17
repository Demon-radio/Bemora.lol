# Security

- Keys live in the environment (`BEMORA_*_KEY`), never in source. `.env` is git-ignored; `.env.example` shows the shape with empty values.
- Logger redacts `?api_key=`, `Bearer`, `sk-*`/`pk-*` tokens from messages and metadata (`src/core/logger.js` + `src/core/pii.js`).
- Webhook verification uses constant-time comparison; SendGrid uses ECDSA P-256 over `timestamp + rawBody` and fails closed without a public key.
- `websites.*` blocks SSRF targets (loopback, RFC-1918, link-local `169.254.169.254`, non-http protocols).
- Fandom/Wikipedia host params are regex-validated before URL interpolation.

Report vulnerabilities privately — see [SECURITY.md](../SECURITY.md). Never open a public issue for a security problem.
