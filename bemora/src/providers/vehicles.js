import * as cache from '../core/cache.js';
import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';

const http = httpClient();

const VPIC = 'https://vpic.nhtsa.dot.gov/api/vehicles';

export async function getRandomCar() {
  const cacheKey = 'vehicles:car:random';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  try {
    const { data } = await http.get('https://vpic.nhtsa.dot.gov/api/vehicles/GetMakesForVehicleType/car?format=json');
    const makes = data.Results;
    const randomMake = makes[Math.floor(Math.random() * makes.length)];
    const result = { make: randomMake, _cached: false };
    cache.set(cacheKey, result, 86400);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'vehicles');
  }
}

/**
 * Decode a VIN into vehicle attributes (NHTSA vPIC).
 * @param {Object} params
 * @param {string} params.vin
 * @returns {Promise<Object>}
 */
export async function vinDecode({ vin }) {
  const cacheKey = `vehicles:vin:${vin}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${VPIC}/DecodeVinValues/${encodeURIComponent(vin)}?format=json`);
    const r = data.Results?.[0] || {};
    const result = {
      vin,
      make: r.Make,
      model: r.Model,
      model_year: r.ModelYear,
      vehicle_type: r.VehicleType,
      body_class: r.BodyClass,
      engine_cylinders: r.EngineCylinders,
      engine_hp: r.EngineHP,
      fuel_type: r.FuelTypePrimary,
      drive_type: r.DriveType,
      plant_country: r.PlantCountry,
      errors: r.ErrorText ? r.ErrorText.split(';').map((s) => s.trim()).filter(Boolean) : [],
      _cached: false,
    };
    cache.set(cacheKey, result, 86400);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'vehicles');
  }
}

/**
 * List vehicle makes for a vehicle type (NHTSA vPIC).
 * @param {Object} params
 * @param {string} [params.type] - e.g. car, truck, motorcycle
 * @returns {Promise<Object>}
 */
export async function makes({ type = 'car' } = {}) {
  const cacheKey = `vehicles:makes:${type}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${VPIC}/GetMakesForVehicleType/${encodeURIComponent(type)}?format=json`);
    const result = {
      type,
      makes: (data.Results || []).map((m) => ({ id: m.MakeId, name: m.MakeName })),
      _cached: false,
    };
    cache.set(cacheKey, result, 86400);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'vehicles');
  }
}

/**
 * List models for a make and model year (NHTSA vPIC).
 * @param {Object} params
 * @param {string|number} params.make
 * @param {string|number} params.year
 * @returns {Promise<Object>}
 */
export async function models({ make, year } = {}) {
  const cacheKey = `vehicles:models:${make}:${year}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(
      `${VPIC}/GetModelsForMakeYear/make/${encodeURIComponent(make)}/modelyear/${encodeURIComponent(year)}?format=json`
    );
    const result = {
      make,
      year,
      models: (data.Results || []).map((m) => m.Model_Name),
      _cached: false,
    };
    cache.set(cacheKey, result, 86400);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'vehicles');
  }
}

/**
 * Look up safety recalls for a vehicle (NHTSA Recalls API).
 * @param {Object} params
 * @param {string} params.make
 * @param {string} params.model
 * @param {string|number} params.year
 * @returns {Promise<Object>}
 */
export async function recalls({ make, model, year } = {}) {
  const cacheKey = `vehicles:recalls:${make}:${model}:${year}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get('https://api.nhtsa.gov/recalls/recallsByVehicle', {
      params: { make, model, modelYear: year },
    });
    const result = {
      make,
      model,
      year,
      count: data.Count,
      recalls: (data.results || []).map((r) => ({
        campaign_number: r.NHTSACampaignNumber,
        component: r.Component,
        summary: r.Summary,
        consequence: r.Consequence,
        remedy: r.Remedy,
        report_date: r.ReportReceivedDate,
      })),
      _cached: false,
    };
    cache.set(cacheKey, result, 86400);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'vehicles');
  }
}
