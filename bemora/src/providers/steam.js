
import axios from 'axios';
import * as cache from '../core/cache.js';

export async function getPlayerSummaries({ steamIds, apiKey }) {
  const cacheKey = `steam:summaries:${Array.isArray(steamIds) ? steamIds.join(',') : steamIds}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data } = await axios.get('https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/', {
    params: { key: apiKey, steamids: Array.isArray(steamIds) ? steamIds.join(',') : steamIds },
  });
  const result = { players: data.response.players, _cached: false };
  cache.set(cacheKey, result, 1800);
  return result;
}

export async function getOwnedGames({ steamId, apiKey, includeAppInfo = true }) {
  const { data } = await axios.get('https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/', {
    params: { key: apiKey, steamid: steamId, include_appinfo: includeAppInfo, include_played_free_games: true },
  });
  return { games: data.response.games || [] };
}

export async function searchApps({ query }) {
  const cacheKey = `steam:apps:${query}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data } = await axios.get('https://api.steampowered.com/ISteamApps/GetAppList/v0002/');
  const apps = data.applist.apps.filter(app => app.name.toLowerCase().includes(query.toLowerCase()));

  const result = { apps: apps.slice(0, 20), _cached: false };
  cache.set(cacheKey, result, 3600);
  return result;
}

