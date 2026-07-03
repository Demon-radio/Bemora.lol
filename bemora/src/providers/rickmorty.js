import axios from 'axios';
import * as cache from '../core/cache.js';

const BASE = 'https://rickandmortyapi.com/api';

export async function getCharacter({ id }) {
  const cacheKey = `rickmorty:character:${id}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  const { data } = await axios.get(`${BASE}/character/${id}`);
  const result = {
    id: data.id,
    name: data.name,
    status: data.status,
    species: data.species,
    gender: data.gender,
    origin: data.origin?.name,
    location: data.location?.name,
    image: data.image,
    episodes_count: data.episode?.length,
    _cached: false,
  };
  cache.set(cacheKey, result, 3600);
  return result;
}

export async function searchCharacters({ name, status, species }) {
  const params = {};
  if (name) params.name = name;
  if (status) params.status = status;
  if (species) params.species = species;
  const { data } = await axios.get(`${BASE}/character`, { params });
  return {
    count: data.info?.count,
    results: data.results.map((c) => ({ id: c.id, name: c.name, status: c.status, species: c.species, image: c.image })),
  };
}

export async function getLocation({ id }) {
  const { data } = await axios.get(`${BASE}/location/${id}`);
  return { id: data.id, name: data.name, type: data.type, dimension: data.dimension, residents_count: data.residents?.length };
}

export async function getEpisode({ id }) {
  const { data } = await axios.get(`${BASE}/episode/${id}`);
  return { id: data.id, name: data.name, air_date: data.air_date, episode: data.episode, characters_count: data.characters?.length };
}

export async function random() {
  const id = Math.floor(Math.random() * 826) + 1;
  return getCharacter({ id });
}
