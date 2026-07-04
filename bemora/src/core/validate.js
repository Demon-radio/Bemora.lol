import { z } from 'zod';
import { ValidationError } from './errors.js';

/**
 * Optional runtime response-shape validation (opt-in via `new Bemora(keys, { validateResponses: true })`).
 * Catches silent breaking changes when an upstream provider changes its response shape.
 * Only the highest-traffic providers have schemas; unknown providers pass through untouched.
 */

const looseObject = (shape) => z.object(shape).passthrough();

export const schemas = {
  'crypto.price': looseObject({
    // CoinGecko simple price shape: { bitcoin: { usd: 12345 }, ... }
  }).catchall(z.record(z.union([z.number(), z.string()]))),

  'weather.current': looseObject({
    weather: z.array(z.object({ description: z.string().optional() }).passthrough()).optional(),
    main: z.object({ temp: z.number() }).passthrough().optional(),
  }),

  'ip.lookup': looseObject({
    query: z.string().optional(),
    ip: z.string().optional(),
    country: z.string().optional(),
    status: z.string().optional(),
  }),

  'countries.byName': z.union([
    z.array(z.any()),
    looseObject({ countries: z.array(z.any()) }),
  ]),

  'search.web': looseObject({
    results: z.array(z.any()).optional(),
    query: z.string().optional(),
  }),
};

/**
 * Validate a result against a named schema. Throws ValidationError on mismatch.
 * No-op if no schema is registered for the given key.
 * @param {string} schemaKey
 * @param {any} data
 */
export function validateResponse(schemaKey, data) {
  const schema = schemas[schemaKey];
  if (!schema) return data;

  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ValidationError(
      `[bemora] Response shape validation failed for "${schemaKey}". The upstream API may have changed its response format.`,
      { errors: result.error.issues, provider: schemaKey }
    );
  }
  return data;
}
