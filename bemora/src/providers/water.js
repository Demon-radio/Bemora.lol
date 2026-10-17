import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();
const USGS_URL = 'https://waterservices.usgs.gov/nwis/iv/';

/**
 * Get instantaneous streamflow values from USGS Water Services.
 * @param {Object} params
 * @param {string} params.site - USGS site number
 * @param {string} [params.parameter] - USGS parameter code, default 00060 (discharge)
 * @param {string} [params.period] - ISO 8601 duration, default P1D
 * @returns {Promise<Object>}
 */
export async function usgs({ site, parameter = '00060', period = 'P1D' }) {
  const cacheKey = `water:usgs:${site}:${parameter}:${period}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(USGS_URL, {
      params: { format: 'json', sites: site, parameterCd: parameter, period },
    });
    const series = data.value?.timeSeries || [];
    const sites = series.map((s) => ({
      site_name: s.sourceInfo?.siteName,
      description: s.variable?.variableDescription,
      values: (s.values?.[0]?.value || []).slice(-50).map((v) => ({
        value: parseFloat(v.value),
        date_time: v.dateTime,
      })),
    }));
    const result = { site, parameter, period, sites, _cached: false };
    cache.set(cacheKey, result, 900);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'water');
  }
}
