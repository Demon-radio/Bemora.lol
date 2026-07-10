import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';
import { logger } from '../core/logger.js';

const BASE = 'https://v3.football.api-sports.io';

function client(apiKey) {
  return httpClient({
    headers: { 'x-apisports-key': apiKey },
  });
}

export async function getFixtures({ league, date } = {}, apiKey) {
  const cacheKey = `football:fixtures:${league}:${date}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const http = client(apiKey);
  const params = { live: 'all' };
  if (league) params.league = league;
  if (date) { delete params.live; params.date = date; }

  try {
    const { data } = await http.get(`${BASE}/fixtures`, { params });

    const result = {
      fixtures: (data.response || []).map((f) => ({
        id: f.fixture.id,
        date: f.fixture.date,
        status: f.fixture.status.long,
        league: f.league.name,
        home: f.teams.home.name,
        away: f.teams.away.name,
        score: `${f.goals.home ?? '?'} - ${f.goals.away ?? '?'}`,
      })),
      _cached: false,
    };

    cache.set(cacheKey, result, 60);
    logger.info(`Football fixtures fetched (${result.fixtures.length})`);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'football');
  }
}

export async function getStandings({ league, season }, apiKey) {
  const cacheKey = `football:standings:${league}:${season}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const http = client(apiKey);
  try {
    const { data } = await http.get(`${BASE}/standings`, { params: { league, season } });

    const standings = data.response?.[0]?.league?.standings?.[0] || [];
    const result = {
      league: data.response?.[0]?.league?.name,
      season,
      standings: standings.map((t) => ({
        rank: t.rank,
        team: t.team.name,
        points: t.points,
        played: t.all.played,
        won: t.all.win,
        drawn: t.all.draw,
        lost: t.all.lose,
        goal_diff: t.goalsDiff,
      })),
      _cached: false,
    };

    cache.set(cacheKey, result, 3600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'football');
  }
}

export async function searchTeams({ name }, apiKey) {
  const http = client(apiKey);
  try {
    const { data } = await http.get(`${BASE}/teams`, { params: { search: name } });

    return {
      teams: (data.response || []).map((t) => ({
        id: t.team.id,
        name: t.team.name,
        country: t.team.country,
        founded: t.team.founded,
        logo: t.team.logo,
      })),
      _cached: false,
    };
  } catch (err) {
    throw wrapProviderError(err, 'football');
  }
}
