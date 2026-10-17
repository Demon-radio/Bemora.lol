/**
 * Circuit Breaker — per-provider state machine.
 *
 * States:
 *   CLOSED   — normal operation; all requests flow through.
 *   OPEN     — failing fast; requests are rejected immediately without
 *              calling the provider, until openDuration elapses.
 *   HALF_OPEN — recovery probe; exactly one request is allowed through.
 *              If it succeeds (successThreshold times), the circuit closes.
 *              If it fails, the circuit reopens.
 *
 * Configuration (all optional, with sensible defaults):
 *   failureThreshold  — consecutive failures before OPEN  (default 5)
 *   successThreshold  — consecutive successes in HALF_OPEN to CLOSE (default 2)
 *   openDuration      — ms to stay OPEN before allowing a probe (default 60 000)
 *
 * Usage:
 *   import { getBreaker } from './circuit.js';
 *   const breaker = getBreaker('coingecko');
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
 */

const DEFAULT_OPTS = {
  failureThreshold: 5,
  successThreshold: 2,
  openDuration: 60_000, // 1 minute
};

class CircuitBreaker {
  constructor(provider, opts = {}) {
    this.provider = provider;
    this._failureThreshold  = opts.failureThreshold  ?? DEFAULT_OPTS.failureThreshold;
    this._successThreshold  = opts.successThreshold  ?? DEFAULT_OPTS.successThreshold;
    this._openDuration      = opts.openDuration      ?? DEFAULT_OPTS.openDuration;

    this.state             = 'CLOSED';
    this._failures         = 0;
    this._successes        = 0;
    this._openedAt         = null;
    this._probeInFlight    = false;
    this._totalOpens       = 0;
    this._lastStateChange  = Date.now();
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
        // fallthrough to HALF_OPEN logic
      } else {
        return 'reject';
      }
    }

    // HALF_OPEN
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
    // In OPEN state a success shouldn't occur (probe handles it), but reset anyway
  }

  /** Record a failed call outcome. */
  recordFailure() {
    if (this.state === 'HALF_OPEN') {
      // Failed probe — go back to OPEN with a fresh open window
      this._transitionTo('OPEN');
    } else if (this.state === 'CLOSED') {
      this._failures++;
      if (this._failures >= this._failureThreshold) {
        this._transitionTo('OPEN');
      }
    }
    // Already OPEN — nothing to do (failure was rejected before reaching provider)
  }

  /** Manually force the circuit OPEN (e.g. scheduled maintenance). */
  forceOpen() {
    this._transitionTo('OPEN');
  }

  /** Manually close the circuit (e.g. after a deployment fix). */
  forceClose() {
    this._transitionTo('CLOSED');
  }

  /** Return a snapshot of the breaker state (safe to serialize). */
  getState() {
    return {
      provider:          this.provider,
      state:             this.state,
      failures:          this._failures,
      successes:         this._successes,
      openedAt:          this._openedAt,
      probeInFlight:     this._probeInFlight,
      totalOpens:        this._totalOpens,
      lastStateChange:   this._lastStateChange,
      config: {
        failureThreshold: this._failureThreshold,
        successThreshold: this._successThreshold,
        openDuration:     this._openDuration,
      },
    };
  }

  // ── private ─────────────────────────────────────────────────────────────

  _transitionTo(newState) {
    this.state            = newState;
    this._lastStateChange = Date.now();

    if (newState === 'OPEN') {
      this._openedAt = Date.now();
      this._totalOpens++;
      this._successes = 0;
      this._probeInFlight = false;
    } else if (newState === 'CLOSED') {
      this._failures  = 0;
      this._successes = 0;
      this._openedAt  = null;
    } else if (newState === 'HALF_OPEN') {
      this._successes = 0;
      this._failures  = 0;
    }
  }
}

// ── Global per-provider registry ────────────────────────────────────────────

const breakers = new Map();

/**
 * Get (or lazily create) the circuit breaker for a provider.
 * @param {string} provider
 * @param {object} [opts]
 * @returns {CircuitBreaker}
 */
export function getBreaker(provider, opts) {
  if (!breakers.has(provider)) {
    breakers.set(provider, new CircuitBreaker(provider, opts ?? {}));
  }
  return breakers.get(provider);
}

/** Reset a provider's circuit breaker to CLOSED state. */
export function resetBreaker(provider) {
  breakers.delete(provider);
}

/** Reset all circuit breakers. */
export function resetAllBreakers() {
  breakers.clear();
}

/** Return state snapshots for all tracked providers. */
export function getAllBreakerStates() {
  return [...breakers.values()].map((b) => b.getState());
}

export const _defaults = DEFAULT_OPTS;
