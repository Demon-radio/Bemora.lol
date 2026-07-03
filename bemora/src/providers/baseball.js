import axios from 'axios';
import * as cache from '../core/cache.js';

export async function getMLBTeams() {
  const cacheKey = 'baseball:mlb:teams';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data } = await axios.get('https://statsapi.mlb.com/api/v1/teams', { params: { sportId: 1 } });
  const result = {
    teams: data.teams?.map((t) => ({ id: t.id, name: t.name, abbreviation: t.abbreviation, league: t.league?.name, division: t.division?.name, venue: t.venue?.name })),
    _cached: false,
  };
  cache.set(cacheKey, result, 86400);
  return result;
}

export async function getMLBSchedule({ date, teamId } = {}) {
  const params = { sportId: 1 };
  if (date) params.date = date;
  if (teamId) params.teamId = teamId;
  const { data } = await axios.get('https://statsapi.mlb.com/api/v1/schedule', { params });
  const games = data.dates?.flatMap((d) => d.games) || [];
  return {
    count: games.length,
    games: games.map((g) => ({
      gamePk: g.gamePk,
      date: g.gameDate,
      status: g.status?.detailedState,
      home: g.teams?.home?.team?.name,
      away: g.teams?.away?.team?.name,
      homeScore: g.teams?.home?.score,
      awayScore: g.teams?.away?.score,
    })),
  };
}
