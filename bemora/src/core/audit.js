/**
 * Audit log for Bemora.
 *
 * Records which tenant called which provider, at what time, with sanitized
 * parameters. Supports pluggable transports (console, file, HTTP, etc.).
 *
 * Usage:
 *   import { audit, onAuditEntry, setAuditTransport } from '../core/audit.js';
 *
 *   // Register a custom transport (e.g. write to a database or log aggregator)
 *   setAuditTransport(async (entry) => {
 *     await db.auditLog.insert(entry);
 *   });
 *
 *   // Record an entry manually (or use wireAudit to auto-hook a Bemora instance)
 *   audit({ tenantId: 'cust_123', provider: 'stripe', method: 'createCharge', params: { amount: 2000 } });
 */

// ── Storage ───────────────────────────────────────────────────────────────────

/** @type {Function|null} */
let _transport = null;

/** In-memory ring buffer (max 1 000 entries) */
const _buffer = [];
const BUFFER_MAX = 1000;

// ── Sensitive key names to redact from params ─────────────────────────────────
const SENSITIVE_KEYS = new Set([
  'apiKey', 'api_key', 'secret', 'secretKey', 'accessToken', 'token',
  'password', 'clientSecret', 'privateKey', 'Authorization', 'authorization',
  'idempotencyKey',
]);

function sanitize(obj, depth = 0) {
  if (depth > 5 || obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map((v) => sanitize(v, depth + 1));
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    out[k] = SENSITIVE_KEYS.has(k) ? '[REDACTED]' : sanitize(v, depth + 1);
  }
  return out;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Set the audit transport.
 * Pass null to disable the transport (entries still accumulate in memory).
 * @param {Function|null} fn - async (entry) => void
 */
export function setAuditTransport(fn) {
  _transport = fn;
}

/**
 * Record an audit entry.
 *
 * @param {{ tenantId?: string, provider: string, method?: string, params?: object, success?: boolean, errorCode?: string, requestId?: string }} opts
 */
export function audit(opts = {}) {
  const entry = {
    ts: new Date().toISOString(),
    tenantId: opts.tenantId ?? null,
    provider: opts.provider,
    method: opts.method ?? null,
    params: opts.params ? sanitize(opts.params) : undefined,
    success: opts.success ?? true,
    errorCode: opts.errorCode ?? null,
    requestId: opts.requestId ?? null,
  };

  // Maintain ring buffer
  _buffer.push(entry);
  if (_buffer.length > BUFFER_MAX) _buffer.shift();

  // Dispatch to transport (fire-and-forget, never throws)
  if (_transport) {
    Promise.resolve().then(() => _transport(entry)).catch(() => {});
  }

  return entry;
}

/**
 * Get recent audit entries from the in-memory buffer.
 * @param {number} [limit=100]
 * @returns {Array}
 */
export function recentEntries(limit = 100) {
  return _buffer.slice(-limit);
}

/**
 * Get audit entries for a specific tenant.
 * @param {string} tenantId
 * @param {number} [limit=100]
 */
export function entriesForTenant(tenantId, limit = 100) {
  return _buffer.filter((e) => e.tenantId === tenantId).slice(-limit);
}

/**
 * Clear the in-memory audit buffer.
 */
export function clearBuffer() {
  _buffer.length = 0;
}

/**
 * Wire audit logging into a Bemora instance via its event bus.
 * Records every request and error automatically.
 *
 * @param {import('../index.js').Bemora} api
 * @param {{ tenantId?: string }} [opts]
 */
export function wireAudit(api, { tenantId } = {}) {
  api.on('request', ({ provider, method, args }) => {
    audit({
      tenantId: api.currentTenantId?.() ?? tenantId,
      provider,
      method,
      params: args?.[0],
      success: true,
    });
  });

  api.on('error', ({ provider, method, error }) => {
    audit({
      tenantId: api.currentTenantId?.() ?? tenantId,
      provider,
      method,
      success: false,
      errorCode: error?.code ?? error?.message,
    });
  });
}
