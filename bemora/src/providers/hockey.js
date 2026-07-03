import axios from 'axios';
import * as cache from '../core/cache.js';

export async function getNHLTeams() {
  const cacheKey = 'hockey:nhl:teams';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data } = await axios.get('https://statsapi.web.nhl.com/api/v1/teams');
  const result = { teams: data.teams, _cached: false };
  cache.set(cacheKey, result, 86400);
  return result;
}

export async function getNHLPlayer({ id }) {
  const { data } = await axios.get(`https://statsapi.web.nhl.com/api/v1/people/${id}`);
  return { player: data.people[0] };
}
