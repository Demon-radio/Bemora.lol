# Security Policy

## Supported Versions

Only the latest published major version of `bemora` receives security fixes.

| Version | Supported |
| ------- | --------- |
| 4.x     | ✅        |
| < 4.0   | ❌        |

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please **do not**
open a public GitHub issue. Instead:

1. Email the maintainers privately (see the repository's GitHub profile for
   contact details) or use GitHub's private
   ["Report a vulnerability"](https://github.com/Demon-radio/Bemora.lol/security/advisories/new)
   feature.
2. Include a description of the vulnerability, steps to reproduce, and the
   potential impact.
3. Allow a reasonable amount of time (target: 5 business days for initial
   response) for the issue to be triaged before any public disclosure.

## Scope

This library aggregates third-party APIs. Vulnerabilities in upstream
providers (e.g. a leaked API key format, a provider's own API bug) should be
reported to that provider directly. Report issues here if they relate to:

- Credential/API-key handling or leakage (e.g. keys appearing in logs)
- Request signing / webhook signature verification
- Dependency vulnerabilities in this package's own dependency tree
- Injection or SSRF issues introduced by this library's code

## Disclosure

We aim to acknowledge reports within 5 business days and to ship a fix or
mitigation before any public disclosure of details.
