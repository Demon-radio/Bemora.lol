/**
 * How to use Bemora with Cursor / Claude Desktop (MCP)
 *
 * 1. Add this to your Cursor MCP config (~/.cursor/mcp.json):
 *
 * {
 *   "mcpServers": {
 *     "bemora": {
 *       "command": "npx",
 *       "args": ["bemora-mcp"],
 *       "env": {
 *         "BEMORA_WEATHER_KEY": "your_key",
 *         "BEMORA_CURRENCY_KEY": "your_key",
 *         "BEMORA_NEWS_KEY": "your_key",
 *         "BEMORA_UNSPLASH_KEY": "your_key",
 *         "BEMORA_PEXELS_KEY": "your_key",
 *         "BEMORA_FOOTBALL_KEY": "your_key",
 *         "BEMORA_GOLD_KEY": "your_key"
 *       }
 *     }
 *   }
 * }
 *
 * 2. For Claude Desktop (~/.claude/claude_desktop_config.json):
 *
 * {
 *   "mcpServers": {
 *     "bemora": {
 *       "command": "npx",
 *       "args": ["bemora-mcp"],
 *       "env": { ... same keys ... }
 *     }
 *   }
 * }
 *
 * 3. After connecting, the AI can call tools like:
 *    - weather_current({ city: "Cairo" })
 *    - currency_convert({ from: "USD", to: "EGP", amount: 100 })
 *    - news_search({ q: "technology" })
 *    - images_search({ query: "pyramids" })
 *    - football_fixtures({ date: "2026-07-02" })
 *    - crypto_price({ coins: "bitcoin" })
 *    - gold_price({ currency: "USD" })
 *    - research_wikipedia({ query: "Nile River", language: "en" })
 *    - research_books({ query: "arabic literature" })
 *    - gaming_crossfireWeapons({ limit: 20 })
 *    - smart_weather({ city: "Cairo" })
 *
 * Tool names are always "<provider>_<method>" — see
 * src/mcp-server/provider-info.js for the full list, or call
 * bemora_list_categories + bemora_providers_in_category from the AI
 * to browse providers by category.
 */

console.log('See comments above for MCP configuration instructions.');
console.log('Run: npx bemora-mcp');
