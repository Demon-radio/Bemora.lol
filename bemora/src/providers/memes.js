import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();

export async function getRandomMeme() {
  const cacheKey = 'memes:random';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  let data;
  try {
    ({ data } = await http.get('https://meme-api.com/gimme'));
  } catch (err) {
    throw wrapProviderError(err, 'memes');
  }

  const result = { meme: data, _cached: false };
  cache.set(cacheKey, result, 30);
  return result;
}

export async function getMemesFromSubreddit({ subreddit, limit = 10 }) {
  const cacheKey = `memes:subreddit:${subreddit}:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  let data;
  try {
    ({ data } = await http.get(`https://meme-api.com/gimme/${encodeURIComponent(subreddit)}/${limit}`));
  } catch (err) {
    throw wrapProviderError(err, 'memes');
  }

  const result = { memes: data.memes, _cached: false };
  cache.set(cacheKey, result, 1800);
  return result;
}
