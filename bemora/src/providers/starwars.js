import * as cache from '../core/cache.js';
import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';

const http = httpClient();
const BASE = 'https://swapi.info/api';

export async function getPerson({ id }) {
  const cacheKey = `starwars:person:${id}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/people/${id}`);
    const result = {
      name: data.name,
      height: data.height,
      mass: data.mass,
      birth_year: data.birth_year,
      gender: data.gender,
      homeworld: data.homeworld,
      films_count: data.films?.length,
      _cached: false,
    };
    cache.set(cacheKey, result, 86400);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'starwars');
  }
}

export async function listPeople() {
  const cacheKey = 'starwars:people:all';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/people`);
    const result = { count: data.length, people: data.slice(0, 20).map((p) => ({ name: p.name, birth_year: p.birth_year })), _cached: false };
    cache.set(cacheKey, result, 86400);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'starwars');
  }
}

export async function getPlanet({ id }) {
  try {
    const { data } = await http.get(`${BASE}/planets/${id}`);
    return { name: data.name, climate: data.climate, terrain: data.terrain, population: data.population, diameter: data.diameter };
  } catch (err) {
    throw wrapProviderError(err, 'starwars');
  }
}

export async function getStarship({ id }) {
  try {
    const { data } = await http.get(`${BASE}/starships/${id}`);
    return { name: data.name, model: data.model, manufacturer: data.manufacturer, crew: data.crew, cost_in_credits: data.cost_in_credits };
  } catch (err) {
    throw wrapProviderError(err, 'starwars');
  }
}

export async function getFilm({ id }) {
  try {
    const { data } = await http.get(`${BASE}/films/${id}`);
    return { title: data.title, episode_id: data.episode_id, director: data.director, release_date: data.release_date, opening_crawl: data.opening_crawl };
  } catch (err) {
    throw wrapProviderError(err, 'starwars');
  }
}
