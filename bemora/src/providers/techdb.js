import * as cache from '../core/cache.js';
import { httpClient } from '../core/http.js';
import { ValidationError, wrapProviderError } from '../core/errors.js';

const http = httpClient();
const BASE = 'https://api.restful-api.dev/objects';

/**
 * List every device in the tech catalog (phones, laptops, and other electronics with real specs like CPU, RAM, storage, price)
 */
export async function listDevices() {
  const cacheKey = 'techdb:all';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  try {
    const { data } = await http.get(BASE);
    const result = { count: data.length, devices: data.map(formatDevice), _cached: false };
    cache.set(cacheKey, result, 3600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'techdb');
  }
}

/**
 * Get a single device's full specs by ID
 * @param {{ id: string|number }} params
 */
export async function getDevice({ id }) {
  try {
    const { data } = await http.get(`${BASE}/${id}`);
    return formatDevice(data);
  } catch (err) {
    throw wrapProviderError(err, 'techdb');
  }
}

/**
 * Search the tech catalog by name (e.g. "iPhone", "MacBook", "Samsung")
 * @param {{ query: string }} params
 */
export async function searchDevices({ query }) {
  try {
    const { data } = await http.get(BASE);
    const q = query.toLowerCase();
    const matches = data.filter((d) => d.name?.toLowerCase().includes(q));
    return { count: matches.length, devices: matches.map(formatDevice) };
  } catch (err) {
    throw wrapProviderError(err, 'techdb');
  }
}

/**
 * Compare two or more devices side-by-side (CPU, RAM, storage, price, capacity, color)
 * @param {{ ids: Array<string|number> }} params
 */
export async function compareDevices({ ids }) {
  if (!Array.isArray(ids) || ids.length < 2) throw new ValidationError('Provide at least 2 device ids to compare', { provider: 'techdb' });

  try {
    const devices = await Promise.all(ids.map((id) => http.get(`${BASE}/${id}`).then((r) => formatDevice(r.data))));

    const specKeys = Array.from(new Set(devices.flatMap((d) => Object.keys(d.specs || {}))));
    const comparison = specKeys.map((key) => ({
      spec: key,
      values: devices.map((d) => d.specs?.[key] ?? '—'),
    }));

    return {
      devices: devices.map((d) => ({ id: d.id, name: d.name })),
      comparison,
    };
  } catch (err) {
    throw wrapProviderError(err, 'techdb');
  }
}

function formatDevice(d) {
  return {
    id: d.id,
    name: d.name,
    specs: d.data || {},
  };
}
