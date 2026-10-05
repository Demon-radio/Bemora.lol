# AI agents

Give your agent one data layer instead of a dozen SDKs:

```js
import Bemora from 'bemora';
const api = new Bemora();

const tools = {
  getWeather: ({ city }) => api.weather.current({ city }),
  convertCurrency: ({ from, to, amount }) => api.currency.convert({ from, to, amount }),
  searchNews: ({ topic }) => api.news.search({ q: topic }),
  getCrypto: ({ coin }) => api.crypto.price({ coins: coin }),
  lookupIP: ({ ip }) => api.ip.lookup({ ip }),
  findMovie: ({ title }) => api.movies.search({ query: title }),
  chat: ({ message }) => api.ai.chat({ messages: [{ role: 'user', content: message }] }),
};
```

- Predictable `api.<namespace>.<method>(params)` names (see [providers](providers.md)).
- Structured errors with `code` / `provider` / `httpStatus` / `retryAfter` (see [errors](errors.md)) — agents can branch on `RATE_LIMITED` vs `AUTH_ERROR` instead of parsing strings.
- Streaming chat (`ai.groqStream`, `ai.openaiStream`) returns async generators — `for await (const chunk of ...)` — and deliberately bypasses retry/circuit logic.
- Full example: `examples/agent-power.js`. MCP exposure: [mcp](mcp.md).
