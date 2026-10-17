import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();

/**
 * World Bank Open Data API — free, no key, no signup.
 * https://data.worldbank.org
 *
 * @param {{ country: string, indicator?: string, limit?: number }} params
 * country: ISO alpha-2/3 code, e.g. 'US', 'EGY'.
 * indicator: World Bank indicator code, defaults to GDP (current US$).
 */
export async function indicator({ country, indicator = 'NY.GDP.MKTP.CD', limit = 10 }) {
  const cacheKey = `worldbank:${country}:${indicator}:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  let data;
  try {
    ({ data } = await http.get(
      `https://api.worldbank.org/v2/country/${encodeURIComponent(country)}/indicator/${encodeURIComponent(indicator)}`,
      { params: { format: 'json', per_page: limit } }
    ));
  } catch (err) {
    throw wrapProviderError(err, 'worldbank');
  }

  const rows = (data?.[1] || []).filter((r) => r.value !== null);
  const result = {
    provider: 'worldbank',
    country,
    indicator,
    indicator_name: rows[0]?.indicator?.value,
    values: rows.map((r) => ({ year: r.date, value: r.value })),
    _cached: false,
  };

  cache.set(cacheKey, result, 86400);
  return result;
}

/**
 * Convenience: population time series for a country.
 * @param {{ country: string, limit?: number }} params
 */
export async function population({ country, limit = 10 }) {
  return indicator({ country, indicator: 'SP.POP.TOTL', limit });
}

/**
 * Convenience: GDP time series for a country.
 * @param {{ country: string, limit?: number }} params
 */
export async function gdp({ country, limit = 10 }) {
  return indicator({ country, indicator: 'NY.GDP.MKTP.CD', limit });
}
