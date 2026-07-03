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
 *    - getWeather({ city: "Cairo" })
 *    - convertCurrency({ from: "USD", to: "EGP", amount: 100 })
 *    - getNews({ country: "eg", category: "technology" })
 *    - searchImages({ query: "pyramids" })
 *    - getFootballFixtures({ date: "2026-07-02" })
 *    - getCryptoPrice({ coins: "bitcoin" })
 *    - getGoldPrice({ currency: "USD" })
 *    - searchWikipedia({ query: "Nile River", language: "en" })
 *    - searchBooks({ query: "arabic literature" })
 */

console.log('See comments above for MCP configuration instructions.');
console.log('Run: npx bemora-mcp');
