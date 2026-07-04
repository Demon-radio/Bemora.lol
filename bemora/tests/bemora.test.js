import { describe, it, expect } from 'vitest';
import { Bemora } from '../src/index.js';

describe('Bemora', () => {
  it('should create an instance', () => {
    const api = new Bemora();
    expect(api).toBeDefined();
  });

  it('should have interceptors', () => {
    const api = new Bemora();
    expect(api.interceptors).toBeDefined();
    expect(api.interceptors.request).toBeDefined();
    expect(api.interceptors.response).toBeDefined();
  });

  it('should have providers.status method', () => {
    const api = new Bemora();
    expect(api.providers).toBeDefined();
    expect(typeof api.providers.status).toBe('function');
  });
});
