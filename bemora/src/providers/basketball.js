import axios from 'axios';
import * as cache from '../core/cache.js';

export async function getNBATeams() {
  const cacheKey = 'basketball:nba:teams';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data } = await axios.get('https://www.balldontlie.io/api/v1/teams');
  const result = { teams: data.data, _cached: false };
  cache.set(cacheKey, result, 86400);
  return result;
}

export async function getNBAGames({ dates }) {
  const cacheKey = `basketball:nba:games:${dates}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data } = await axios.get('https://www.balldontlie.io/api/v1/games', {
    params: { dates },
  });
  const result = { games: data.data, _cached: false };
  cache.set(cacheKey, result, 3600);
  return result;
}

export async function getNBAPlayer({ id }) {
  const { data } = await axios.get(`https://www.balldontlie.io/api/v1/players/${id}`);
  return { player: data };
}
