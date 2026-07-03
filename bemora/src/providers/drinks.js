import axios from 'axios';
import * as cache from '../core/cache.js';

export async function getRandomCocktail() {
  const cacheKey = 'drinks:cocktail:random';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data } = await axios.get('https://www.thecocktaildb.com/api/json/v1/1/random.php');
  const result = { cocktail: data.drinks[0], _cached: false };
  cache.set(cacheKey, result, 3600);
  return result;
}

export async function searchCocktail({ name }) {
  const cacheKey = `drinks:cocktail:search:${name}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data } = await axios.get('https://www.thecocktaildb.com/api/json/v1/1/search.php', {
    params: { s: name },
  });
  const result = { cocktails: data.drinks || [], _cached: false };
  cache.set(cacheKey, result, 3600);
  return result;
}

export async function searchIngredient({ name }) {
  const { data } = await axios.get('https://www.thecocktaildb.com/api/json/v1/1/search.php', {
    params: { i: name },
  });
  return { ingredients: data.ingredients || [] };
}
