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

## Input schemas

Every tool carries a specific JSON input schema (`src/mcp-server/schemas.js`) — required params, types, and hints for enums/formats — so AI agents call tools correctly on the first try. The only exceptions use a permissive fallback: websocket stream constructors (`realtime.binance`, `realtime.kraken`, not JSON-call friendly) and synchronous static lookups (`rss.sources`, `prayer.methods`). Schema coverage is locked by `tests/unit/mcp-catalog.test.js`: adding a catalog method without a schema fails the suite.
