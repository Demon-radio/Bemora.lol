import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();

export async function getEnrichedWeather({ city, units = 'metric' }, weatherKey) {
  const cacheKey = `enriched:weather:${city}:${units}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  let w;
  try {
    const res = await http.get('https://api.openweathermap.org/data/2.5/weather', {
      params: { q: city, units, appid: weatherKey },
    });
    w = res.data;
  } catch (err) {
    throw wrapProviderError(err, 'enriched');
  }

  const { lat, lon } = w.coord;

  const [aqRes, uvRes] = await Promise.allSettled([
    http.get('https://api.openweathermap.org/data/2.5/air_pollution', {
      params: { lat, lon, appid: weatherKey },
    }),
    http.get('https://api.openweathermap.org/data/2.5/uvi', {
      params: { lat, lon, appid: weatherKey },
    }),
  ]);

  const aq = aqRes.status === 'fulfilled' ? aqRes.value.data?.list?.[0] : null;
  const uv = uvRes.status === 'fulfilled' ? uvRes.value.data?.value : null;

  const AQI_LABELS = ['', 'Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];

  const result = {
    city: w.name,
    country: w.sys.country,
    coordinates: { lat, lon },
    temperature: w.main.temp,
    feels_like: w.main.feels_like,
    humidity: w.main.humidity,
    pressure: w.main.pressure,
    wind_speed: w.wind.speed,
    visibility: w.visibility,
    condition: w.weather[0].main,
    description: w.weather[0].description,
    icon: `https://openweathermap.org/img/wn/${w.weather[0].icon}@2x.png`,
    sunrise: new Date(w.sys.sunrise * 1000).toISOString(),
    sunset: new Date(w.sys.sunset * 1000).toISOString(),
    air_quality: aq
      ? {
          aqi: aq.main.aqi,
          label: AQI_LABELS[aq.main.aqi] || 'Unknown',
          pm2_5: aq.components.pm2_5,
          pm10: aq.components.pm10,
          co: aq.components.co,
          no2: aq.components.no2,
          o3: aq.components.o3,
        }
      : null,
    uv_index: uv,
    uv_risk: uv === null ? null
      : uv <= 2 ? 'Low'
      : uv <= 5 ? 'Moderate'
      : uv <= 7 ? 'High'
      : uv <= 10 ? 'Very High'
      : 'Extreme',
    units,
    _cached: false,
  };

  cache.set(cacheKey, result, 600);
  return result;
}

export async function compareCities({ cities, units = 'metric' }, weatherKey) {
  const results = await Promise.allSettled(
    cities.map((city) =>
      http
        .get('https://api.openweathermap.org/data/2.5/weather', {
          params: { q: city, units, appid: weatherKey },
        })
        .then(({ data: w }) => ({
          city: w.name,
          country: w.sys.country,
          temperature: w.main.temp,
          feels_like: w.main.feels_like,
          humidity: w.main.humidity,
          condition: w.weather[0].main,
          wind_speed: w.wind.speed,
        }))
    )
  );
  return results.map((r, i) =>
    r.status === 'fulfilled' ? r.value : { city: cities[i], error: r.reason?.message }
  );
}
