import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();
const BASE = 'https://api.fda.gov';

/**
 * openFDA drug adverse event reports.
 * @param {Object} params
 * @param {string} [params.search]
 * @param {number} [params.limit]
 */
export async function drugEvents({ search, limit = 5 }) {
  const cacheKey = `fda:drug:${search || 'all'}:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  const params = { limit };
  if (search) params.search = search;
  try {
    const { data } = await http.get(`${BASE}/drug/event.json`, { params });
    const results = (data.results || []).map((r) => ({
      safetyreportid: r.safetyreportid,
      receivedate: r.receivedate,
      serious: r.serious,
      patient: {
        age: r.patient?.age,
        sex: r.patient?.sex,
        reaction: r.patient?.reaction?.map((x) => x.reactionmeddrapt),
      },
      medicinalproduct: r.patient?.drug?.map((d) => d.medicinalproduct),
    }));
    const result = { count: data.meta?.results?.total ?? results.length, results, _cached: false };
    cache.set(cacheKey, result, 3600);
    return result;
  } catch (err) {
    if (err.response?.status === 404) {
      const result = { count: 0, results: [], _cached: false };
      cache.set(cacheKey, result, 3600);
      return result;
    }
    throw wrapProviderError(err, 'fda');
  }
}

/**
 * openFDA food enforcement (recall) reports.
 * @param {Object} params
 * @param {string} [params.search]
 * @param {number} [params.limit]
 */
export async function foodRecalls({ search, limit = 5 }) {
  const cacheKey = `fda:food:${search || 'all'}:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  const params = { limit };
  if (search) params.search = search;
  try {
    const { data } = await http.get(`${BASE}/food/enforcement.json`, { params });
    const results = (data.results || []).map((r) => ({
      recall_number: r.recall_number,
      status: r.status,
      classification: r.classification,
      product_description: r.product_description,
      reason_for_recall: r.reason_for_recall,
      recalling_firm: r.recalling_firm,
      distribution_pattern: r.distribution_pattern,
      report_date: r.report_date,
    }));
    const result = { count: data.meta?.results?.total ?? results.length, results, _cached: false };
    cache.set(cacheKey, result, 3600);
    return result;
  } catch (err) {
    if (err.response?.status === 404) {
      const result = { count: 0, results: [], _cached: false };
      cache.set(cacheKey, result, 3600);
      return result;
    }
    throw wrapProviderError(err, 'fda');
  }
}

/**
 * openFDA medical device event (MDR) reports.
 * @param {Object} params
 * @param {string} [params.search]
 * @param {number} [params.limit]
 */
export async function deviceEvents({ search, limit = 5 }) {
  const cacheKey = `fda:device:${search || 'all'}:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  const params = { limit };
  if (search) params.search = search;
  try {
    const { data } = await http.get(`${BASE}/device/event.json`, { params });
    const results = (data.results || []).map((r) => ({
      mdr_report_key: r.mdr_report_key,
      event_type: r.event_type,
      date_of_event: r.date_of_event,
      device: r.device?.map((d) => ({ brand_name: d.brand_name, manufacturer: d.manufacturer_d_name })),
    }));
    const result = { count: data.meta?.results?.total ?? results.length, results, _cached: false };
    cache.set(cacheKey, result, 3600);
    return result;
  } catch (err) {
    if (err.response?.status === 404) {
      const result = { count: 0, results: [], _cached: false };
      cache.set(cacheKey, result, 3600);
      return result;
    }
    throw wrapProviderError(err, 'fda');
  }
}
