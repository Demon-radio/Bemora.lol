import { describe, it, expect, beforeEach } from 'vitest';
import {
  getBreaker,
  resetBreaker,
  resetAllBreakers,
  getAllBreakerStates,
  _defaults,
} from '../../src/core/circuit.js';

const PROVIDER = 'test-provider';

beforeEach(() => {
  resetAllBreakers();
});

describe('CircuitBreaker', () => {
  // ── initial state ────────────────────────────────────────────────────────
  it('starts in CLOSED state', () => {
    const b = getBreaker(PROVIDER);
    expect(b.state).toBe('CLOSED');
  });

  it('check() returns "allow" when CLOSED', () => {
    expect(getBreaker(PROVIDER).check()).toBe('allow');
  });

  // ── opening ──────────────────────────────────────────────────────────────
  it('transitions to OPEN after failureThreshold consecutive failures', () => {
    const b = getBreaker(PROVIDER, { failureThreshold: 3 });
    b.recordFailure();
    b.recordFailure();
    expect(b.state).toBe('CLOSED'); // not yet
    b.recordFailure();
    expect(b.state).toBe('OPEN');
  });

  it('check() returns "reject" when OPEN and openDuration has not elapsed', () => {
    const b = getBreaker(PROVIDER, { failureThreshold: 1, openDuration: 60_000 });
    b.recordFailure();
    expect(b.state).toBe('OPEN');
    expect(b.check()).toBe('reject');
  });

  it('resets failure counter after a success in CLOSED state', () => {
    const b = getBreaker(PROVIDER, { failureThreshold: 3 });
    b.recordFailure();
    b.recordFailure();
    b.recordSuccess();
    b.recordFailure();
    b.recordFailure();
    expect(b.state).toBe('CLOSED'); // two failures after success — still under threshold
  });

  it('increments totalOpens when transitioning to OPEN', () => {
    const b = getBreaker(PROVIDER, { failureThreshold: 1 });
    expect(b._totalOpens).toBe(0);
    b.recordFailure();
    expect(b._totalOpens).toBe(1);
  });

  // ── HALF_OPEN ────────────────────────────────────────────────────────────
  it('transitions to HALF_OPEN when openDuration elapses', () => {
    const b = getBreaker(PROVIDER, { failureThreshold: 1, openDuration: 0 });
    b.recordFailure(); // → OPEN
    const decision = b.check();
    expect(b.state).toBe('HALF_OPEN');
    expect(decision).toBe('probe');
  });

  it('allows only one probe at a time in HALF_OPEN', () => {
    const b = getBreaker(PROVIDER, { failureThreshold: 1, openDuration: 0 });
    b.recordFailure();
    b.check(); // → HALF_OPEN, returns 'probe'
    b.startProbe();
    expect(b.check()).toBe('reject'); // probe already in-flight
  });

  it('closes after successThreshold successes in HALF_OPEN', () => {
    const b = getBreaker(PROVIDER, { failureThreshold: 1, openDuration: 0, successThreshold: 2 });
    b.recordFailure(); // → OPEN
    b.check();         // → HALF_OPEN
    b.recordSuccess();
    expect(b.state).toBe('HALF_OPEN'); // not yet
    b.recordSuccess();
    expect(b.state).toBe('CLOSED');
  });

  it('re-opens immediately on a failed probe', () => {
    const b = getBreaker(PROVIDER, { failureThreshold: 1, openDuration: 0 });
    b.recordFailure(); // → OPEN
    b.check();         // → HALF_OPEN
    b.startProbe();
    b.recordFailure(); // failed probe → back to OPEN
    expect(b.state).toBe('OPEN');
    expect(b._probeInFlight).toBe(false);
  });

  // ── forceOpen / forceClose ────────────────────────────────────────────────
  it('forceOpen() sets state to OPEN regardless of failure count', () => {
    const b = getBreaker(PROVIDER);
    b.forceOpen();
    expect(b.state).toBe('OPEN');
    expect(b._totalOpens).toBe(1);
  });

  it('forceClose() resets state to CLOSED', () => {
    const b = getBreaker(PROVIDER, { failureThreshold: 1 });
    b.recordFailure();
    expect(b.state).toBe('OPEN');
    b.forceClose();
    expect(b.state).toBe('CLOSED');
    expect(b._failures).toBe(0);
  });

  // ── getState ──────────────────────────────────────────────────────────────
  it('getState() includes config and runtime info', () => {
    const b = getBreaker(PROVIDER, { failureThreshold: 4 });
    const s = b.getState();
    expect(s.provider).toBe(PROVIDER);
    expect(s.state).toBe('CLOSED');
    expect(s.config.failureThreshold).toBe(4);
    expect(typeof s.lastStateChange).toBe('number');
  });

  // ── global registry ────────────────────────────────────────────────────────
  it('getBreaker() returns the same instance for the same provider', () => {
    const a = getBreaker(PROVIDER);
    const b = getBreaker(PROVIDER);
    expect(a).toBe(b);
  });

  it('resetBreaker() removes the entry so a fresh one is created next time', () => {
    const a = getBreaker(PROVIDER, { failureThreshold: 1 });
    a.recordFailure();
    resetBreaker(PROVIDER);
    const b = getBreaker(PROVIDER);
    expect(b.state).toBe('CLOSED');
    expect(a).not.toBe(b);
  });

  it('getAllBreakerStates() includes all tracked providers', () => {
    getBreaker('p1');
    getBreaker('p2');
    const states = getAllBreakerStates();
    expect(states.map((s) => s.provider)).toEqual(expect.arrayContaining(['p1', 'p2']));
  });

  // ── defaults ──────────────────────────────────────────────────────────────
  it('_defaults exports sensible values', () => {
    expect(_defaults.failureThreshold).toBeGreaterThan(0);
    expect(_defaults.successThreshold).toBeGreaterThan(0);
    expect(_defaults.openDuration).toBeGreaterThan(0);
  });
});
