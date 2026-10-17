import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();

const HOSTS = {
  github: 'https://www.githubstatus.com',
  discord: 'https://discordstatus.com',
  openai: 'https://status.openai.com',
  cloudflare: 'https://www.cloudflarestatus.com',
};

const resolve = (service) => HOSTS[service] || `https://${service}.statuspage.io`;

/**
 * Fetch the status summary for a service.
 * @param {Object} params
 * @param {string} params.service - service name
 * @returns {Promise<Object>} status summary
 */
export async function service({ service } = {}) {
  const cacheKey = `statuspage:service:${service}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${resolve(service)}/api/v2/status.json`);
    const result = {
      service,
      name: data.page?.name,
      url: data.page?.url,
      indicator: data.status?.indicator,
      description: data.status?.description,
      _cached: false,
    };
    cache.set(cacheKey, result, 300);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'statuspage');
  }
}

/**
 * Fetch recent incidents for a service.
 * @param {Object} params
 * @param {string} params.service - service name
 * @returns {Promise<Object>} recent incidents
 */
export async function incidents({ service } = {}) {
  const cacheKey = `statuspage:incidents:${service}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${resolve(service)}/api/v2/incidents.json`);
    const result = {
      service,
      incidents: (data.incidents || []).map((i) => ({
        id: i.id,
        name: i.name,
        status: i.status,
        impact: i.impact,
        createdAt: i.created_at,
        resolvedAt: i.resolved_at,
      })),
      _cached: false,
    };
    cache.set(cacheKey, result, 300);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'statuspage');
  }
}

/**
 * Fetch the component status list for a service.
 * @param {Object} params
 * @param {string} params.service - service name
 * @returns {Promise<Object>} component statuses
 */
export async function components({ service } = {}) {
  const cacheKey = `statuspage:components:${service}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${resolve(service)}/api/v2/components.json`);
    const result = {
      service,
      components: (data.components || []).map((c) => ({
        id: c.id,
        name: c.name,
        status: c.status,
        group: c.group,
      })),
      _cached: false,
    };
    cache.set(cacheKey, result, 300);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'statuspage');
  }
}
