/**
 * Sentry observability provider — captureException(), captureMessage(), captureEvent().
 * Uses the Sentry HTTP API (envelope format) — no Sentry SDK dependency.
 */

import { httpClient } from '../../core/http.js';
import { wrapProviderError, ConfigurationError } from '../../core/errors.js';
import { randomBytes } from 'node:crypto';

function parsedsn(dsn) {
  const u = new URL(dsn);
  const projectId = u.pathname.replace('/', '');
  const host = u.hostname;
  const key = u.username;
  return { host, projectId, key, storeUrl: `https://${host}/api/${projectId}/store/`, envelopeUrl: `https://${host}/api/${projectId}/envelope/` };
}

function uuid4() {
  return randomBytes(16).toString('hex').replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
}

function client() {
  return httpClient({ timeout: 10_000, headers: { 'Content-Type': 'application/json' } });
}

function buildHeader(key) {
  return `Sentry sentry_key=${key},sentry_version=7,sentry_client=bemora-enterprise/1.0`;
}

/**
 * Capture an exception (Error object or message string).
 * @param {{ error: Error|string, user?: object, tags?: object, extras?: object, level?: string, signal?: AbortSignal }} params
 * @param {string} dsn - Sentry DSN
 */
export async function captureException({ error, user, tags, extras, level = 'error', signal } = {}, dsn) {
  if (!dsn) throw new ConfigurationError('[sentry] Missing DSN', { provider: 'sentry' });
  try {
    const { storeUrl, key } = parsedsn(dsn);
    const isError = error instanceof Error;
    const event = {
      event_id: uuid4().replace(/-/g, ''),
      timestamp: new Date().toISOString(),
      level,
      platform: 'node',
      sdk: { name: 'bemora-enterprise', version: '1.0' },
      exception: {
        values: [{
          type: isError ? error.constructor.name : 'Error',
          value: isError ? error.message : String(error),
          stacktrace: isError && error.stack ? {
            frames: error.stack.split('\n').slice(1).map((line) => ({ function: line.trim() })),
          } : undefined,
        }],
      },
      ...(user && { user }),
      ...(tags && { tags }),
      ...(extras && { extra: extras }),
    };

    const { data } = await client().post(storeUrl, event, {
      headers: { 'X-Sentry-Auth': buildHeader(key), 'Content-Type': 'application/json' },
      signal,
    });
    return { id: data.id, success: true };
  } catch (err) {
    throw wrapProviderError(err, 'sentry');
  }
}

/**
 * Capture a message (non-exception event).
 * @param {{ message: string, level?: string, user?: object, tags?: object, signal?: AbortSignal }} params
 * @param {string} dsn
 */
export async function captureMessage({ message, level = 'info', user, tags, signal } = {}, dsn) {
  if (!dsn) throw new ConfigurationError('[sentry] Missing DSN', { provider: 'sentry' });
  try {
    const { storeUrl, key } = parsedsn(dsn);
    const event = {
      event_id: uuid4().replace(/-/g, ''),
      timestamp: new Date().toISOString(),
      level,
      platform: 'node',
      message: { formatted: message },
      ...(user && { user }),
      ...(tags && { tags }),
    };
    const { data } = await client().post(storeUrl, event, {
      headers: { 'X-Sentry-Auth': buildHeader(key), 'Content-Type': 'application/json' },
      signal,
    });
    return { id: data.id, success: true };
  } catch (err) {
    throw wrapProviderError(err, 'sentry');
  }
}

/**
 * Capture a custom event (full control over the event payload).
 */
export async function captureEvent({ event, signal } = {}, dsn) {
  if (!dsn) throw new ConfigurationError('[sentry] Missing DSN', { provider: 'sentry' });
  try {
    const { storeUrl, key } = parsedsn(dsn);
    const full = {
      event_id: uuid4().replace(/-/g, ''),
      timestamp: new Date().toISOString(),
      platform: 'node',
      ...event,
    };
    const { data } = await client().post(storeUrl, full, {
      headers: { 'X-Sentry-Auth': buildHeader(key) },
      signal,
    });
    return { id: data.id, success: true };
  } catch (err) {
    throw wrapProviderError(err, 'sentry');
  }
}
