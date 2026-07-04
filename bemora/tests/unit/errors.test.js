import { describe, it, expect } from 'vitest';
import {
  BemoraError,
  ConfigurationError,
  ProviderError,
  ValidationError,
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
