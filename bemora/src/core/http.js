import axios from 'axios';
import { DEFAULT_HEADERS } from './headers.js';

const DEFAULT_TIMEOUT_MS = 8000;

/**
 * Optional global tracing-header injector for OpenTelemetry W3C context propagation.
 * Set via setTracingHeadersProvider() from otel.js.
 * @type {Function|null}
 */
let _tracingHeadersProvider = null;

/**
 * Register a function that returns extra headers to inject on every outbound
 * request (used by wireOtel to propagate W3C traceparent/tracestate).
 * Pass null to disable.
 * @param {(() => Record<string, string>)|null} fn
 */
export function setTracingHeadersProvider(fn) {
  _tracingHeadersProvider = fn;
}

/**
 * Shared axios instance factory. Centralizes timeout, User-Agent, and
 * AbortSignal handling so individual providers don't each reinvent it.
 *
 * Usage:
 *   import { httpClient } from '../core/http.js';
 *   const http = httpClient();
 *   const { data } = await http.get(url, { signal });
 *
 * @param {object} [opts]
 * @param {number} [opts.timeout=8000] - request timeout in ms
 * @param {object} [opts.headers] - extra headers merged with the shared UA
 * @param {number} [opts.retries] - reserved for future retry wiring
 */
export function httpClient(opts = {}) {
  const { timeout = DEFAULT_TIMEOUT_MS, headers = {} } = opts;

  const instance = axios.create({
    timeout,
    headers: { ...DEFAULT_HEADERS, ...headers },
  });

  // Inject OTel W3C trace-context headers on every outbound request when
  // wireOtel() has registered a tracing headers provider.
  instance.interceptors.request.use((config) => {
    if (_tracingHeadersProvider) {
      const tracingHeaders = _tracingHeadersProvider();
      if (tracingHeaders) {
        config.headers = { ...tracingHeaders, ...config.headers };
      }
    }
    return config;
  });

  return instance;
}

/**
 * Convenience one-off request helper for call sites that don't want to hold
 * on to a client instance. Always applies the default timeout + UA unless
 * overridden, and passes through an AbortSignal if provided.
 */
export function request(config = {}) {
  return axios({
    timeout: DEFAULT_TIMEOUT_MS,
    ...config,
    headers: { ...DEFAULT_HEADERS, ...(config.headers || {}) },
  });
}

export const DEFAULT_TIMEOUT = DEFAULT_TIMEOUT_MS;
