/**
 * Centralized User-Agent for all outbound HTTP requests made by bemora.
 *
 * Previously different providers used inconsistent strings
 * (`bemora/1.0`, `bemora-npm-library`, `bemora (https://...)`, etc.),
 * which caused at least one upstream (Wikipedia/Fandom) to return 403s.
 * Every provider should import and use this single constant instead of
 * inventing its own.
 */
export const USER_AGENT = 'bemora/4.0 (+https://github.com/Demon-radio/Bemora.lol)';

/**
 * Default headers merged into every outbound request. Callers can spread
 * this and override/extend as needed:
 *
 *   headers: { ...DEFAULT_HEADERS, Accept: 'application/json' }
 */
export const DEFAULT_HEADERS = Object.freeze({
  'User-Agent': USER_AGENT,
});
