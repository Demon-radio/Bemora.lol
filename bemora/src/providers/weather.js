import axios from 'axios';
import * as cache from '../core/cache.js';
import { logger } from '../core/logger.js';

/**
 * Get current weather for a city
 * @param {Object} params
 * @param {string} params.city
 * @param {string} [params.units] - metric | imperial | standard
 * @param {string} apiKey - OpenWeatherMap API key
 * @returns {Promise<Object>}
 */
export async function getCurrentWeather({ city, units = 'metric', signal }, apiKey) {
  const cacheKey = `weather:current:${city}:${units}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const url = 'https://api.openweathermap.org/data/2.5/weather';
  const { data } = await axios.get(url, {
    params: { q: city, units, appid: apiKey },
    signal,
  });

  const result = {
    city: data.name,
    country: data.sys.country,
    temperature: data.main.temp,
    feels_like: data.main.feels_like,
    humidity: data.main.humidity,
    pressure: data.main.pressure,
    wind_speed: data.wind.speed,
    condition: data.weather[0].main,
    description: data.weather[0].description,
    icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
    units,
    _cached: false,
  };

  cache.set(cacheKey, result, 600);
  logger.info(`Weather fetched for ${city}`);
  return result;
}

/**
 * Get 5-day weather forecast
 * @param {Object} params
 * @param {string} params.city
 * @param {string} [params.units]
 * @param {string} apiKey
 * @returns {Promise<Object>}
 */
export async function getForecast({ city, units = 'metric', signal }, apiKey) {
  const cacheKey = `weather:forecast:${city}:${units}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const url = 'https://api.openweathermap.org/data/2.5/forecast';
  const { data } = await axios.get(url, {
    params: { q: city, units, appid: apiKey },
    signal,
  });

  const result = {
    city: data.city.name,
    country: data.city.country,
    forecast: data.list.map((item) => ({
      datetime: item.dt_txt,
      temperature: item.main.temp,
      condition: item.weather[0].main,
      description: item.weather[0].description,
      humidity: item.main.humidity,
      wind_speed: item.wind.speed,
    })),
    _cached: false,
  };

  cache.set(cacheKey, result, 1800);
  return result;
}
