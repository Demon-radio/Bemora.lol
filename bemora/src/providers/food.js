import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();
const BASE_THEMEALDB = 'https://www.themealdb.com/api/json/v1/1';
const BASE_SPOONACULAR = 'https://api.spoonacular.com';
const BASE_EDAMAM = 'https://api.edamam.com';

function formatMeal(m) {
  if (!m) return null;
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ing = m[`strIngredient${i}`];
    const measure = m[`strMeasure${i}`];
    if (ing && ing.trim()) ingredients.push({ ingredient: ing, measure: measure?.trim() });
  }
  return {
    id: m.idMeal,
    name: m.strMeal,
    category: m.strCategory,
    area: m.strArea,
    instructions: m.strInstructions,
    thumbnail: m.strMealThumb,
    youtube: m.strYoutube,
    ingredients,
    tags: m.strTags?.split(',').map((t) => t.trim()).filter(Boolean),
  };
}

export async function searchMeals({ name }) {
  const cacheKey = `food:search:${name}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE_THEMEALDB}/search.php`, { params: { s: name } });
    const result = { meals: (data.meals || []).map(formatMeal), _cached: false };
    cache.set(cacheKey, result, 3600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'food');
  }
}

export async function getRandomMeal() {
  try {
    const { data } = await http.get(`${BASE_THEMEALDB}/random.php`);
    return { meal: formatMeal(data.meals[0]), _cached: false };
  } catch (err) {
    throw wrapProviderError(err, 'food');
  }
}

export async function getMeal({ id }) {
  const cacheKey = `food:meal:${id}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE_THEMEALDB}/lookup.php`, { params: { i: id } });
    const result = { meal: formatMeal(data.meals[0]), _cached: false };
    cache.set(cacheKey, result, 86400);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'food');
  }
}

export async function byCategory({ category }) {
  const cacheKey = `food:category:${category}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE_THEMEALDB}/filter.php`, { params: { c: category } });
    const result = {
      category,
      meals: (data.meals || []).map((m) => ({
        id: m.idMeal, name: m.strMeal, thumbnail: m.strMealThumb,
      })),
      _cached: false,
    };
    cache.set(cacheKey, result, 3600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'food');
  }
}

export async function categories() {
  const cacheKey = 'food:categories';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE_THEMEALDB}/categories.php`);
    const result = {
      categories: data.categories.map((c) => ({
        id: c.idCategory, name: c.strCategory, description: c.strCategoryDescription?.slice(0, 100),
        thumbnail: c.strCategoryThumb,
      })),
      _cached: false,
    };
    cache.set(cacheKey, result, 86400);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'food');
  }
}

export async function searchSpoonacular({ query, apiKey, number = 10 }) {
  const cacheKey = `food:spoonacular:${query}:${number}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE_SPOONACULAR}/recipes/complexSearch`, {
      params: { query, number, apiKey }
    });
    const result = { recipes: data.results, totalResults: data.totalResults, _cached: false };
    cache.set(cacheKey, result, 3600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'food');
  }
}

export async function getSpoonacularRecipe({ id, apiKey }) {
  const cacheKey = `food:spoonacular:recipe:${id}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE_SPOONACULAR}/recipes/${id}/information`, {
      params: { includeNutrition: true, apiKey }
    });
    const result = { recipe: data, _cached: false };
    cache.set(cacheKey, result, 86400);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'food');
  }
}

export async function searchEdamam({ query, appId, appKey, from = 0, to = 10 }) {
  const cacheKey = `food:edamam:${query}:${from}:${to}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE_EDAMAM}/search`, {
      params: { q: query, app_id: appId, app_key: appKey, from, to }
    });
    const result = { hits: data.hits, count: data.count, _cached: false };
    cache.set(cacheKey, result, 3600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'food');
  }
}

export async function analyzeEdamam({ ingredients, appId, appKey }) {
  try {
    const { data } = await http.post(`${BASE_EDAMAM}/api/nutrition-data`, null, {
      params: { app_id: appId, app_key: appKey, ingr: ingredients }
    });
    return { nutrition: data };
  } catch (err) {
    throw wrapProviderError(err, 'food');
  }
}
