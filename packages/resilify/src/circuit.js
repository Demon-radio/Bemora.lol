/**
 * Circuit Breaker — per-key state machine.
 *
 * States:
 *   CLOSED    — normal operation; all requests flow through.
 *   OPEN      — failing fast; requests are rejected immediately without
 *               calling the underlying function, until openDuration elapses.
 *   HALF_OPEN — recovery probe; exactly one request is allowed through.
 *               If it succeeds (successThreshold times), the circuit closes.
 *               If it fails, the circuit reopens.
 *
 * Configuration (all optional, with sensible defaults):
 *   failureThreshold  — consecutive failures before OPEN  (default 5)
 *   successThreshold  — consecutive successes in HALF_OPEN to CLOSE (default 2)
 *   openDuration      — ms to stay OPEN before allowing a probe (default 60 000)
 *
 * Low-level usage:
 *   import { getBreaker } from 'resilify/circuit';
 *   const breaker = getBreaker('payments-api');
 *   const decision = breaker.check(); // 'allow' | 'reject' | 'probe'
 *   try {
 *     if (decision === 'probe') breaker.startProbe();
 *     const result = await callProvider();
 *     breaker.recordSuccess();
 *   } catch (err) {
 *     breaker.recordFailure();
 *   } finally {
 *     if (decision === 'probe') breaker.endProbe();
 *   }
 *
 * Most users should reach for the higher-level `resilient()` wrapper in
 * `resilify` instead of driving this state machine by hand.
 */

const DEFAULT_OPTS = {
  failureThreshold: 5,
  successThreshold: 2,
  openDuration: 60_000, // 1 minute
};

export class CircuitBreaker {
  constructor(key, opts = {}) {
    this.key = key;
    this._failureThreshold = opts.failureThreshold ?? DEFAULT_OPTS.failureThreshold;
    this._successThreshold = opts.successThreshold ?? DEFAULT_OPTS.successThreshold;
    this._openDuration = opts.openDuration ?? DEFAULT_OPTS.openDuration;

    this.state = 'CLOSED';
    this._failures = 0;
    this._successes = 0;
    this._openedAt = null;
    this._probeInFlight = false;
    this._totalOpens = 0;
    this._lastStateChange = Date.now();
  }

  /**
   * Check whether a request should be allowed, rejected, or used as a probe.
   * @returns {'allow'|'reject'|'probe'}
   */
  check() {
    if (this.state === 'CLOSED') return 'allow';

    if (this.state === 'OPEN') {
      if (Date.now() - this._openedAt >= this._openDuration) {
        this._transitionTo('HALF_OPEN');
      } else {
        return 'reject';
      }
    }

    if (this._probeInFlight) return 'reject'; // only one probe at a time
    return 'probe';
  }

  /** Mark a request as the in-flight probe (call before the request). */
  startProbe() {
    this._probeInFlight = true;
  }

  /** Release the probe lock (call in finally after the request). */
  endProbe() {
    this._probeInFlight = false;
  }

  /** Record a successful call outcome. */
  recordSuccess() {
    if (this.state === 'HALF_OPEN') {
      this._successes++;
      if (this._successes >= this._successThreshold) {
        this._transitionTo('CLOSED');
      }
    } else if (this.state === 'CLOSED') {
      this._failures = 0; // reset on any success
    }
  }

  /** Record a failed call outcome. */
  recordFailure() {
    if (this.state === 'HALF_OPEN') {
      this._transitionTo('OPEN'); // failed probe — reopen with a fresh window
    } else if (this.state === 'CLOSED') {
      this._failures++;
      if (this._failures >= this._failureThreshold) {
        this._transitionTo('OPEN');
      }
    }
  }

  /** Manually force the circuit OPEN (e.g. scheduled maintenance). */
  forceOpen() {
    this._transitionTo('OPEN');
  }

  /** Manually close the circuit (e.g. after a confirmed fix). */
  forceClose() {
    this._transitionTo('CLOSED');
  }

  /** Return a snapshot of the breaker state (safe to serialize/log). */
  getState() {
    return {
      key: this.key,
      state: this.state,
      failures: this._failures,
      successes: this._successes,
      openedAt: this._openedAt,
      probeInFlight: this._probeInFlight,
      totalOpens: this._totalOpens,
      lastStateChange: this._lastStateChange,
      config: {
        failureThreshold: this._failureThreshold,
        successThreshold: this._successThreshold,
        openDuration: this._openDuration,
      },
    };
  }

  _transitionTo(newState) {
    this.state = newState;
    this._lastStateChange = Date.now();

    if (newState === 'OPEN') {
      this._openedAt = Date.now();
      this._totalOpens++;
      this._successes = 0;
      this._probeInFlight = false;
    } else if (newState === 'CLOSED') {
      this._failures = 0;
      this._successes = 0;
      this._openedAt = null;
    } else if (newState === 'HALF_OPEN') {
      this._successes = 0;
      this._failures = 0;
    }
  }
}

// ── Global per-key registry ────────────────────────────────────────────────

const breakers = new Map();

/**
 * Get (or lazily create) the circuit breaker for a key.
 * @param {string} key
 * @param {object} [opts]
 * @returns {CircuitBreaker}
 */
export function getBreaker(key, opts) {
  if (!breakers.has(key)) {
    breakers.set(key, new CircuitBreaker(key, opts ?? {}));
  }
  return breakers.get(key);
}

/** Reset a key's circuit breaker to CLOSED state. */
export function resetBreaker(key) {
  breakers.delete(key);
}

/** Reset all circuit breakers. */
export function resetAllBreakers() {
  breakers.clear();
}

/** Return state snapshots for all tracked keys. */
export function getAllBreakerStates() {
  return [...breakers.values()].map((b) => b.getState());
}

export const _defaults = DEFAULT_OPTS;

/**
 * Class of error thrown when a circuit breaker rejects a call outright
 * (i.e. it never reached the underlying function).
 */
export class CircuitOpenError extends Error {
  constructor(key) {
    super(`Circuit "${key}" is OPEN — call rejected without hitting the underlying function`);
    this.name = 'CircuitOpenError';
    this.key = key;
  }
}

/**
 * Run `fn` guarded by the circuit breaker for `key`.
 * @param {string} key
 * @param {() => Promise<any>} fn
 * @param {object} [opts] - CircuitBreaker options
 */
export async function withCircuitBreaker(key, fn, opts) {
  const breaker = getBreaker(key, opts);
  const decision = breaker.check();

  if (decision === 'reject') {
    throw new CircuitOpenError(key);
  }

  if (decision === 'probe') breaker.startProbe();
  try {
    const result = await fn();
    breaker.recordSuccess();
    return result;
  } catch (err) {
    breaker.recordFailure();
    throw err;
  } finally {
    if (decision === 'probe') breaker.endProbe();
  }
}
