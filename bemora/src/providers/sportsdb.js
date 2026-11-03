import * as cache from '../core/cache.js';
import { httpClient } from '../core/http.js';
import { ConfigurationError, wrapProviderError } from '../core/errors.js';

// TheSportsDB retired the shared test key "3" in v1; every request now needs
// a personal (free) key. Pass it via BEMORA_SPORTSDB_KEY.
const BASE = 'https://www.thesportsdb.com/api/v1/json';

function apiKey() {
  const key = process.env.BEMORA_SPORTSDB_KEY;
  if (!key) {
    throw new ConfigurationError(
      'Missing API key for "sportsdb". The free shared key "3" was disabled; create a personal test key at https://www.thesportsdb.com/api.php and set BEMORA_SPORTSDB_KEY in .env',
      { provider: 'sportsdb' },
    );
  }
  return key;
}

const http = httpClient();

export async function searchTeam({ name }) {
  const cacheKey = `sportsdb:team:${name}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/${apiKey()}/searchteams.php`, { params: { t: name } });
    const teams = data.teams || [];
    const result = { count: teams.length, teams: teams.map((t) => ({ name: t.strTeam, league: t.strLeague, sport: t.strSport, founded: t.intFormedYear, stadium: t.strStadium, badge: t.strTeamBadge })), _cached: false };
    cache.set(cacheKey, result, 86400);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'sportsdb');
  }
}

export async function searchPlayer({ name }) {
  try {
    const { data } = await http.get(`${BASE}/${apiKey()}/searchplayers.php`, { params: { p: name } });
    const players = data.player || [];
    return { count: players.length, players: players.map((p) => ({ name: p.strPlayer, team: p.strTeam, sport: p.strSport, nationality: p.strNationality, position: p.strPosition })) };
  } catch (err) {
    throw wrapProviderError(err, 'sportsdb');
  }
}

export async function getLeagueEvents({ leagueId }) {
  try {
    const { data } = await http.get(`${BASE}/${apiKey()}/eventsnextleague.php`, { params: { id: leagueId } });
    const events = data.events || [];
    return { count: events.length, events: events.map((e) => ({ event: e.strEvent, date: e.dateEvent, time: e.strTime, home: e.strHomeTeam, away: e.strAwayTeam, venue: e.strVenue })) };
  } catch (err) {
    throw wrapProviderError(err, 'sportsdb');
  }
}

export async function listLeagues({ sport } = {}) {
  const cacheKey = `sportsdb:leagues:${sport || 'all'}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/${apiKey()}/all_leagues.php`);
    let leagues = data.leagues || [];
    if (sport) leagues = leagues.filter((l) => l.strSport?.toLowerCase() === sport.toLowerCase());
    const result = { count: leagues.length, leagues: leagues.slice(0, 50).map((l) => ({ name: l.strLeague, sport: l.strSport })), _cached: false };
    cache.set(cacheKey, result, 86400);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'sportsdb');
  }
}
