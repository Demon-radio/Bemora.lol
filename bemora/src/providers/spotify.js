import * as cache from '../core/cache.js';
import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';

const http = httpClient();

let tokenCache = { access_token: null, expires_at: 0 };

async function getSpotifyToken(clientId, clientSecret) {
  const now = Date.now();
  if (tokenCache.access_token && now < tokenCache.expires_at) return tokenCache.access_token;

  try {
    const { data } = await http.post('https://accounts.spotify.com/api/token', null, {
      params: { grant_type: 'client_credentials' },
      auth: { username: clientId, password: clientSecret },
    });

    tokenCache = {
      access_token: data.access_token,
      expires_at: now + data.expires_in * 1000,
    };

    return tokenCache.access_token;
  } catch (err) {
    throw wrapProviderError(err, 'spotify');
  }
}

export async function searchTracks({ query, limit = 20, clientId, clientSecret }) {
  const cacheKey = `spotify:search:${query}:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  try {
    const token = await getSpotifyToken(clientId, clientSecret);
    const { data } = await http.get('https://api.spotify.com/v1/search', {
      params: { q: query, type: 'track', limit },
      headers: { Authorization: `Bearer ${token}` },
    });
    const result = { tracks: data.tracks.items, _cached: false };
    cache.set(cacheKey, result, 1800);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'spotify');
  }
}

export async function getArtist({ id, clientId, clientSecret }) {
  try {
    const token = await getSpotifyToken(clientId, clientSecret);
    const { data } = await http.get(`https://api.spotify.com/v1/artists/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return { artist: data };
  } catch (err) {
    throw wrapProviderError(err, 'spotify');
  }
}

export async function getArtistTopTracks({ id, country = 'US', clientId, clientSecret }) {
  try {
    const token = await getSpotifyToken(clientId, clientSecret);
    const { data } = await http.get(`https://api.spotify.com/v1/artists/${id}/top-tracks`, {
      params: { market: country },
      headers: { Authorization: `Bearer ${token}` },
    });
    return { tracks: data.tracks };
  } catch (err) {
    throw wrapProviderError(err, 'spotify');
  }
}
