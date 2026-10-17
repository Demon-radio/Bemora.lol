# CLI

```bash
bemora --help
bemora --version   # always matches package.json
bemora weather Cairo
bemora weather Cairo --units imperial
bemora forecast London
bemora convert 500 USD EGP
bemora rates USD
bemora crypto bitcoin ethereum
bemora news eg --category technology
bemora wikipedia "Nile" --lang en
bemora books "arabic literature"
bemora utils uuid
bemora utils hash -a sha256 <<< "hello"
bemora utils http-status 404
```

Exit codes: `0` on success, `1` on error (message on stderr, never secrets). Credentials come from the environment — the CLI never prints them. Run `bemora utils --help` for the 11 utility subcommands.

Coverage gap: the CLI covers weather/currency/news/crypto/utils/research today; gaming/CrossFire, smart failover, and enterprise namespaces are library/MCP-only for now (see `ROADMAP.md`).
