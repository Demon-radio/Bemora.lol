import axios from 'axios';
import * as cache from '../core/cache.js';

export async function getRandomXKCD() {
  const cacheKey = 'comics:xkcd:random';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data: latest } = await axios.get('https://xkcd.com/info.0.json');
  const randomNum = Math.floor(Math.random() * latest.num) + 1;
  const { data } = await axios.get(`https://xkcd.com/${randomNum}/info.0.json`);
  const result = { comic: data, _cached: false };
  cache.set(cacheKey, result, 3600);
  return result;
}

export async function getXKCD({ num }) {
  const url = num ? `https://xkcd.com/${num}/info.0.json` : 'https://xkcd.com/info.0.json';
  const { data } = await axios.get(url);
  return { comic: data };
}
