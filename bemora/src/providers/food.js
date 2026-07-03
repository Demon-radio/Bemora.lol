import axios from 'axios';
import * as cache from '../core/cache.js';

const BASE = 'https://www.themealdb.com/api/json/v1/1';

/**
 * Search meals by name (Free, no key)
 * @param {{ name: string }} params
 */
export async function searchMeals({ name }) {
  const cacheKey = `food:search:${name}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data } = await axios.get(`${BASE}/search.php`, { params: { s: name } });
  const result = { meals: (data.meals || []).map(formatMeal), _cached: false };
  cache.set(cacheKey, result, 3600);
  return result;
}

/**
 * Get a random meal (Free, no key)
 */
export async function getRandomMeal() {
  const { data } = await axios.get(`${BASE}/random.php`);
  return { meal: formatMeal(data.meals[0]), _cached: false };
}

/**
 * Get meal by ID
 * @param {{ id: string }} params
 */
export async function getMeal({ id }) {
  const cacheKey = `food:meal:${id}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data } = await axios.get(`${BASE}/lookup.php`, { params: { i: id } });
  const result = { meal: formatMeal(data.meals[0]), _cached: false };
  cache.set(cacheKey, result, 86400);
  return result;
}

/**
 * Get meals by category (Seafood, Chicken, Beef, Vegetarian ...)
 * @param {{ category: string }} params
 */
export async function byCategory({ category }) {
  const cacheKey = `food:category:${category}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data } = await axios.get(`${BASE}/filter.php`, { params: { c: category } });
  const result = {
    category,
    meals: (data.meals || []).map((m) => ({
      id: m.idMeal, name: m.strMeal, thumbnail: m.strMealThumb,
    })),
    _cached: false,
  };
  cache.set(cacheKey, result, 3600);
  return result;
}

/**
 * List all meal categories
 */
export async function categories() {
  const cacheKey = 'food:categories';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data } = await axios.get(`${BASE}/categories.php`);
  const result = {
    categories: data.categories.map((c) => ({
      id: c.idCategory, name: c.strCategory, description: c.strCategoryDescription?.slice(0, 100),
      thumbnail: c.strCategoryThumb,
    })),
    _cached: false,
  };
  cache.set(cacheKey, result, 86400);
  return result;
}

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
