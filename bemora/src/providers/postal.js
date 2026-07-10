import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();

export async function lookup({ country, postalCode }) {
  const cacheKey = `postal:${country}:${postalCode}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  let data;
  try {
    ({ data } = await http.get(`https://api.zippopotam.us/${encodeURIComponent(country)}/${encodeURIComponent(postalCode)}`));
  } catch (err) {
    throw wrapProviderError(err, 'postal');
  }

  const result = {
    country: data.country,
    country_code: data['country abbreviation'],
    postal_code: data['post code'],
    places: data.places?.map((p) => ({ place_name: p['place name'], state: p.state, state_abbreviation: p['state abbreviation'], lat: p.latitude, lon: p.longitude })),
    _cached: false,
  };
  cache.set(cacheKey, result, 86400);
  return result;
}
