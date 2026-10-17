import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';

const http = httpClient();

const BASE = 'https://httpbin.org';

/**
 * Echo the request details via httpbin.
 * @returns {Promise<Object>} request details
 */
export async function get() {
  try {
    const { data } = await http.get(`${BASE}/get`);
    return { args: data.args, headers: data.headers, origin: data.origin, url: data.url, _cached: false };
  } catch (err) {
    throw wrapProviderError(err, 'httpbin');
  }
}

/**
 * Fetch the request headers via httpbin.
 * @returns {Promise<Object>} request headers
 */
export async function headers() {
  try {
    const { data } = await http.get(`${BASE}/headers`);
    return { headers: data.headers, _cached: false };
  } catch (err) {
    throw wrapProviderError(err, 'httpbin');
  }
}

/**
 * Fetch the origin IP via httpbin.
 * @returns {Promise<Object>} origin address
 */
export async function ip() {
  try {
    const { data } = await http.get(`${BASE}/ip`);
    return { origin: data.origin, _cached: false };
  } catch (err) {
    throw wrapProviderError(err, 'httpbin');
  }
}

/**
 * Fetch a random UUID via httpbin.
 * @returns {Promise<Object>} random uuid
 */
export async function uuid() {
  try {
    const { data } = await http.get(`${BASE}/uuid`);
    return { uuid: data.uuid, _cached: false };
  } catch (err) {
    throw wrapProviderError(err, 'httpbin');
  }
}
