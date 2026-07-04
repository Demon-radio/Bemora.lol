import { describe, it, expect, beforeEach } from 'vitest';
import {
  recordRequest,
  isRateLimited,
  getStatus,
  getAllStatus,
  resetUsage,
} from '../../src/core/ratelimit.js';

beforeEach(() => {
  resetUsage();
});

describe('ratelimit', () => {
  it('getStatus returns zero usage for a fresh provider', () => {
    const s = getStatus('coingecko');
    expect(s.used).toBe(0);
    expect(s.limit).toBe(30);
    expect(s.window).toBe('minute');
    expect(s.warning).toBe(false);
  });

  it('recordRequest increments usage for a tracked provider', () => {
    recordRequest('coingecko');
    recordRequest('coingecko');
    const s = getStatus('coingecko');
    expect(s.used).toBe(2);
  });

  it('isRateLimited returns false when under the limit', () => {
    for (let i = 0; i < 5; i++) recordRequest('coingecko');
    expect(isRateLimited('coingecko')).toBe(false);
  });

  it('isRateLimited returns true when at the limit', () => {
    // CoinGecko limit: 30/min — fill it up
    for (let i = 0; i < 30; i++) recordRequest('coingecko');
    expect(isRateLimited('coingecko')).toBe(true);
  });

  it('recordRequest throws when the rate limit is exceeded', () => {
    for (let i = 0; i < 30; i++) recordRequest('coingecko');
    expect(() => recordRequest('coingecko')).toThrow(/Rate limit exceeded/);
  });

  it('getStatus.warning is true when over 80% of the limit is used', () => {
    // 80% of 30 = 24, so 25 requests should trigger warning
    for (let i = 0; i < 25; i++) recordRequest('coingecko');
    const s = getStatus('coingecko');
    expect(s.warning).toBe(true);
  });

  it('getStatus.warning is false when under 80% of the limit', () => {
    for (let i = 0; i < 20; i++) recordRequest('coingecko');
    const s = getStatus('coingecko');
    expect(s.warning).toBe(false);
  });

  it('getAllStatus returns an array covering all known providers', () => {
    const all = getAllStatus();
    expect(Array.isArray(all)).toBe(true);
    const names = all.map((s) => s.provider);
    expect(names).toContain('coingecko');
    expect(names).toContain('newsapi');
    expect(names).toContain('openweathermap');
  });

  it('untracked provider has Infinity limit and no warning', () => {
    recordRequest('unknown-provider');
    const s = getStatus('unknown-provider');
    expect(s.limit).toBe(Infinity);
    expect(s.warning).toBe(false);
  });

  it('resetUsage clears all usage state', () => {
    for (let i = 0; i < 15; i++) recordRequest('coingecko');
    resetUsage();
    expect(getStatus('coingecko').used).toBe(0);
  });
});
