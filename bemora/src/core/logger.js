/**
 * Bemora structured logger.
 *
 * Two output modes (controlled by env var BEMORA_LOG_FORMAT):
 *   - 'json'  → newline-delimited JSON, suitable for Datadog / ELK / CloudWatch
 *   - anything else (default) → human-readable chalk output for development
 *
 * Custom transport:
 *   logger.setTransport((entry) => myLogSink(entry));
 *   // entry: { ts, level, msg, provider?, latencyMs?, cacheStatus?, ...extra }
 *
 * Log level (env BEMORA_LOG_LEVEL or logger.setLevel()):
 *   silent | error | warn | info | debug
 */

import chalk from 'chalk';

const LEVELS = { silent: 0, error: 1, warn: 2, info: 3, debug: 4 };

function _readEnvLevel() {
  const raw = (typeof process !== 'undefined' && process.env?.BEMORA_LOG_LEVEL) || 'info';
  return LEVELS[raw] ?? LEVELS.info;
}

function _isJson() {
  return typeof process !== 'undefined' && process.env?.BEMORA_LOG_FORMAT === 'json';
}

let _currentLevel = _readEnvLevel();
let _transport    = null; // custom transport function

// ── URL redaction ─────────────────────────────────────────────────────────────

const _KEY_PATTERN = /([?&](?:api[_-]?key|apikey|appid|access_token|token|secret|auth|password|Authorization)=)[^&\s"'#]+/gi;
const _BEARER_PATTERN = /(Bearer\s+)[A-Za-z0-9._\-]{10,}/g;
const _SK_PATTERN = /\b(sk|pk|rk|tok|key)[-_][a-zA-Z0-9_\-]{16,}\b/g;

/**
 * Scrub known API key patterns from a string (URLs, auth headers, query params).
 * @param {string} str
 * @returns {string}
 */
function redactSensitive(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(_KEY_PATTERN, '$1[REDACTED]')
    .replace(_BEARER_PATTERN, '$1[REDACTED]')
    .replace(_SK_PATTERN, '[APIKEY]');
}

// ── internal emit ────────────────────────────────────────────────────────────

function _redactMeta(meta) {
  if (!meta || typeof meta !== 'object') return meta;
  const out = {};
  for (const [k, v] of Object.entries(meta)) {
    if (typeof v === 'string') out[k] = redactSensitive(v);
    else if (v && typeof v === 'object' && !Array.isArray(v)) out[k] = _redactMeta(v);
    else out[k] = v;
  }
  return out;
}

function _emit(level, msg, meta = {}) {
  // Redact any API keys that leaked into the message or metadata
  msg = redactSensitive(String(msg));
  meta = _redactMeta(meta);
  if (_currentLevel < LEVELS[level]) return;

  const entry = {
    ts:    new Date().toISOString(),
    level,
    msg,
    ...meta,
  };

  // Custom transport takes priority
  if (typeof _transport === 'function') {
    try { _transport(entry); } catch { /* never crash the caller */ }
    return;
  }

  if (_isJson()) {
    // Strip undefined values for cleaner JSON
    const clean = Object.fromEntries(Object.entries(entry).filter(([, v]) => v !== undefined));
    (level === 'error' ? process.stderr : process.stdout).write(JSON.stringify(clean) + '\n');
    return;
  }

  // Human-readable chalk output
  const prefix = `[${entry.ts}] ${level.toUpperCase().padEnd(5)}`;
  const providerTag = meta.provider ? chalk.magenta(` <${meta.provider}>`) : '';
  const latencyTag  = typeof meta.latencyMs === 'number' ? chalk.gray(` ${meta.latencyMs}ms`) : '';

  switch (level) {
    case 'debug': console.debug(chalk.gray(prefix) + providerTag + latencyTag + ' ' + msg); break;
    case 'info':  console.info(chalk.cyan(prefix)  + providerTag + latencyTag + ' ' + msg); break;
    case 'warn':  console.warn(chalk.yellow(prefix)+ providerTag + latencyTag + ' ' + chalk.yellow(msg)); break;
    case 'error': console.error(chalk.red(prefix)  + providerTag + latencyTag + ' ' + chalk.red(msg)); break;
  }
}

// ── public API ───────────────────────────────────────────────────────────────

export const logger = {
  /** Change the active log level at runtime. */
  setLevel(level) {
    _currentLevel = LEVELS[level] ?? LEVELS.info;
  },

  /** Get the current level name. */
  getLevel() {
    return Object.keys(LEVELS).find((k) => LEVELS[k] === _currentLevel) ?? 'info';
  },

  /**
   * Register a custom transport (replaces all built-in output).
   * Pass null to restore the default transport.
   * @param {((entry: object) => void)|null} fn
   */
  setTransport(fn) {
    if (fn !== null && typeof fn !== 'function') {
      throw new TypeError('transport must be a function or null');
    }
    _transport = fn;
  },

  debug(msg, meta)  { _emit('debug', msg, meta); },
  info(msg, meta)   { _emit('info',  msg, meta); },
  warn(msg, meta)   { _emit('warn',  msg, meta); },
  error(msg, meta)  { _emit('error', msg, meta); },

  /** Mask all but the first/last 4 characters of an API key string. */
  maskKey(str) {
    if (!str || str.length < 8) return '***';
    return str.slice(0, 4) + '***' + str.slice(-4);
  },
};
