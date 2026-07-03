import axios from 'axios';
import * as cache from '../core/cache.js';

const BASE = 'https://pokeapi.co/api/v2';

export async function getPokemon({ name }) {
  const key = String(name).toLowerCase();
  const cacheKey = `pokemon:${key}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data } = await axios.get(`${BASE}/pokemon/${encodeURIComponent(key)}`);
  const result = {
    id: data.id,
    name: data.name,
    height: data.height,
    weight: data.weight,
    base_experience: data.base_experience,
    types: data.types.map((t) => t.type.name),
    abilities: data.abilities.map((a) => a.ability.name),
    stats: data.stats.map((s) => ({ name: s.stat.name, base: s.base_stat })),
    sprite: data.sprites?.front_default,
    artwork: data.sprites?.other?.['official-artwork']?.front_default,
    _cached: false,
  };
  cache.set(cacheKey, result, 3600);
  return result;
}

export async function getAbility({ name }) {
  const { data } = await axios.get(`${BASE}/ability/${encodeURIComponent(String(name).toLowerCase())}`);
  return {
    name: data.name,
    effect: data.effect_entries?.find((e) => e.language.name === 'en')?.effect,
    pokemon: data.pokemon?.slice(0, 10).map((p) => p.pokemon.name),
  };
}

export async function getSpecies({ name }) {
  const { data } = await axios.get(`${BASE}/pokemon-species/${encodeURIComponent(String(name).toLowerCase())}`);
  return {
    name: data.name,
    color: data.color?.name,
    habitat: data.habitat?.name,
    is_legendary: data.is_legendary,
    is_mythical: data.is_mythical,
    flavor_text: data.flavor_text_entries?.find((f) => f.language.name === 'en')?.flavor_text?.replace(/\f|\n/g, ' '),
    evolution_chain_url: data.evolution_chain?.url,
  };
}

export async function random() {
  const id = Math.floor(Math.random() * 1010) + 1;
  const { data } = await axios.get(`${BASE}/pokemon/${id}`);
  return {
    id: data.id,
    name: data.name,
    types: data.types.map((t) => t.type.name),
    sprite: data.sprites?.front_default,
    artwork: data.sprites?.other?.['official-artwork']?.front_default,
  };
}
