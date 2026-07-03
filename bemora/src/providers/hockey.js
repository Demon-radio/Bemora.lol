import axios from 'axios';
import * as cache from '../core/cache.js';

export async function getNHLTeams() {
  const cacheKey = 'hockey:nhl:teams';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data } = await axios.get('https://api-web.nhle.com/v1/standings/now');
  const teams = (data.standings || []).map((t) => ({
    name: t.teamName?.default,
    abbreviation: t.teamAbbrev?.default,
    conference: t.conferenceName,
    division: t.divisionName,
    wins: t.wins,
    losses: t.losses,
    otLosses: t.otLosses,
    points: t.points,
  }));
  const result = { teams, _cached: false };
  cache.set(cacheKey, result, 86400);
  return result;
}

export async function getNHLPlayer({ id }) {
  const { data } = await axios.get(`https://api-web.nhle.com/v1/player/${id}/landing`);
  return {
    player: {
      id: data.playerId,
      name: `${data.firstName?.default || ''} ${data.lastName?.default || ''}`.trim(),
      position: data.position,
      team: data.fullTeamName?.default,
      number: data.sweaterNumber,
      height: data.heightInCentimeters,
      weight: data.weightInKilograms,
      birthDate: data.birthDate,
      birthCountry: data.birthCountry,
    },
  };
}
