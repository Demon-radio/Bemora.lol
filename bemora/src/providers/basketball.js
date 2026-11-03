import { httpClient } from '../core/http.js';
import { ConfigurationError, wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();

// The legacy free balldontlie.io/api/v1 endpoints were retired and 404;
// their SDK now lives on api.balldontlie.io and requires a (free) key.
const BASE = 'https://api.balldontlie.io/nba/v1';

function apiKey() {
  const key = process.env.BEMORA_BALLDONTLIE_KEY;
  if (!key) {
    throw new ConfigurationError(
      'Missing API key for "basketball". Create a free key at https://balldontlie.io and set BEMORA_BALLDONTLIE_KEY in .env', 
      { provider: 'basketball' },
    );
  }
  return key;
}

function client(key) {
  return httpClient({ headers: { Authorization: key } });
}

export async function getNBATeams() {
  const cacheKey = 'basketball:nba:teams';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  try {
    const { data } = await client(apiKey()).get(`${BASE}/teams`);
    const result = { teams: data.data, _cached: false };
    cache.set(cacheKey, result, 86400);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'basketball');
  }
}

/** @param {{ dates?: string[] }} [params] */
export async function getNBAGames({ dates, season } = {}) {
  const cacheKey = `basketball:nba:games:${dates}:${season}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  try {
    const params = {};
    if (dates) params.dates = dates;
    if (season) params.season = season;
    const { data } = await client(apiKey()).get(`${BASE}/games`, { params });
    const result = { games: data.data, _cached: false };
    cache.set(cacheKey, result, 3600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'basketball');
  }
}

/** @param {{ id: number }} params */
export async function getNBAPlayer({ id }) {
  try {
    const { data } = await client(apiKey()).get(`${BASE}/players/${id}`);
    return { player: data.data ?? data };
  } catch (err) {
    throw wrapProviderError(err, 'basketball');
  }
}
