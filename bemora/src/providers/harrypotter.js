import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();
const BASE = 'https://hp-api.onrender.com/api';

function formatWand(wand) {
  if (!wand || (!wand.wood && !wand.core && !wand.length)) return null;
  const parts = [];
  if (wand.wood) parts.push(`${wand.wood} wood`);
  if (wand.core) parts.push(`${wand.core} core`);
  if (wand.length) parts.push(`${wand.length}"`);
  return parts.join(', ') || null;
}

export async function getCharacters({ house } = {}) {
  const cacheKey = `hp:characters:${house || 'all'}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  const url = house ? `${BASE}/characters/house/${house.toLowerCase()}` : `${BASE}/characters`;
  try {
    const { data } = await http.get(url);
    const result = {
      count: data.length,
      characters: data.slice(0, 30).map((c) => ({ name: c.name, house: c.house, actor: c.actor, patronus: c.patronus, wand: formatWand(c.wand), image: c.image })),
      _cached: false,
    };
    cache.set(cacheKey, result, 86400);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'harrypotter');
  }
}

export async function getStudents() {
  try {
    const { data } = await http.get(`${BASE}/characters/students`);
    return { count: data.length, students: data.slice(0, 30).map((c) => ({ name: c.name, house: c.house })) };
  } catch (err) {
    throw wrapProviderError(err, 'harrypotter');
  }
}

export async function getStaff() {
  try {
    const { data } = await http.get(`${BASE}/characters/staff`);
    return { count: data.length, staff: data.slice(0, 30).map((c) => ({ name: c.name, house: c.house })) };
  } catch (err) {
    throw wrapProviderError(err, 'harrypotter');
  }
}

export async function randomCharacter() {
  try {
    const { data } = await http.get(`${BASE}/characters`);
    const named = data.filter((c) => c.actor);
    const pool = named.length ? named : data;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    return {
      name: pick.name,
      house: pick.house || null,
      actor: pick.actor || null,
      patronus: pick.patronus || null,
      wand: formatWand(pick.wand),
      image: pick.image || null,
    };
  } catch (err) {
    throw wrapProviderError(err, 'harrypotter');
  }
}
