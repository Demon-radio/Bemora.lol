/**
 * PII redaction utilities.
 *
 * Scrubs emails, phone numbers, SSNs, credit card numbers, and other
 * sensitive identifiers from strings, objects, and LLM request payloads.
 *
 * Usage:
 *   import { redact, redactObject } from '../core/pii.js';
 *
 *   const safeMsg = redact('Call me at 555-867-5309, email user@example.com');
 *   // → 'Call me at [PHONE], email [EMAIL]'
 *
 *   const safePayload = redactObject({ message: 'SSN: 123-45-6789' });
 */

// ── Pattern definitions ───────────────────────────────────────────────────────

const PATTERNS = [
  // Credit/debit card numbers (Luhn-valid 13–19 digit sequences)
  { name: 'CARD',   pattern: /\b(?:\d[ \-]?){13,19}\d\b/g, placeholder: '[CARD]',  validate: luhnCheck },
  // SSN
  { name: 'SSN',    pattern: /\b\d{3}[- ]\d{2}[- ]\d{4}\b/g, placeholder: '[SSN]' },
  // Email
  { name: 'EMAIL',  pattern: /\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b/g, placeholder: '[EMAIL]' },
  // Phone (E.164 or common North American formats)
  { name: 'PHONE',  pattern: /(?:\+?1[-. ]?)?\(?(?:\d{3})\)?[-. ]?\d{3}[-. ]?\d{4}\b/g, placeholder: '[PHONE]' },
  // API keys — common formats (hex/base62 32+ chars, sk_*, pk_*, Bearer tokens)
  { name: 'APIKEY', pattern: /\b(?:sk|pk|rk|tok|key)[-_][a-zA-Z0-9_\-]{16,}\b/g, placeholder: '[APIKEY]' },
  // Bearer tokens in Authorization headers
  { name: 'BEARER', pattern: /Bearer\s+[A-Za-z0-9._\-]{20,}/g, placeholder: 'Bearer [REDACTED]' },
  // URL query parameters: apikey=, appid=, api_key=, token=
  { name: 'QUERYPARAM', pattern: /([?&](?:api[_-]?key|apikey|appid|token|access_token|secret)=)[^&\s"']+/gi, placeholder: '$1[REDACTED]' },
];

// Luhn algorithm for card validation
function luhnCheck(str) {
  const digits = str.replace(/\D/g, '');
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let d = parseInt(digits[digits.length - 1 - i], 10);
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return sum % 10 === 0;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Redact PII from a string.
 * @param {string} input
 * @param {object} [opts]
 * @param {string[]} [opts.skip] - pattern names to skip (e.g. ['PHONE'])
 * @returns {string}
 */
export function redact(input, { skip = [] } = {}) {
  if (typeof input !== 'string') return input;
  let out = input;
  for (const { name, pattern, placeholder, validate } of PATTERNS) {
    if (skip.includes(name)) continue;
    out = out.replace(pattern, (match) => {
      if (validate && !validate(match)) return match;
      return placeholder.includes('$') ? placeholder : placeholder;
    });
  }
  return out;
}

/**
 * Redact PII from all string values in a plain object (shallow + 1 level deep).
 * @param {object|string|any} obj
 * @param {object} [opts]
 * @returns {any}
 */
export function redactObject(obj, opts = {}) {
  if (typeof obj === 'string') return redact(obj, opts);
  if (typeof obj !== 'object' || obj === null) return obj;
  if (Array.isArray(obj)) return obj.map((item) => redactObject(item, opts));

  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'string') {
      out[k] = redact(v, opts);
    } else if (typeof v === 'object' && v !== null) {
      out[k] = redactObject(v, opts);
    } else {
      out[k] = v;
    }
  }
  return out;
}

/**
 * Redact PII from an LLM message array (role/content format).
 * @param {Array<{ role: string, content: string }>} messages
 * @returns {Array<{ role: string, content: string }>}
 */
export function redactMessages(messages, opts = {}) {
  return messages.map((msg) => ({
    ...msg,
    content: typeof msg.content === 'string' ? redact(msg.content, opts) : msg.content,
  }));
}

/**
 * Redact a URL's sensitive query parameters only.
 * @param {string} url
 */
export function redactUrl(url) {
  try {
    return url.replace(/([?&](?:api[_-]?key|apikey|appid|token|access_token|secret)=)[^&\s"']+/gi, '$1[REDACTED]');
  } catch {
    return url;
  }
}

/**
 * Check whether a string contains any detectable PII.
 * @param {string} str
 */
export function containsPII(str) {
  if (typeof str !== 'string') return false;
  return PATTERNS.some(({ pattern }) => {
    pattern.lastIndex = 0;
    return pattern.test(str);
  });
}
