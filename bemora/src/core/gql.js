/**
 * GraphQL client helper.
 *
 * Usage:
 *   import { gql } from '../core/gql.js';
 *
 *   const data = await gql('https://api.github.com/graphql', `
 *     query($owner: String!, $name: String!) {
 *       repository(owner: $owner, name: $name) { stargazerCount }
 *     }
 *   `, { owner: 'vercel', name: 'next.js' }, {
 *     headers: { Authorization: 'Bearer ghp_...' },
 *   });
 */

import { httpClient } from './http.js';
import { ProviderError } from './errors.js';

const DEFAULT_TIMEOUT = 15_000;

/**
 * Execute a GraphQL query or mutation.
 *
 * @param {string} endpoint - GraphQL endpoint URL
 * @param {string} query - GraphQL query/mutation string
 * @param {object} [variables] - query variables
 * @param {object} [opts]
 * @param {object} [opts.headers] - extra HTTP headers (e.g. Authorization)
 * @param {number} [opts.timeout] - request timeout in ms
 * @param {AbortSignal} [opts.signal] - abort signal
 * @param {boolean} [opts.throwOnErrors=true] - throw if GraphQL errors array is non-empty
 * @returns {Promise<any>} - the `data` field of the GraphQL response
 */
export async function gql(endpoint, query, variables, { headers = {}, timeout = DEFAULT_TIMEOUT, signal, throwOnErrors = true } = {}) {
  const http = httpClient({ timeout, headers: { 'Content-Type': 'application/json', ...headers } });

  const { data: body } = await http.post(
    endpoint,
    JSON.stringify({ query, variables }),
    { signal }
  ).catch((err) => {
    const provider = new URL(endpoint).hostname;
    throw new ProviderError(`[gql] Request to ${endpoint} failed: ${err.message}`, { provider, cause: err });
  });

  if (throwOnErrors && body.errors?.length) {
    const msgs = body.errors.map((e) => e.message).join('; ');
    throw new ProviderError(`[gql] GraphQL errors from ${endpoint}: ${msgs}`, {
      provider: new URL(endpoint).hostname,
    });
  }

  return body.data;
}

/**
 * Build a tagged-template literal helper for syntax highlighting in editors.
 * Usage: const QUERY = gqlTag`query { viewer { login } }`;
 */
export function gqlTag(strings, ...values) {
  return strings.reduce((acc, str, i) => acc + str + (values[i] ?? ''), '');
}

/**
 * Introspect a GraphQL schema (returns type list).
 * @param {string} endpoint
 * @param {object} [opts]
 */
export async function introspect(endpoint, opts = {}) {
  return gql(endpoint, `
    query IntrospectionQuery {
      __schema {
        queryType { name }
        mutationType { name }
        types {
          name
          kind
          description
          fields(includeDeprecated: true) {
            name
            description
            type { name kind ofType { name kind } }
          }
        }
      }
    }
  `, {}, opts);
}
