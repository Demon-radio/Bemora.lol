
import axios from 'axios';
import * as cache from '../core/cache.js';

/**
 * Get Quran chapter list
 */
export async function getQuranChapters() {
  const cacheKey = 'islamic:quran:chapters';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data } = await axios.get('https://api.alquran.cloud/v1/surah');
  const result = { chapters: data.data, _cached: false };
  cache.set(cacheKey, result, 86400);
  return result;
}

/**
 * Get Quran chapter by number
 * @param {{ number: number, edition?: string }} params
 */
export async function getQuranChapter({ number, edition = 'quran-uthmani' }) {
  const cacheKey = `islamic:quran:chapter:${number}:${edition}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data } = await axios.get(`https://api.alquran.cloud/v1/surah/${number}/${edition}`);
  const result = { chapter: data.data, _cached: false };
  cache.set(cacheKey, result, 86400);
  return result;
}

/**
 * Get random verse
 */
export async function getRandomVerse() {
  const cacheKey = 'islamic:quran:random-verse';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data: chapters } = await getQuranChapters();
  const randomChapter = chapters.chapters[Math.floor(Math.random() * chapters.chapters.length)];
  const { data } = await axios.get(`https://api.alquran.cloud/v1/ayah/${randomChapter.number}:${Math.floor(Math.random() * randomChapter.numberOfAyahs) + 1}/en.sahih`);
  const result = { verse: data.data, _cached: false };
  cache.set(cacheKey, result, 3600);
  return result;
}

/**
 * Get Azkar (morning/evening)
 */
export async function getAzkar({ type = 'morning' }) {
  const cacheKey = `islamic:azkar:${type}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data } = await axios.get('https://www.hisnmuslim.com/api/ar/' + (type === 'morning' ? '44.json' : '45.json'));
  const result = { azkar: data, _cached: false };
  cache.set(cacheKey, result, 86400);
  return result;
}

export async function getPrayerTimes({ city, country, method = 2 }) {
  const cacheKey = `islamic:prayer:${city}:${country}:${method}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data } = await axios.get('http://api.aladhan.com/v1/timingsByCity', {
    params: { city, country, method }
  });
  const result = { timings: data.data.timings, date: data.data.date, _cached: false };
  cache.set(cacheKey, result, 3600);
  return result;
}
