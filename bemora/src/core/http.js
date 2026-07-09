import axios from 'axios';
import { DEFAULT_HEADERS } from './headers.js';

const DEFAULT_TIMEOUT_MS = 8000;

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
