import axios from 'axios';
import * as cache from '../core/cache.js';

const BASE = 'https://api.aladhan.com/v1';

const METHODS = {
  1: 'University of Islamic Sciences, Karachi',
  2: 'Islamic Society of North America',
  3: 'Muslim World League',
  4: 'Umm Al-Qura University, Makkah',
  5: 'Egyptian General Authority of Survey',
  8: 'Gulf Region',
  9: 'Kuwait',
  10: 'Qatar',
  11: 'Majlis Ugama Islam Singapura',
  12: 'Union Organization Islamic de France',
  13: 'Diyanet İşleri Başkanlığı, Turkey',
  14: 'Spiritual Administration of Muslims of Russia',
};

/**
 * Get prayer times for a city (Free, no key)
 * @param {{ city: string, country?: string, method?: number, date?: string }} params
 * method 5 = Egypt, method 4 = Makkah, method 2 = ISNA (default)
 */
export async function timingsByCity({ city, country = 'EG', method = 5, date }) {
  const d = date || new Date().toISOString().split('T')[0].replace(/-/g, '-');
  const cacheKey = `prayer:city:${city}:${country}:${method}:${d}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data } = await axios.get(`${BASE}/timingsByCity/${d}`, {
    params: { city, country, method },
  });

  if (data.code !== 200) throw new Error(data.status);

  const t = data.data.timings;
  const meta = data.data.meta;

  const result = {
    date: data.data.date.readable,
    hijri: `${data.data.date.hijri.day} ${data.data.date.hijri.month.en} ${data.data.date.hijri.year}`,
    city,
    country,
    method: METHODS[method] || `Method ${method}`,
    timings: {
      fajr:    t.Fajr,
      sunrise: t.Sunrise,
      dhuhr:   t.Dhuhr,
      asr:     t.Asr,
      maghrib: t.Maghrib,
      isha:    t.Isha,
      midnight: t.Midnight,
    },
    timezone: meta.timezone,
    latitude: meta.latitude,
    longitude: meta.longitude,
    _cached: false,
  };

  cache.set(cacheKey, result, 3600);
  return result;
}

/**
 * Prayer times by coordinates
 * @param {{ lat: number, lon: number, method?: number }} params
 */
export async function timingsByCoords({ lat, lon, method = 5 }) {
  const d = new Date().toISOString().split('T')[0].replace(/-/g, '-');
  const cacheKey = `prayer:coords:${lat}:${lon}:${method}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data } = await axios.get(`${BASE}/timings/${d}`, {
    params: { latitude: lat, longitude: lon, method },
  });

  const t = data.data.timings;
  const result = {
    date: data.data.date.readable,
    hijri: `${data.data.date.hijri.day} ${data.data.date.hijri.month.en} ${data.data.date.hijri.year}`,
    timings: {
      fajr: t.Fajr, sunrise: t.Sunrise, dhuhr: t.Dhuhr,
      asr: t.Asr, maghrib: t.Maghrib, isha: t.Isha,
    },
    _cached: false,
  };

  cache.set(cacheKey, result, 3600);
  return result;
}

/**
 * Get prayer times for whole month
 * @param {{ city: string, country?: string, method?: number, month?: number, year?: number }} params
 */
export async function monthlyTimings({ city, country = 'EG', method = 5, month, year }) {
  const now = new Date();
  const m = month || now.getMonth() + 1;
  const y = year || now.getFullYear();
  const cacheKey = `prayer:monthly:${city}:${method}:${m}:${y}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data } = await axios.get(`${BASE}/calendarByCity/${y}/${m}`, {
    params: { city, country, method },
  });

  const result = {
    city, country, month: m, year: y,
    days: data.data.map((d) => ({
      date: d.date.readable,
      hijri: `${d.date.hijri.day} ${d.date.hijri.month.ar}`,
      fajr: d.timings.Fajr,
      dhuhr: d.timings.Dhuhr,
      asr: d.timings.Asr,
      maghrib: d.timings.Maghrib,
      isha: d.timings.Isha,
    })),
    _cached: false,
  };

  cache.set(cacheKey, result, 86400);
  return result;
}

export const CALCULATION_METHODS = METHODS;
