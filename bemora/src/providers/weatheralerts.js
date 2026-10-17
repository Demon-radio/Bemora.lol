import * as cache from '../core/cache.js';
import { USER_AGENT } from '../core/headers.js';
import { httpClient } from '../core/http.js';
import { ValidationError, wrapProviderError } from '../core/errors.js';

const http = httpClient();

export async function getUSAlerts({ state } = {}) {
  const cacheKey = `wxalerts:${state || 'all'}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  const url = state ? `https://api.weather.gov/alerts/active/area/${state.toUpperCase()}` : 'https://api.weather.gov/alerts/active';
  try {
    const { data } = await http.get(url, { headers: { 'User-Agent': USER_AGENT } });
    const features = data.features || [];
    const result = {
      count: features.length,
      alerts: features.slice(0, 20).map((f) => ({
        event: f.properties.event,
        severity: f.properties.severity,
        headline: f.properties.headline,
        areas: f.properties.areaDesc,
        effective: f.properties.effective,
        expires: f.properties.expires,
      })),
      _cached: false,
    };
    cache.set(cacheKey, result, 600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'weatheralerts');
  }
}

export async function getPointForecast({ lat, lon }) {
  try {
    const { data: point } = await http.get(`https://api.weather.gov/points/${lat},${lon}`, { headers: { 'User-Agent': USER_AGENT } });
    const forecastUrl = point.properties?.forecast;
    if (!forecastUrl) throw new ValidationError('No forecast available for this location', { provider: 'weatheralerts' });
    const { data: forecast } = await http.get(forecastUrl, { headers: { 'User-Agent': USER_AGENT } });
    const periods = forecast.properties?.periods || [];
    return { lat, lon, periods: periods.slice(0, 7).map((p) => ({ name: p.name, temperature: p.temperature, unit: p.temperatureUnit, forecast: p.detailedForecast, wind: p.windSpeed })) };
  } catch (err) {
    throw wrapProviderError(err, 'weatheralerts');
  }
}
