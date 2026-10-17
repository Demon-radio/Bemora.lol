import { describe, it, expect } from 'vitest';
import { validateResponse, schemas } from '../../src/core/validate.js';
import { ValidationError } from '../../src/core/errors.js';

describe('validateResponse', () => {
  it('passes through data when no schema is registered for the key', () => {
    const data = { foo: 'bar' };
    const result = validateResponse('nonexistent.key', data);
    expect(result).toBe(data);
  });

  it('validates a valid crypto.price response', () => {
    const data = { bitcoin: { usd: 60000 }, ethereum: { usd: 3000 } };
    expect(() => validateResponse('crypto.price', data)).not.toThrow();
  });

  it('validates a valid weather.current response', () => {
    const data = {
      weather: [{ description: 'clear sky', id: 800 }],
      main: { temp: 25, feels_like: 23 },
      name: 'Cairo',
    };
    expect(() => validateResponse('weather.current', data)).not.toThrow();
  });

  it('validates a valid ip.lookup response', () => {
    const data = {
      query: '8.8.8.8',
      ip: '8.8.8.8',
      country: 'United States',
      status: 'success',
    };
    expect(() => validateResponse('ip.lookup', data)).not.toThrow();
  });

  it('validates a valid countries.byName response (array)', () => {
    const data = [{ name: { common: 'Egypt' }, cca2: 'EG' }];
    expect(() => validateResponse('countries.byName', data)).not.toThrow();
  });

  it('validates a valid search.web response', () => {
    const data = { results: [{ title: 'Result 1' }], query: 'test' };
    expect(() => validateResponse('search.web', data)).not.toThrow();
  });

  it('throws ValidationError when weather.current is missing required shape', () => {
    // main.temp must be a number — pass a string to trigger failure
    const data = { main: { temp: 'not-a-number' }, weather: [] };
    expect(() => validateResponse('weather.current', data)).toThrow(ValidationError);
  });

  it('ValidationError has the correct code and errors array', () => {
    try {
      const data = { main: { temp: 'not-a-number' }, weather: [] };
      validateResponse('weather.current', data);
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError);
      expect(e.code).toBe('VALIDATION_ERROR');
      expect(Array.isArray(e.errors)).toBe(true);
      expect(e.errors.length).toBeGreaterThan(0);
    }
  });

  it('schemas object contains the expected keys', () => {
    const keys = Object.keys(schemas);
    expect(keys).toContain('crypto.price');
    expect(keys).toContain('weather.current');
    expect(keys).toContain('ip.lookup');
    expect(keys).toContain('countries.byName');
    expect(keys).toContain('search.web');
  });

  it('extra fields are allowed (passthrough schemas)', () => {
    const data = {
      main: { temp: 20, humidity: 80, pressure: 1013 },
      weather: [{ description: 'cloudy', extra_field: 'ok' }],
      wind: { speed: 5 },
    };
    expect(() => validateResponse('weather.current', data)).not.toThrow();
  });
});
