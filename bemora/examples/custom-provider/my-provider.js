/**
 * Custom provider template — copy this file to start your own provider.
 *
 * A Bemora provider is a plugin that adds ONE namespace object to the
 * instance. Each method follows the same contract as built-in providers:
 *
 *   async method({ ...params }) → result (plain JSON-serializable data)
 *
 * Rules (enforced by convention, checked in demo.js + tests):
 *  1. Validate inputs first; throw ValidationError with a clear message.
 *  2. Never log or expose secrets (see src/core/pii.js redaction).
 *  3. Return data, not Response objects — MCP serializes results to JSON.
 *  4. For HTTP calls, reuse the shared client: `import { httpClient } from
 *     '../../src/core/http.js'` and wrap errors with wrapProviderError(err,
 *     '<your-provider-id>') so retries, circuits, and metrics classify them.
 *     (This template stays offline on purpose so it always runs; plug fetch
 *     calls into `fact()` following the commented recipe below.)
 *
 * Publish as `bemora-plugin-<name>` on npm. Full guide: docs/custom-providers.md
 */
import { ValidationError, wrapProviderError } from '../../src/core/errors.js';

const PROVIDER_ID = 'hello';

function greet({ name }) {
  if (!name || typeof name !== 'string') {
    throw new ValidationError('[hello] greet({ name }) requires a non-empty string.', {
      provider: PROVIDER_ID,
    });
  }
  return { greeting: `Hello, ${name}!`, provider: PROVIDER_ID };
}

function stats({ numbers }) {
  if (!Array.isArray(numbers) || numbers.length === 0 || !numbers.every((n) => typeof n === 'number')) {
    throw new ValidationError('[hello] stats({ numbers }) requires a non-empty number[].', {
      provider: PROVIDER_ID,
    });
  }
  const sorted = [...numbers].sort((a, b) => a - b);
  return {
    count: numbers.length,
    min: sorted[0],
    max: sorted[sorted.length - 1],
    mean: numbers.reduce((s, n) => s + n, 0) / numbers.length,
    provider: PROVIDER_ID,
  };
}

// Recipe for a live HTTP method (kept out of the runnable path so this
// template works offline — uncomment and adapt for a real provider):
//
// import { httpClient } from '../../src/core/http.js';
// const http = httpClient();
// async function fact() {
//   try {
//     const { data } = await http.get('https://example.com/api/fact');
//     return { fact: data.fact, provider: PROVIDER_ID };
//   } catch (err) {
//     throw wrapProviderError(err, PROVIDER_ID);
//   }
// }

export const helloProvider = {
  name: 'hello',
  install(api) {
    api.hello = { greet, stats };
  },
  // Optional: observe every call on the host instance (errors here are
  // swallowed by design — a plugin can never crash the host).
  async beforeRequest({ provider }) {
    if (provider === PROVIDER_ID) {
      // e.g. metrics.increment('hello.calls')
    }
  },
};

export default helloProvider;
