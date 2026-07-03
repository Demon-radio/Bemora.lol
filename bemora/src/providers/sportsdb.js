import axios from 'axios';
import * as cache from '../core/cache.js';

const BASE = 'https://www.thesportsdb.com/api/v1/json/3';

export async function searchTeam({ name }) {
  const cacheKey = `sportsdb:team:${name}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  const { data } = await axios.get(`${BASE}/searchteams.php`, { params: { t: name } });
  const teams = data.teams || [];
  const result = { count: teams.length, teams: teams.map((t) => ({ name: t.strTeam, league: t.strLeague, sport: t.strSport, founded: t.intFormedYear, stadium: t.strStadium, badge: t.strTeamBadge })), _cached: false };
  cache.set(cacheKey, result, 86400);
  return result;
}

export async function searchPlayer({ name }) {
  const { data } = await axios.get(`${BASE}/searchplayers.php`, { params: { p: name } });
  const players = data.player || [];
  return { count: players.length, players: players.map((p) => ({ name: p.strPlayer, team: p.strTeam, sport: p.strSport, nationality: p.strNationality, position: p.strPosition })) };
}

export async function getLeagueEvents({ leagueId }) {
  const { data } = await axios.get(`${BASE}/eventsnextleague.php`, { params: { id: leagueId } });
  const events = data.events || [];
  return { count: events.length, events: events.map((e) => ({ event: e.strEvent, date: e.dateEvent, time: e.strTime, home: e.strHomeTeam, away: e.strAwayTeam, venue: e.strVenue })) };
}

export async function listLeagues({ sport } = {}) {
  const cacheKey = `sportsdb:leagues:${sport || 'all'}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  const { data } = await axios.get(`${BASE}/all_leagues.php`);
  let leagues = data.leagues || [];
  if (sport) leagues = leagues.filter((l) => l.strSport?.toLowerCase() === sport.toLowerCase());
  const result = { count: leagues.length, leagues: leagues.slice(0, 50).map((l) => ({ name: l.strLeague, sport: l.strSport })), _cached: false };
  cache.set(cacheKey, result, 86400);
  return result;
}
