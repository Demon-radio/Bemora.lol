import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();

export async function getRandomCocktail() {
  const cacheKey = 'drinks:cocktail:random';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  try {
    const { data } = await http.get('https://www.thecocktaildb.com/api/json/v1/1/random.php');
    const result = { cocktail: data.drinks[0], _cached: false };
    cache.set(cacheKey, result, 3600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'drinks');
  }
}

export async function searchCocktail({ name }) {
  const cacheKey = `drinks:cocktail:search:${name}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  try {
    const { data } = await http.get('https://www.thecocktaildb.com/api/json/v1/1/search.php', {
      params: { s: name },
    });
    const result = { cocktails: data.drinks || [], _cached: false };
    cache.set(cacheKey, result, 3600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'drinks');
  }
}

export async function searchIngredient({ name }) {
  try {
    const { data } = await http.get('https://www.thecocktaildb.com/api/json/v1/1/search.php', {
      params: { i: name },
    });
    return { ingredients: data.ingredients || [] };
  } catch (err) {
    throw wrapProviderError(err, 'drinks');
  }
}
