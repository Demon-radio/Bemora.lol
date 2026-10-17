import { httpClient } from '../core/http.js';
import { ValidationError, wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();
const BASE = 'https://api.aviationstack.com/v1';

export async function getLiveFlights({ flight_iata, dep_iata, arr_iata, airline_iata, limit = 10 } = {}, apiKey) {
  const cacheKey = `flights:live:${flight_iata}:${dep_iata}:${arr_iata}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const params = { access_key: apiKey, limit };
  if (flight_iata) params.flight_iata = flight_iata;
  if (dep_iata)    params.dep_iata = dep_iata;
  if (arr_iata)    params.arr_iata = arr_iata;
  if (airline_iata) params.airline_iata = airline_iata;

  try {
    const { data } = await http.get(`${BASE}/flights`, { params });

    if (data.error) throw new ValidationError(data.error.message, { provider: 'flights' });

    const result = {
      total: data.pagination?.total,
      flights: (data.data || []).map((f) => ({
        flight_date: f.flight_date,
        status: f.flight_status,
        flight: f.flight?.iata,
        airline: f.airline?.name,
        departure: {
          airport: f.departure?.airport,
          iata: f.departure?.iata,
          terminal: f.departure?.terminal,
          gate: f.departure?.gate,
          scheduled: f.departure?.scheduled,
          actual: f.departure?.actual,
          delay: f.departure?.delay,
        },
        arrival: {
          airport: f.arrival?.airport,
          iata: f.arrival?.iata,
          terminal: f.arrival?.terminal,
          gate: f.arrival?.gate,
          scheduled: f.arrival?.scheduled,
          estimated: f.arrival?.estimated,
          delay: f.arrival?.delay,
        },
      })),
      _cached: false,
    };

    cache.set(cacheKey, result, 60);
    return result;
  } catch (err) {
    if (err instanceof ValidationError) throw err;
    throw wrapProviderError(err, 'flights');
  }
}

export async function getAirport({ iata }, apiKey) {
  const cacheKey = `flights:airport:${iata}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  try {
    const { data } = await http.get(`${BASE}/airports`, {
      params: { access_key: apiKey, iata_code: iata },
    });

    const a = data.data?.[0];
    if (!a) throw new ValidationError(`Airport not found: ${iata}`, { provider: 'flights' });

    const result = {
      name: a.airport_name,
      iata: a.iata_code,
      icao: a.icao_code,
      city: a.city_iata_code,
      country: a.country_name,
      country_code: a.country_iso2,
      lat: a.latitude,
      lon: a.longitude,
      timezone: a.timezone,
      phone: a.phone_number,
      website: a.website,
      _cached: false,
    };

    cache.set(cacheKey, result, 86400);
    return result;
  } catch (err) {
    if (err instanceof ValidationError) throw err;
    throw wrapProviderError(err, 'flights');
  }
}

export async function getAirline({ name, iata }, apiKey) {
  const cacheKey = `flights:airline:${name || iata}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const params = { access_key: apiKey };
  if (iata) params.iata_code = iata;
  if (name) params.airline_name = name;

  try {
    const { data } = await http.get(`${BASE}/airlines`, { params });

    const result = {
      airlines: (data.data || []).map((a) => ({
        name: a.airline_name,
        iata: a.iata_code,
        icao: a.icao_code,
        country: a.country_name,
        active: a.status === 'active',
        fleet_size: a.fleet_size,
        hub: a.hub_code,
        website: a.website,
      })),
      _cached: false,
    };

    cache.set(cacheKey, result, 86400);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'flights');
  }
}
