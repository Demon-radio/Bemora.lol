# MCP server

`bemora-mcp` exposes every provider as an MCP tool over stdio. Tool names are always `<provider>_<method>` (e.g. `weather_current`, `gaming_crossfireWeapons`, `smart_weather`).

## Cursor

```json
{
  "mcpServers": {
    "bemora": {
      "command": "npx",
      "args": ["bemora-mcp"],
      "env": {
        "BEMORA_WEATHER_KEY": "...",
        "BEMORA_GROQ_KEY": "..."
      }
    }
  }
}
```

## Discovery tools

- `bemora_list_categories` — every provider category with counts
- `bemora_providers_in_category({ category })` — providers + methods in one category
- `bemora_status` — provider health + circuit-breaker state
- `bemora_metrics` — request counts, error rates, p50/p95/p99
- `bemora_rate_limits` — used/limit per provider

Tools needing a missing key are still listed but suffixed `[NEEDS KEY: ...]` in their description. See `examples/with-mcp.js` and `src/mcp-server/provider-info.js` (the single source of truth for the catalog).
