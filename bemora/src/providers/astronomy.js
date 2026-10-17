import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();

export async function getSunriseSunset({ lat, lon, date = 'today' }) {
  const cacheKey = `astro:sun:${lat}:${lon}:${date}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get('https://api.sunrise-sunset.org/json', {
      params: { lat, lng: lon, date, formatted: 0 },
    });
    const r = data.results;
    const result = {
      sunrise: r.sunrise,
      sunset: r.sunset,
      solar_noon: r.solar_noon,
      day_length_seconds: r.day_length,
      civil_twilight_begin: r.civil_twilight_begin,
      civil_twilight_end: r.civil_twilight_end,
      _cached: false,
    };
    cache.set(cacheKey, result, 3600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'astronomy');
  }
}

export async function getMoonPhase({ date } = {}) {
  const ts = date ? Math.floor(new Date(date).getTime() / 1000) : Math.floor(Date.now() / 1000);
  const cacheKey = `astro:moon:${ts}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get('https://api.farmsense.net/v1/moonphases/', { params: { d: ts } });
    const m = Array.isArray(data) ? data[0] : data;
    const result = {
      phase: m?.Phase,
      illumination: m?.Illumination,
      age_days: m?.Age,
      moon_day: m?.Moon,
      _cached: false,
    };
    cache.set(cacheKey, result, 3600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'astronomy');
  }
}
