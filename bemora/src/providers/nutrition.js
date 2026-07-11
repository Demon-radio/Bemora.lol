import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';
import { USER_AGENT } from '../core/headers.js';

const http = httpClient({ headers: { 'User-Agent': USER_AGENT } });

/**
 * Open Food Facts — free, no key, no signup.
 * https://world.openfoodfacts.org/data
 *
 * @param {{ barcode: string }} params
 */
export async function byBarcode({ barcode }) {
  const cacheKey = `nutrition:barcode:${barcode}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  let data;
  try {
    ({ data } = await http.get(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json`));
  } catch (err) {
    throw wrapProviderError(err, 'nutrition');
  }

  if (data.status !== 1 || !data.product) {
    const result = { provider: 'openfoodfacts', barcode, found: false, _cached: false };
    cache.set(cacheKey, result, 3600);
    return result;
  }

  const p = data.product;
  const result = {
    provider: 'openfoodfacts',
    barcode,
    found: true,
    name: p.product_name,
    brands: p.brands,
    categories: p.categories,
    nutrition_grade: p.nutrition_grades,
    nutriments: {
      energy_kcal_100g: p.nutriments?.['energy-kcal_100g'],
      fat_100g: p.nutriments?.fat_100g,
      sugars_100g: p.nutriments?.sugars_100g,
      salt_100g: p.nutriments?.salt_100g,
      proteins_100g: p.nutriments?.proteins_100g,
    },
    ingredients_text: p.ingredients_text,
    image_url: p.image_url,
    _cached: false,
  };

  cache.set(cacheKey, result, 3600);
  return result;
}

/**
 * Search products by name.
 * @param {{ query: string, limit?: number }} params
 */
export async function search({ query, limit = 10 }) {
  const cacheKey = `nutrition:search:${query}:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  let data;
  try {
    ({ data } = await http.get('https://world.openfoodfacts.org/cgi/search.pl', {
      params: { search_terms: query, search_simple: 1, action: 'process', json: 1, page_size: limit },
    }));
  } catch (err) {
    throw wrapProviderError(err, 'nutrition');
  }

  const result = {
    provider: 'openfoodfacts',
    query,
    products: (data.products || []).slice(0, limit).map((p) => ({
      barcode: p.code,
      name: p.product_name,
      brands: p.brands,
      nutrition_grade: p.nutrition_grades,
      image_url: p.image_url,
    })),
    _cached: false,
  };

  cache.set(cacheKey, result, 3600);
  return result;
}
