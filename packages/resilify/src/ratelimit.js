/**
 * In-memory rate limit tracker. Tracks usage per key against a configured
 * budget and throws before the underlying call would exceed it.
 *
 * This is a client-side guard (protects your own outbound quota against a
 * third party's rate limit) — it is not a server-side request limiter.
 */

const WINDOW_MS = {
  second: 1000,
  minute: 60 * 1000,
  hour: 60 * 60 * 1000,
  day: 24 * 60 * 60 * 1000,
  month: 30 * 24 * 60 * 60 * 1000,
};

export class RateLimiter {
  constructor() {
    this._usage = new Map();
    this._limits = new Map();
  }

  /** Configure (or update) the budget for a key. */
  configure(key, { limit, window = 'minute' }) {
    if (!WINDOW_MS[window]) throw new Error(`Unknown rate-limit window "${window}"`);
    this._limits.set(key, { limit, window });
  }

  _windowStart(now, window) {
    const ms = WINDOW_MS[window] || WINDOW_MS.minute;
    return Math.floor(now / ms) * ms;
  }

  /** @returns {boolean} whether `key` is currently at/over its configured budget. */
  isLimited(key) {
    const meta = this._limits.get(key);
    if (!meta) return false;
    const now = Date.now();
    const usage = this._usage.get(key) || [];
    const windowStart = this._windowStart(now, meta.window);
    return usage.filter((t) => t >= windowStart).length >= meta.limit;
  }

  /**
   * Record a call for `key`. Throws if it would exceed the configured budget.
   * No-op (untracked, unlimited) for keys with no configured budget.
   */
  record(key) {
    const now = Date.now();
    const meta = this._limits.get(key);
    if (!meta) return;

    const windowStart = this._windowStart(now, meta.window);
    const usage = (this._usage.get(key) || []).filter((t) => t >= windowStart);
    if (usage.length >= meta.limit) {
      throw new Error(`Rate limit exceeded for "${key}": ${meta.limit} calls per ${meta.window}`);
    }
    usage.push(now);
    this._usage.set(key, usage);
  }

  /** @returns {{used:number, limit:number, window:string, warning:boolean}} */
  getStatus(key) {
    const meta = this._limits.get(key) || { limit: Infinity, window: 'unknown' };
    const now = Date.now();
    const windowStart = this._windowStart(now, meta.window);
    const usage = (this._usage.get(key) || []).filter((t) => t >= windowStart);
    return { key, used: usage.length, limit: meta.limit, window: meta.window, warning: usage.length > meta.limit * 0.8 };
  }

  /** Clear tracked usage (and, optionally, configuration) — mainly for tests. */
  reset() {
    this._usage.clear();
  }
}

// A shared default instance, for callers who just want module-level functions.
const defaultLimiter = new RateLimiter();

export function configure(key, opts) {
  return defaultLimiter.configure(key, opts);
}
export function isLimited(key) {
  return defaultLimiter.isLimited(key);
}
export function record(key) {
  return defaultLimiter.record(key);
}
export function getStatus(key) {
  return defaultLimiter.getStatus(key);
}
export function reset() {
  return defaultLimiter.reset();
}
