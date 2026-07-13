import { describe, it, expect, beforeEach } from 'vitest';
import { RateLimiter } from '../src/ratelimit.js';

describe('RateLimiter', () => {
  let limiter;
  beforeEach(() => {
    limiter = new RateLimiter();
  });

  it('allows calls under the configured budget', () => {
    limiter.configure('svc', { limit: 3, window: 'minute' });
    limiter.record('svc');
    limiter.record('svc');
    expect(limiter.isLimited('svc')).toBe(false);
  });

  it('throws once the budget is exceeded', () => {
    limiter.configure('svc', { limit: 2, window: 'minute' });
    limiter.record('svc');
    limiter.record('svc');
    expect(() => limiter.record('svc')).toThrow(/Rate limit exceeded/);
    expect(limiter.isLimited('svc')).toBe(true);
  });

  it('does not track or limit unconfigured keys', () => {
    expect(limiter.isLimited('unknown')).toBe(false);
    expect(() => limiter.record('unknown')).not.toThrow();
  });

  it('reports status with a warning near the limit', () => {
    limiter.configure('svc', { limit: 10, window: 'hour' });
    for (let i = 0; i < 9; i++) limiter.record('svc');
    const status = limiter.getStatus('svc');
    expect(status.used).toBe(9);
    expect(status.warning).toBe(true);
  });
});
