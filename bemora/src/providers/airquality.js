import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();
const BASE = 'https://air-quality-api.open-meteo.com/v1/air-quality';

export async function getCurrent({ lat, lon }) {
  const cacheKey = `airquality:${lat}:${lon}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(BASE, {
      params: { latitude: lat, longitude: lon, current: 'us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,ozone,sulphur_dioxide' },
    });
    const c = data.current || {};
    const result = {
      lat, lon,
      us_aqi: c.us_aqi,
      pm10: c.pm10,
      pm2_5: c.pm2_5,
      carbon_monoxide: c.carbon_monoxide,
      nitrogen_dioxide: c.nitrogen_dioxide,
      ozone: c.ozone,
      sulphur_dioxide: c.sulphur_dioxide,
      time: c.time,
      _cached: false,
    };
    cache.set(cacheKey, result, 900);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'airquality');
  }
}

export function classifyAQI({ aqi }) {
  if (aqi <= 50) return { aqi, level: 'Good', color: '#00e400' };
  if (aqi <= 100) return { aqi, level: 'Moderate', color: '#ffff00' };
  if (aqi <= 150) return { aqi, level: 'Unhealthy for Sensitive Groups', color: '#ff7e00' };
  if (aqi <= 200) return { aqi, level: 'Unhealthy', color: '#ff0000' };
  if (aqi <= 300) return { aqi, level: 'Very Unhealthy', color: '#8f3f97' };
  return { aqi, level: 'Hazardous', color: '#7e0023' };
}

export async function getForecast({ lat, lon, days = 3 }) {
  try {
    const { data } = await http.get(BASE, {
      params: { latitude: lat, longitude: lon, hourly: 'us_aqi,pm2_5', forecast_days: days },
    });
    return { lat, lon, days, hourly: data.hourly };
  } catch (err) {
    throw wrapProviderError(err, 'airquality');
  }
}
