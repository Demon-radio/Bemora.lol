
export class BemoraError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = 'BemoraError';
    this.code = options.code || 'UNKNOWN_ERROR';
    this.provider = options.provider;
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
      timestamp: this.timestamp,
      stack: this.stack
    };
  }
}

export class ConfigurationError extends BemoraError {
  constructor(message, options = {}) {
    super(message, { ...options, code: 'CONFIGURATION_ERROR' });
    this.name = 'ConfigurationError';
  }
}

export class ProviderError extends BemoraError {
  constructor(message, options = {}) {
    super(message, { ...options, code: 'PROVIDER_ERROR' });
    this.name = 'ProviderError';
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
