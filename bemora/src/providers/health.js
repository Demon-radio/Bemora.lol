import axios from 'axios';
import * as cache from '../core/cache.js';

/**
 * Health & Medical data — all free, no key needed
 */

/**
 * Search FDA drug database (Free, no key)
 * @param {{ name: string, limit?: number }} params
 */
export async function searchDrug({ name, limit = 5 }) {
  const cacheKey = `health:drug:${name}:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data } = await axios.get('https://api.fda.gov/drug/label.json', {
    params: {
      search: `openfda.brand_name:"${name}"`,
      limit,
    },
  });

  const result = {
    drugs: (data.results || []).map((d) => ({
      brand_name: d.openfda?.brand_name?.[0],
      generic_name: d.openfda?.generic_name?.[0],
      manufacturer: d.openfda?.manufacturer_name?.[0],
      route: d.openfda?.route?.[0],
      substance: d.openfda?.substance_name?.[0],
      purpose: d.purpose?.[0]?.slice(0, 200),
      indications: d.indications_and_usage?.[0]?.slice(0, 300),
      warnings: d.warnings?.[0]?.slice(0, 300),
      dosage: d.dosage_and_administration?.[0]?.slice(0, 300),
    })),
    _cached: false,
  };

  cache.set(cacheKey, result, 86400);
  return result;
}

/**
 * Get disease info from the National Library of Medicine (Free, no key)
 * @param {{ disease: string }} params
 */
export async function getDiseaseInfo({ disease }) {
  const cacheKey = `health:disease:${disease}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data } = await axios.get('https://en.wikipedia.org/w/api.php', {
    params: {
      action: 'query', prop: 'extracts', exintro: true, explaintext: true,
      titles: disease, format: 'json', origin: '*',
    },
  });

  const page = Object.values(data.query?.pages || {})[0];

  const result = {
    name: page?.title,
    summary: page?.extract?.slice(0, 1000),
    url: `https://en.wikipedia.org/wiki/${encodeURIComponent(page?.title || disease)}`,
    _cached: false,
  };

  cache.set(cacheKey, result, 86400);
  return result;
}

/**
 * Get exercises from ExerciseDB (free public endpoint)
 * @param {{ muscle?: string, equipment?: string, limit?: number }} params
 * muscles: back, cardio, chest, lower arms, lower legs, neck, shoulders, upper arms, upper legs, waist
 */
export async function getExercises({ muscle, equipment, limit = 10 } = {}) {
  const cacheKey = `health:exercise:${muscle}:${equipment}:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const url = muscle
    ? `https://exercisedb.p.rapidapi.com/exercises/bodyPart/${muscle}`
    : 'https://exercisedb.p.rapidapi.com/exercises';

  // Fallback to wger (open source exercise DB, no key)
  const { data } = await axios.get('https://wger.de/api/v2/exercise/', {
    params: {
      format: 'json', language: 2, limit,
      category: muscle ? undefined : undefined,
    },
  });

  const result = {
    exercises: (data.results || []).map((e) => ({
      id: e.id,
      name: e.name,
      description: e.description?.replace(/<[^>]+>/g, '').slice(0, 200),
      category: e.category,
    })),
    _cached: false,
  };

  cache.set(cacheKey, result, 86400);
  return result;
}

/**
 * Get nutrition info for a food item via Open Food Facts (Free, no key)
 * @param {{ query: string }} params
 */
export async function getNutrition({ query }) {
  const cacheKey = `health:nutrition:${query}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data } = await axios.get('https://world.openfoodfacts.org/cgi/search.pl', {
    params: { search_terms: query, json: 1, page_size: 5, action: 'process' },
  });

  const result = {
    products: (data.products || []).slice(0, 5).map((p) => ({
      name: p.product_name,
      brand: p.brands,
      categories: p.categories?.split(',')[0],
      energy_kcal: p.nutriments?.['energy-kcal_100g'],
      proteins: p.nutriments?.proteins_100g,
      carbs: p.nutriments?.carbohydrates_100g,
      fat: p.nutriments?.fat_100g,
      fiber: p.nutriments?.fiber_100g,
      sugar: p.nutriments?.sugars_100g,
      salt: p.nutriments?.salt_100g,
      nutriscore: p.nutriscore_grade?.toUpperCase(),
      image: p.image_small_url,
    })),
    _cached: false,
  };

  cache.set(cacheKey, result, 3600);
  return result;
}

/**
 * BMI Calculator
 * @param {{ weight_kg: number, height_cm: number }} params
 */
export function calculateBMI({ weight_kg, height_cm }) {
  const height_m = height_cm / 100;
  const bmi = weight_kg / (height_m ** 2);
  const rounded = parseFloat(bmi.toFixed(1));
  return {
    bmi: rounded,
    weight_kg,
    height_cm,
    category:
      bmi < 18.5 ? 'Underweight' :
      bmi < 25   ? 'Normal weight' :
      bmi < 30   ? 'Overweight' : 'Obese',
    healthy_range_kg: [
      parseFloat((18.5 * height_m ** 2).toFixed(1)),
      parseFloat((24.9 * height_m ** 2).toFixed(1)),
    ],
  };
}
