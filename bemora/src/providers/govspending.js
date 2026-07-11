import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';
import { logger } from '../core/logger.js';

const http = httpClient();

/**
 * US federal government spending — USAspending.gov (no key needed).
 * Search individual contract/grant awards by keyword and date range.
 * @param {Object} params
 * @param {string} params.keyword - recipient name, description, etc.
 * @param {string} [params.startDate] - YYYY-MM-DD, defaults to 1 year ago
 * @param {string} [params.endDate] - YYYY-MM-DD, defaults to today
 * @param {number} [params.limit]
 */
export async function searchAwards({ keyword, startDate, endDate, limit = 10 } = {}) {
  const end = endDate || new Date().toISOString().split('T')[0];
  const start = startDate || `${new Date().getFullYear() - 1}-01-01`;
  const cacheKey = `govspending:search:${keyword}:${start}:${end}:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  let data;
  try {
    ({ data } = await http.post('https://api.usaspending.gov/api/v2/search/spending_by_award/', {
      filters: {
        award_type_codes: ['A', 'B', 'C', 'D'],
        time_period: [{ start_date: start, end_date: end }],
        ...(keyword ? { keywords: [keyword] } : {}),
      },
      fields: ['Award ID', 'Recipient Name', 'Award Amount', 'Awarding Agency', 'Start Date', 'End Date'],
      limit,
    }));
  } catch (err) {
    throw wrapProviderError(err, 'govspending');
  }

  const result = {
    keyword: keyword || null,
    period: { start, end },
    awards: (data.results || []).map((r) => ({
      id: r['Award ID'],
      recipient: r['Recipient Name'],
      amount: r['Award Amount'],
      agency: r['Awarding Agency'],
      start: r['Start Date'],
      end: r['End Date'],
    })),
    _cached: false,
  };

  cache.set(cacheKey, result, 3600);
  logger.info(`Gov spending searched: "${keyword || 'all'}"`);
  return result;
}

/**
 * Total federal spending broken down by top-level agency for a fiscal year.
 * @param {Object} params
 * @param {number} [params.fiscalYear] - defaults to current year
 */
export async function agencySpending({ fiscalYear } = {}) {
  const fy = fiscalYear || new Date().getFullYear();
  const cacheKey = `govspending:agency:${fy}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  let data;
  try {
    ({ data } = await http.get('https://api.usaspending.gov/api/v2/references/toptier_agencies/', {
      params: { sort: 'budget_authority_amount', order: 'desc' },
    }));
  } catch (err) {
    throw wrapProviderError(err, 'govspending');
  }

  const result = {
    fiscalYear: fy,
    agencies: (data.results || []).slice(0, 20).map((a) => ({
      name: a.agency_name,
      abbreviation: a.abbreviation,
      total_obligations: a.obligated_amount,
      budgetary_resources: a.budget_authority_amount,
      website: a.website,
    })),
    _cached: false,
  };

  cache.set(cacheKey, result, 86400);
  return result;
}
