/**
 * Provider health registry — tracks live status per provider based on
 * observed request outcomes (not synthetic health pings).
 *
 * Status states: 'unknown' | 'healthy' | 'degraded' | 'dead'
 * - 'unknown'  — no requests recorded yet
 * - 'healthy'  — recent requests succeeded
 * - 'degraded' — some recent failures, but under the dead threshold
 * - 'dead'     — N consecutive failures; skipped by fallback chains until recovery check
 *
 * Dead providers are periodically allowed one "probe" request (every
 * RECOVERY_INTERVAL_MS) to detect recovery automatically.
 */
const DEAD_THRESHOLD = 5;
const DEGRADED_THRESHOLD = 2;
const RECOVERY_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

const registry = new Map();

function getEntry(provider) {
  if (!registry.has(provider)) {
    registry.set(provider, {
      provider,
      status: 'unknown',
      consecutiveFailures: 0,
      consecutiveSuccesses: 0,
      totalRequests: 0,
      totalFailures: 0,
      lastSuccess: null,
      lastFailure: null,
      lastError: null,
      markedDeadAt: null,
    });
  }
  return registry.get(provider);
}

/** Record a successful call for a provider. */
export function markSuccess(provider) {
  const e = getEntry(provider);
  e.totalRequests++;
  e.consecutiveFailures = 0;
  e.consecutiveSuccesses++;
  e.lastSuccess = Date.now();
  e.status = 'healthy';
  e.markedDeadAt = null;
  return e;
}

/** Record a failed call for a provider. */
export function markFailure(provider, error) {
  const e = getEntry(provider);
  e.totalRequests++;
  e.totalFailures++;
  e.consecutiveSuccesses = 0;
  e.consecutiveFailures++;
  e.lastFailure = Date.now();
  e.lastError = error?.message || String(error);

  if (e.consecutiveFailures >= DEAD_THRESHOLD) {
    e.status = 'dead';
    e.markedDeadAt = Date.now();
  } else if (e.consecutiveFailures >= DEGRADED_THRESHOLD) {
    e.status = 'degraded';
  }
  return e;
}

/**
 * Whether a provider should be skipped right now (dead and not due for a
 * recovery probe yet). Fallback chains and _wrap consult this before calling.
 */
export function shouldSkip(provider) {
  const e = registry.get(provider);
  if (!e || e.status !== 'dead') return false;
  const dueForProbe = Date.now() - e.markedDeadAt >= RECOVERY_INTERVAL_MS;
  return !dueForProbe;
}

/** Get the status entry for a single provider. */
export function getProviderStatus(provider) {
  return registry.has(provider) ? { ...registry.get(provider) } : { provider, status: 'unknown', consecutiveFailures: 0, totalRequests: 0, totalFailures: 0 };
}

/** Get status for every tracked provider. */
export function getAllProviderStatus() {
  return [...registry.values()].map((e) => ({ ...e }));
}

/** Reset a provider's tracked status (mostly useful for tests). */
export function resetProvider(provider) {
  registry.delete(provider);
}

/** Reset the entire registry (mostly useful for tests). */
export function resetRegistry() {
  registry.clear();
}

export const _config = { DEAD_THRESHOLD, DEGRADED_THRESHOLD, RECOVERY_INTERVAL_MS };
