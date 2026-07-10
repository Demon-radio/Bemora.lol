import { describe, it, expect } from 'vitest';
import {
  BemoraError,
  ConfigurationError,
  ProviderError,
  ValidationError,
  RateLimitError,
  TimeoutError,
  AuthError,
  CircuitBreakerError,
  BemoraProviderError,
  BemoraRateLimitError,
  BemoraTimeoutError,
  BemoraAuthError,
  wrapProviderError,
} from '../../src/core/errors.js';

describe('BemoraError', () => {
  it('is an instance of Error', () => {
    const e = new BemoraError('test');
    expect(e).toBeInstanceOf(Error);
    expect(e).toBeInstanceOf(BemoraError);
  });

  it('has the correct name', () => {
    expect(new BemoraError('msg').name).toBe('BemoraError');
  });

  it('has default code UNKNOWN_ERROR', () => {
    expect(new BemoraError('msg').code).toBe('UNKNOWN_ERROR');
  });

  it('stores the provider', () => {
    const e = new BemoraError('msg', { provider: 'openweathermap' });
    expect(e.provider).toBe('openweathermap');
  });

  it('stores the cause', () => {
    const cause = new Error('original');
    const e = new BemoraError('wrapped', { cause });
    expect(e.cause).toBe(cause);
  });

  it('has a timestamp in ISO format', () => {
    const e = new BemoraError('msg');
    expect(() => new Date(e.timestamp)).not.toThrow();
    expect(e.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('toJSON includes name, message, code, provider, timestamp', () => {
    const e = new BemoraError('test message', { code: 'CUSTOM', provider: 'test' });
    const json = e.toJSON();
    expect(json.name).toBe('BemoraError');
    expect(json.message).toBe('test message');
    expect(json.code).toBe('CUSTOM');
    expect(json.provider).toBe('test');
    expect(json.timestamp).toBeDefined();
  });
});

describe('ConfigurationError', () => {
  it('is an instance of BemoraError', () => {
    expect(new ConfigurationError('msg')).toBeInstanceOf(BemoraError);
  });

  it('has name ConfigurationError', () => {
    expect(new ConfigurationError('msg').name).toBe('ConfigurationError');
  });

  it('has code CONFIGURATION_ERROR', () => {
    expect(new ConfigurationError('msg').code).toBe('CONFIGURATION_ERROR');
  });
});

describe('ProviderError', () => {
  it('is an instance of BemoraError', () => {
    expect(new ProviderError('msg')).toBeInstanceOf(BemoraError);
  });

  it('has name ProviderError', () => {
    expect(new ProviderError('msg').name).toBe('ProviderError');
  });

  it('has code PROVIDER_ERROR', () => {
    expect(new ProviderError('msg').code).toBe('PROVIDER_ERROR');
  });
});

describe('ValidationError', () => {
  it('is an instance of BemoraError', () => {
    expect(new ValidationError('msg')).toBeInstanceOf(BemoraError);
  });

  it('has name ValidationError', () => {
    expect(new ValidationError('msg').name).toBe('ValidationError');
  });

  it('has code VALIDATION_ERROR', () => {
    expect(new ValidationError('msg').code).toBe('VALIDATION_ERROR');
  });

  it('has an errors array (empty by default)', () => {
    const e = new ValidationError('msg');
    expect(Array.isArray(e.errors)).toBe(true);
    expect(e.errors).toHaveLength(0);
  });

  it('stores errors from options', () => {
    const errors = [{ path: ['field'], message: 'Required' }];
    const e = new ValidationError('msg', { errors });
    expect(e.errors).toEqual(errors);
  });

  it('toJSON includes errors array', () => {
    const errors = [{ path: ['x'], message: 'Invalid' }];
    const json = new ValidationError('msg', { errors }).toJSON();
    expect(json.errors).toEqual(errors);
  });
});

// ── requestId ────────────────────────────────────────────────────────────────

describe('BemoraError.requestId', () => {
  it('auto-generates a requestId when not provided', () => {
    const e = new BemoraError('msg');
    expect(typeof e.requestId).toBe('string');
    expect(e.requestId.length).toBeGreaterThan(5);
  });

  it('accepts a caller-supplied requestId', () => {
    const e = new BemoraError('msg', { requestId: 'req-abc-123' });
    expect(e.requestId).toBe('req-abc-123');
  });

  it('each error gets a unique requestId by default', () => {
    const ids = Array.from({ length: 10 }, () => new BemoraError('x').requestId);
    expect(new Set(ids).size).toBe(10);
  });

  it('includes requestId in toJSON output', () => {
    const e = new BemoraError('msg', { requestId: 'req-xyz' });
    expect(e.toJSON().requestId).toBe('req-xyz');
  });

  it('subclasses inherit requestId', () => {
    const e = new ProviderError('msg', { provider: 'test' });
    expect(typeof e.requestId).toBe('string');
    expect(e.requestId.length).toBeGreaterThan(5);
  });
});

// ── Spec-named aliases ────────────────────────────────────────────────────────

describe('Spec-named alias exports', () => {
  it('BemoraProviderError is the same class as ProviderError', () => {
    expect(BemoraProviderError).toBe(ProviderError);
  });

  it('BemoraRateLimitError is the same class as RateLimitError', () => {
    expect(BemoraRateLimitError).toBe(RateLimitError);
  });

  it('BemoraTimeoutError is the same class as TimeoutError', () => {
    expect(BemoraTimeoutError).toBe(TimeoutError);
  });

  it('BemoraAuthError is the same class as AuthError', () => {
    expect(BemoraAuthError).toBe(AuthError);
  });

  it('instanceof works with both names', () => {
    const e = new ProviderError('msg');
    expect(e).toBeInstanceOf(BemoraProviderError);
    expect(e).toBeInstanceOf(BemoraError);
  });
});

// ── wrapProviderError ─────────────────────────────────────────────────────────

describe('wrapProviderError', () => {
  it('passes BemoraError through unchanged', () => {
    const original = new BemoraError('original');
    expect(wrapProviderError(original, 'test')).toBe(original);
  });

  it('wraps a 401 into AuthError', () => {
    const err = { response: { status: 401, data: { message: 'Unauthorized' } } };
    const wrapped = wrapProviderError(err, 'stripe');
    expect(wrapped).toBeInstanceOf(AuthError);
    expect(wrapped.httpStatus).toBe(401);
    expect(wrapped.provider).toBe('stripe');
  });

  it('wraps a 429 into RateLimitError with retryAfter', () => {
    const err = {
      response: {
        status: 429,
        data: { message: 'Too Many Requests' },
        headers: { 'retry-after': '60', 'x-ratelimit-limit': '100', 'x-ratelimit-remaining': '0' },
      },
    };
    const wrapped = wrapProviderError(err, 'openai');
    expect(wrapped).toBeInstanceOf(RateLimitError);
    expect(wrapped.retryAfter).toBe('60');
    expect(wrapped.limit).toBe('100');
    expect(wrapped.remaining).toBe('0');
  });

  it('wraps a timeout into TimeoutError', () => {
    const err = { code: 'ECONNABORTED', message: 'timeout of 8000ms exceeded' };
    const wrapped = wrapProviderError(err, 'weather');
    expect(wrapped).toBeInstanceOf(TimeoutError);
    expect(wrapped.provider).toBe('weather');
  });

  it('wraps unknown errors into ProviderError', () => {
    const err = { response: { status: 500, data: { message: 'Internal Server Error' } } };
    const wrapped = wrapProviderError(err, 'payments');
    expect(wrapped).toBeInstanceOf(ProviderError);
    expect(wrapped.httpStatus).toBe(500);
  });
});
