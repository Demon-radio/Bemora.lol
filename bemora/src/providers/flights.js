import axios from 'axios';
import * as cache from '../core/cache.js';

/**
 * AviationStack — real-time flight data (free tier: 100 calls/month)
 * Free key: https://aviationstack.com/product
 */

const BASE = 'https://api.aviationstack.com/v1';

/**
 * Get live flights (real-time)
 * @param {{ flight_iata?: string, dep_iata?: string, arr_iata?: string, airline_iata?: string, limit?: number }} params
 * @param {string} apiKey
 */
export async function getLiveFlights({ flight_iata, dep_iata, arr_iata, airline_iata, limit = 10 } = {}, apiKey) {
  const cacheKey = `flights:live:${flight_iata}:${dep_iata}:${arr_iata}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const params = { access_key: apiKey, limit };
  if (flight_iata) params.flight_iata = flight_iata;
  if (dep_iata)    params.dep_iata = dep_iata;
  if (arr_iata)    params.arr_iata = arr_iata;
  if (airline_iata) params.airline_iata = airline_iata;

  const { data } = await axios.get(`${BASE}/flights`, { params });

  if (data.error) throw new Error(data.error.message);

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
}

/**
 * Get airport info by IATA code
 * @param {{ iata: string }} params
 * @param {string} apiKey
 */
export async function getAirport({ iata }, apiKey) {
  const cacheKey = `flights:airport:${iata}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data } = await axios.get(`${BASE}/airports`, {
    params: { access_key: apiKey, iata_code: iata },
  });

  const a = data.data?.[0];
  if (!a) throw new Error(`Airport not found: ${iata}`);

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
}

/**
 * Get airline info
 * @param {{ name?: string, iata?: string }} params
 * @param {string} apiKey
 */
export async function getAirline({ name, iata }, apiKey) {
  const cacheKey = `flights:airline:${name || iata}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const params = { access_key: apiKey };
  if (iata) params.iata_code = iata;
  if (name) params.airline_name = name;

  const { data } = await axios.get(`${BASE}/airlines`, { params });

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
}
