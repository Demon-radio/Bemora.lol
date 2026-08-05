import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  CircuitBreaker,
  CircuitOpenError,
  getBreaker,
  resetBreaker,
  resetAllBreakers,
  getAllBreakerStates,
  withCircuitBreaker,
} from '../src/circuit.js';

beforeEach(() => {
  resetAllBreakers();
});

// ── CircuitBreaker state machine ────────────────────────────────────────────

describe('CircuitBreaker — CLOSED state', () => {
  it('starts CLOSED and allows all calls', () => {
    const cb = new CircuitBreaker('test');
    expect(cb.state).toBe('CLOSED');
    expect(cb.check()).toBe('allow');
  });

  it('resets failure count on a success while CLOSED', () => {
    const cb = new CircuitBreaker('test', { failureThreshold: 3 });
    cb.recordFailure();
    cb.recordFailure();
    cb.recordSuccess(); // resets count
    cb.recordFailure();
    cb.recordFailure();
    expect(cb.state).toBe('CLOSED'); // only 2 failures after reset, threshold is 3
  });

  it('trips OPEN after failureThreshold consecutive failures', () => {
    const cb = new CircuitBreaker('test', { failureThreshold: 3 });
    cb.recordFailure();
    cb.recordFailure();
    expect(cb.state).toBe('CLOSED');
    cb.recordFailure();
    expect(cb.state).toBe('OPEN');
  });
});

describe('CircuitBreaker — OPEN state', () => {
  it('rejects calls while OPEN', () => {
    const cb = new CircuitBreaker('test', { failureThreshold: 1, openDuration: 60_000 });
    cb.recordFailure();
    expect(cb.check()).toBe('reject');
  });

  it('transitions to HALF_OPEN after openDuration elapses', () => {
    const cb = new CircuitBreaker('test', { failureThreshold: 1, openDuration: 0 });
    cb.recordFailure();
    expect(cb.state).toBe('OPEN');
    // openDuration is 0 ms — next check should promote to HALF_OPEN
    expect(cb.check()).toBe('probe');
    expect(cb.state).toBe('HALF_OPEN');
  });

  it('tracks totalOpens across multiple trips', () => {
    const cb = new CircuitBreaker('test', { failureThreshold: 1, openDuration: 0 });
    cb.recordFailure(); // opens 1st time
    cb.check();         // → HALF_OPEN
    cb.recordFailure(); // reopens
    expect(cb.getState().totalOpens).toBe(2);
  });
});

describe('CircuitBreaker — HALF_OPEN / recovery', () => {
  it('allows exactly one probe at a time while HALF_OPEN', () => {
    const cb = new CircuitBreaker('test', { failureThreshold: 1, openDuration: 0 });
    cb.recordFailure();
    expect(cb.check()).toBe('probe'); // HALF_OPEN, no probe yet
    cb.startProbe();
    expect(cb.check()).toBe('reject'); // already a probe in flight
  });

  it('closes after successThreshold successes in HALF_OPEN', () => {
    const cb = new CircuitBreaker('test', { failureThreshold: 1, openDuration: 0, successThreshold: 2 });
    cb.recordFailure();
    cb.check(); // → HALF_OPEN
    cb.recordSuccess();
    expect(cb.state).toBe('HALF_OPEN'); // one success, not enough yet
    cb.recordSuccess();
    expect(cb.state).toBe('CLOSED');
  });

  it('reopens immediately on a failed probe', () => {
    const cb = new CircuitBreaker('test', { failureThreshold: 1, openDuration: 0 });
    cb.recordFailure();
    cb.check(); // → HALF_OPEN
    cb.recordFailure();
    expect(cb.state).toBe('OPEN');
  });
});

describe('CircuitBreaker — manual controls', () => {
  it('forceOpen trips the breaker regardless of failure count', () => {
    const cb = new CircuitBreaker('test', { failureThreshold: 100 });
    cb.forceOpen();
    expect(cb.state).toBe('OPEN');
    expect(cb.check()).toBe('reject');
  });

  it('forceClose closes the breaker and clears counters', () => {
    const cb = new CircuitBreaker('test', { failureThreshold: 1 });
    cb.recordFailure();
    expect(cb.state).toBe('OPEN');
    cb.forceClose();
    expect(cb.state).toBe('CLOSED');
    expect(cb.getState().failures).toBe(0);
  });
});

describe('CircuitBreaker — getState snapshot', () => {
  it('returns a serialisable snapshot', () => {
    const cb = new CircuitBreaker('payments', { failureThreshold: 2 });
    cb.recordFailure();
    const snap = cb.getState();
    expect(snap.key).toBe('payments');
    expect(snap.state).toBe('CLOSED');
    expect(snap.failures).toBe(1);
    expect(snap.config.failureThreshold).toBe(2);
    // Must be JSON-safe
    expect(() => JSON.stringify(snap)).not.toThrow();
  });
});

// ── Registry helpers ────────────────────────────────────────────────────────

describe('getBreaker / resetBreaker / getAllBreakerStates', () => {
  it('returns the same instance for the same key', () => {
    const a = getBreaker('svc');
    const b = getBreaker('svc');
    expect(a).toBe(b);
  });

  it('resets a specific key', () => {
    const original = getBreaker('svc');
    original.recordFailure();
    resetBreaker('svc');
    const fresh = getBreaker('svc');
    expect(fresh.getState().failures).toBe(0);
    expect(fresh).not.toBe(original);
  });

  it('getAllBreakerStates includes all tracked keys', () => {
    getBreaker('alpha');
    getBreaker('beta');
    const states = getAllBreakerStates();
    const keys = states.map((s) => s.key);
    expect(keys).toContain('alpha');
    expect(keys).toContain('beta');
  });

  it('warns when opts are provided for an already-existing breaker', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    getBreaker('existing', { failureThreshold: 5 }); // creates it
    getBreaker('existing', { failureThreshold: 3 }); // opts should be ignored
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('already exists'));
    warn.mockRestore();
  });
});

// ── withCircuitBreaker helper ───────────────────────────────────────────────

describe('withCircuitBreaker()', () => {
  it('passes through the result on success', async () => {
    const result = await withCircuitBreaker('ok', async () => 42);
    expect(result).toBe(42);
  });

  it('throws CircuitOpenError when the circuit is OPEN', async () => {
    const cb = getBreaker('tripped', { failureThreshold: 1, openDuration: 60_000 });
    cb.forceOpen();
    await expect(withCircuitBreaker('tripped', async () => 'should not run')).rejects.toThrow(CircuitOpenError);
  });

  it('records failures and trips the circuit', async () => {
    for (let i = 0; i < 5; i++) {
      await expect(withCircuitBreaker('trip-me', async () => { throw new Error('fail'); })).rejects.toThrow('fail');
    }
    const state = getBreaker('trip-me').getState();
    expect(state.state).toBe('OPEN');
  });
});
