import { describe, it, expect, beforeEach } from 'vitest';
import { RateLimiter, RateLimitError } from '../src/ratelimit.js';

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

  it('throws RateLimitError once the budget is exceeded', () => {
    limiter.configure('svc', { limit: 2, window: 'minute' });
    limiter.record('svc');
    limiter.record('svc');
    expect(() => limiter.record('svc')).toThrow(RateLimitError);
    expect(limiter.isLimited('svc')).toBe(true);
  });

  it('RateLimitError carries key, limit, and window properties', () => {
    limiter.configure('svc', { limit: 1, window: 'second' });
    limiter.record('svc');
    try {
      limiter.record('svc');
      expect.fail('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(RateLimitError);
      expect(err.key).toBe('svc');
      expect(err.limit).toBe(1);
      expect(err.window).toBe('second');
    }
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

  it('getStatus returns configured:false and null limit for unconfigured keys', () => {
    const status = limiter.getStatus('ghost');
    expect(status.configured).toBe(false);
    expect(status.limit).toBeNull();
    // Must be JSON-safe (Infinity would serialize to null and lose information)
    expect(() => JSON.stringify(status)).not.toThrow();
    const parsed = JSON.parse(JSON.stringify(status));
    expect(parsed.limit).toBeNull();
  });

  it('reset() clears usage but preserves config by default', () => {
    limiter.configure('svc', { limit: 2, window: 'minute' });
    limiter.record('svc');
    limiter.reset();
    // Usage cleared — should be able to record again
    expect(() => limiter.record('svc')).not.toThrow();
    // Config still present
    expect(limiter.getStatus('svc').configured).toBe(true);
  });

  it('reset({ includeConfig: true }) wipes both usage and config', () => {
    limiter.configure('svc', { limit: 2, window: 'minute' });
    limiter.record('svc');
    limiter.reset({ includeConfig: true });
    expect(limiter.getStatus('svc').configured).toBe(false);
    // Now unconfigured — record should be a no-op
    expect(() => limiter.record('svc')).not.toThrow();
  });

  it('throws for an unknown window name', () => {
    expect(() => limiter.configure('svc', { limit: 1, window: 'decade' })).toThrow(/Unknown rate-limit window/);
  });

  it('supports all valid window names', () => {
    for (const window of ['second', 'minute', 'hour', 'day', 'month']) {
      expect(() => limiter.configure(`svc-${window}`, { limit: 10, window })).not.toThrow();
    }
  });
});

// ── Module-level helper functions ───────────────────────────────────────────

describe('module-level rate-limit helpers', () => {
  // Import helpers fresh so they share the default singleton limiter
  it('resetRateLimit({ includeConfig: true }) wipes both usage and config on the shared limiter', async () => {
    const { configure, record, reset, getStatus } = await import('../src/ratelimit.js');

    configure('shared-svc', { limit: 5, window: 'minute' });
    record('shared-svc');
    expect(getStatus('shared-svc').configured).toBe(true);

    reset({ includeConfig: true });

    const status = getStatus('shared-svc');
    expect(status.configured).toBe(false);
    expect(status.limit).toBeNull();

    // Clean up
    reset({ includeConfig: true });
  });

  it('resetRateLimit() without options preserves config on the shared limiter', async () => {
    const { configure, record, reset, getStatus } = await import('../src/ratelimit.js');

    configure('shared-svc2', { limit: 3, window: 'minute' });
    record('shared-svc2');
    reset(); // no includeConfig — should keep config intact
    expect(getStatus('shared-svc2').configured).toBe(true);
    expect(getStatus('shared-svc2').used).toBe(0); // usage cleared

    // Clean up
    reset({ includeConfig: true });
  });
});
