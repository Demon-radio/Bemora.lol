import axios from 'axios';
import * as cache from '../core/cache.js';

export async function detectLanguage({ text }) {
  const cacheKey = `language:detect:${text}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data } = await axios.post('https://libretranslate.de/detect', { q: text });
  const result = { language: data[0], _cached: false };
  cache.set(cacheKey, result, 86400);
  return result;
}

export async function translateText({ text, from = 'auto', to = 'en' }) {
  const cacheKey = `language:translate:${text}:${to}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data } = await axios.post('https://libretranslate.de/translate', { q: text, source: from, target: to });
  const result = { translated: data.translatedText, _cached: false };
  cache.set(cacheKey, result, 86400);
  return result;
}
