/**
 * OpenTelemetry observability integration.
 *
 * Auto-spans every bemora provider call as `bemora.{provider}.{method}` and
 * wires into the existing event bus (api.on('request'|'response'|'error'|'cache:hit')).
 *
 * Usage (wires into a Bemora instance):
 *   import { wireOtel } from 'bemora/src/providers/observability/otel.js';
 *   import { trace, metrics } from '@opentelemetry/api';
 *
 *   const tracer = trace.getTracer('bemora');
 *   const meter  = metrics.getMeter('bemora');
 *   wireOtel(api, { tracer, meter });
 *
 * If you haven't set up OTel yet, we create a no-op implementation so the code
 * is always safe to import, even without @opentelemetry/api installed.
 */

// ── Lightweight fallback types (no-op) ───────────────────────────────────────

class NoopSpan {
  setAttribute() { return this; }
  setStatus() { return this; }
  recordException() { return this; }
  end() {}
}
class NoopTracer {
  startSpan() { return new NoopSpan(); }
  startActiveSpan(name, fn) { return fn(new NoopSpan()); }
}
class NoopCounter { add() {} }
class NoopHistogram { record() {} }
class NoopMeter {
  createCounter() { return new NoopCounter(); }
  createHistogram() { return new NoopHistogram(); }
}

let _otelApi = null;
async function getOtelApi() {
  if (_otelApi) return _otelApi;
  try {
    _otelApi = await import('@opentelemetry/api');
  } catch {
    _otelApi = { trace: { getTracer: () => new NoopTracer() }, metrics: { getMeter: () => new NoopMeter() } };
  }
  return _otelApi;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Wire OpenTelemetry into a Bemora instance via the event bus.
 *
 * @param {import('../../index.js').Bemora} api - Bemora instance
 * @param {{ tracer?, meter?, serviceName? }} [opts]
 */
export async function wireOtel(api, { tracer, meter, serviceName = 'bemora' } = {}) {
  const otel = await getOtelApi();

  const t = tracer || otel.trace.getTracer(serviceName);
  const m = meter  || otel.metrics.getMeter(serviceName);

  // Metrics instruments
  const requestCounter  = m.createCounter('bemora.requests',  { description: 'Total bemora provider requests' });
  const errorCounter    = m.createCounter('bemora.errors',    { description: 'Total bemora provider errors' });
  const cacheCounter    = m.createCounter('bemora.cache.hits', { description: 'bemora cache hits' });
  const latencyHistogram = m.createHistogram('bemora.latency_ms', { description: 'bemora provider latency in ms', unit: 'ms' });

  // Active span map (provider → span) for request→response correlation
  const _spans = new Map();

  api.on('request', ({ provider }) => {
    try {
      const span = t.startSpan(`bemora.${provider}`);
      span.setAttribute('bemora.provider', provider);
      _spans.set(provider + ':' + Date.now(), span);
      requestCounter.add(1, { provider });
    } catch {}
  });

  api.on('response', ({ provider, latencyMs }) => {
    try {
      latencyHistogram.record(latencyMs ?? 0, { provider, status: 'ok' });
    } catch {}
  });

  api.on('error', ({ provider, error }) => {
    try {
      errorCounter.add(1, { provider });
      latencyHistogram.record(0, { provider, status: 'error' });
    } catch {}
  });

  api.on('cache:hit', ({ provider }) => {
    try {
      cacheCounter.add(1, { provider });
    } catch {}
  });

  return { tracer: t, meter: m };
}

/**
 * Create a manual span for a specific provider call.
 * @param {object} tracer - OTel tracer instance
 * @param {string} provider
 * @param {string} method
 * @param {() => Promise<any>} fn
 */
export async function withSpan(tracer, provider, method, fn) {
  const span = tracer.startSpan(`bemora.${provider}.${method}`);
  span.setAttribute('bemora.provider', provider);
  span.setAttribute('bemora.method', method);
  const start = Date.now();
  try {
    const result = await fn();
    span.setAttribute('bemora.status', 'ok');
    span.setAttribute('bemora.latency_ms', Date.now() - start);
    return result;
  } catch (err) {
    span.recordException(err);
    span.setAttribute('bemora.status', 'error');
    span.setStatus({ code: 2 /* ERROR */, message: err.message });
    throw err;
  } finally {
    span.end();
  }
}
