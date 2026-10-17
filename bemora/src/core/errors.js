
export class BemoraError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = 'BemoraError';
    this.code = options.code || 'UNKNOWN_ERROR';
    this.provider = options.provider;
    this.requestId = options.requestId || _generateRequestId();
    this.cause = options.cause;
    this.timestamp = new Date().toISOString();
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, BemoraError);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      provider: this.provider,
      requestId: this.requestId,
      timestamp: this.timestamp,
      stack: this.stack
    };
  }
}

// ── Private helpers ───────────────────────────────────────────────────────────

function _generateRequestId() {
  // Lightweight UUID-v4-like ID without external deps.
  // crypto.randomUUID is available on Node ≥14.17 and modern browsers.
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'req-' + Math.random().toString(36).slice(2, 11) + '-' + Date.now().toString(36);
}

export class ConfigurationError extends BemoraError {
  constructor(message, options = {}) {
    super(message, { ...options, code: 'CONFIGURATION_ERROR' });
    this.name = 'ConfigurationError';
  }
}

export class ProviderError extends BemoraError {
  constructor(message, options = {}) {
    super(message, { ...options, code: options.code || 'PROVIDER_ERROR' });
    this.name = 'ProviderError';
    this.httpStatus = options.httpStatus;
    this.upstreamRequestId = options.upstreamRequestId;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      httpStatus: this.httpStatus,
      upstreamRequestId: this.upstreamRequestId,
    };
  }
}

export class ValidationError extends BemoraError {
  constructor(message, options = {}) {
    super(message, { ...options, code: 'VALIDATION_ERROR' });
    this.name = 'ValidationError';
    this.errors = options.errors || [];
  }

  toJSON() {
    return {
      ...super.toJSON(),
      errors: this.errors
    };
  }
}

/**
 * Thrown when a circuit breaker is OPEN and a request is rejected fast,
 * without calling the underlying provider at all.
 */
export class CircuitBreakerError extends BemoraError {
  constructor(message, options = {}) {
    super(message, { ...options, code: 'CIRCUIT_BREAKER_OPEN' });
    this.name = 'CircuitBreakerError';
  }
}

/**
 * Thrown when a per-provider (or global) timeout elapses before the
 * provider returns a response.
 */
export class TimeoutError extends BemoraError {
  constructor(message, options = {}) {
    super(message, { ...options, code: 'TIMEOUT' });
    this.name = 'TimeoutError';
  }
}

/**
 * Thrown when an upstream API returns a non-2xx response. Carries the
 * upstream HTTP status and (when available) the upstream's own request id,
 * in addition to the base `provider`/`code` fields.
 */
export class RateLimitError extends ProviderError {
  constructor(message, options = {}) {
    super(message, { ...options, code: 'RATE_LIMITED' });
    this.name = 'RateLimitError';
    this.retryAfter = options.retryAfter;
    this.limit = options.limit;
    this.remaining = options.remaining;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      retryAfter: this.retryAfter,
      limit: this.limit,
      remaining: this.remaining,
    };
  }
}

/**
 * Thrown when a provider call fails because of missing/invalid credentials
 * (HTTP 401/403 from the upstream, or a locally-detected missing API key).
 */
export class AuthError extends ProviderError {
  constructor(message, options = {}) {
    super(message, { ...options, code: 'AUTH_ERROR' });
    this.name = 'AuthError';
  }
}

/**
 * Wraps an axios error into the appropriate Bemora* error class, attaching
 * `provider`, upstream HTTP status, and (for 429s) rate-limit metadata.
 * Non-axios errors are wrapped in a plain ProviderError.
 *
 * Usage in a provider:
 *   try {
 *     const { data } = await http.get(url);
 *   } catch (err) {
 *     throw wrapProviderError(err, 'weather');
 *   }
 */
// ── Spec-named aliases ────────────────────────────────────────────────────────
// The spec requires `BemoraProviderError`, `BemoraRateLimitError`,
// `BemoraTimeoutError`, and `BemoraAuthError` as the canonical export names.
// Aliased here so callers can `import { BemoraProviderError } from 'bemora-enterprise'`
// while internal code and existing tests continue to use the shorter names.
export const BemoraProviderError  = ProviderError;
export const BemoraRateLimitError = RateLimitError;
export const BemoraTimeoutError   = TimeoutError;
export const BemoraAuthError      = AuthError;

// ── wrapProviderError ─────────────────────────────────────────────────────────

export function wrapProviderError(err, provider) {
  if (err instanceof BemoraError) return err;

  const status = err?.response?.status;
  const upstreamMessage = err?.response?.data?.message || err?.response?.data?.error || err?.message;

  if (err?.code === 'ECONNABORTED' || err?.name === 'AbortError' || /timeout/i.test(err?.message || '')) {
    return new TimeoutError(`[${provider}] request timed out: ${upstreamMessage}`, { provider, cause: err });
  }
  if (status === 401 || status === 403) {
    return new AuthError(`[${provider}] authentication failed: ${upstreamMessage}`, {
      provider,
      cause: err,
      httpStatus: status,
    });
  }
  if (status === 429) {
    const headers = err?.response?.headers || {};
    return new RateLimitError(`[${provider}] rate limited: ${upstreamMessage}`, {
      provider,
      cause: err,
      httpStatus: status,
      retryAfter: headers['retry-after'],
      limit: headers['x-ratelimit-limit'],
      remaining: headers['x-ratelimit-remaining'],
    });
  }
  return new ProviderError(`[${provider}] request failed: ${upstreamMessage}`, {
    provider,
    cause: err,
    httpStatus: status,
  });
}
