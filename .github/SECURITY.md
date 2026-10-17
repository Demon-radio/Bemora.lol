# Security Policy

## Supported Versions

Only the latest published `1.x` line of `bemora` receives security fixes
(see [`bemora/SECURITY.md`](../bemora/SECURITY.md) for the package-level policy).

## Reporting a Vulnerability

**Do not open a public issue.** Report privately via
[GitHub Security Advisories](https://github.com/Demon-radio/Bemora.lol/security/advisories/new).

Include: description, reproduction steps, and impact. Expect an initial
response within 5 business days; fixes ship before any public disclosure.

## Scope

In scope: credential/key handling or leakage, request signing and webhook
verification, dependency vulnerabilities in our own tree, injection or SSRF
issues introduced by this library's code. Upstream provider bugs belong to
the provider.
