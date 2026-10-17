import { describe, it, expect, beforeEach } from 'vitest';
import * as cache from '../../src/core/cache.js';

describe('Cache Core', () => {
  beforeEach(() => {
    cache.flush();
  });

  it('should set and get a value', () => {
    cache.set('test-key', { foo: 'bar' });
    expect(cache.get('test-key')).toEqual({ foo: 'bar' });
  });

  it('should return null for non-existent keys', () => {
    expect(cache.get('non-existent-key')).toBeNull();
  });

  it('should delete a key', () => {
    cache.set('delete-me', 'value');
    cache.del('delete-me');
    expect(cache.get('delete-me')).toBeNull();
  });
});
