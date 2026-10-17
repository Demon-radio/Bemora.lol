import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();

export async function getNBATeams() {
  const cacheKey = 'basketball:nba:teams';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  try {
    const { data } = await http.get('https://www.balldontlie.io/api/v1/teams');
    const result = { teams: data.data, _cached: false };
    cache.set(cacheKey, result, 86400);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'basketball');
  }
}

export async function getNBAGames({ dates }) {
  const cacheKey = `basketball:nba:games:${dates}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  try {
    const { data } = await http.get('https://www.balldontlie.io/api/v1/games', {
      params: { dates },
    });
    const result = { games: data.data, _cached: false };
    cache.set(cacheKey, result, 3600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'basketball');
  }
}

export async function getNBAPlayer({ id }) {
  try {
    const { data } = await http.get(`https://www.balldontlie.io/api/v1/players/${id}`);
    return { player: data };
  } catch (err) {
    throw wrapProviderError(err, 'basketball');
  }
}
