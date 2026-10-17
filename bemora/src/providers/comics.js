import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();

export async function getRandomXKCD() {
  const cacheKey = 'comics:xkcd:random';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  try {
    const { data: latest } = await http.get('https://xkcd.com/info.0.json');
    const randomNum = Math.floor(Math.random() * latest.num) + 1;
    const { data } = await http.get(`https://xkcd.com/${randomNum}/info.0.json`);
    const result = { comic: data, _cached: false };
    cache.set(cacheKey, result, 3600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'comics');
  }
}

export async function getXKCD({ num }) {
  const url = num ? `https://xkcd.com/${num}/info.0.json` : 'https://xkcd.com/info.0.json';
  try {
    const { data } = await http.get(url);
    return { comic: data };
  } catch (err) {
    throw wrapProviderError(err, 'comics');
  }
}
