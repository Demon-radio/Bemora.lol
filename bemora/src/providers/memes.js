import axios from 'axios';
import * as cache from '../core/cache.js';

export async function getRandomMeme() {
  const cacheKey = 'memes:random';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data } = await axios.get('https://meme-api.com/gimme');
  const result = { meme: data, _cached: false };
  cache.set(cacheKey, result, 30);
  return result;
}

export async function getMemesFromSubreddit({ subreddit, limit = 10 }) {
  const cacheKey = `memes:subreddit:${subreddit}:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data } = await axios.get(`https://meme-api.com/gimme/${encodeURIComponent(subreddit)}/${limit}`);
  const result = { memes: data.memes, _cached: false };
  cache.set(cacheKey, result, 1800);
  return result;
}
