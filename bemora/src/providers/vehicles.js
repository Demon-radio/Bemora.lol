import axios from 'axios';
import * as cache from '../core/cache.js';

export async function getRandomCar() {
  const cacheKey = 'vehicles:car:random';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data } = await axios.get('https://vpic.nhtsa.dot.gov/api/vehicles/GetMakesForVehicleType/car?format=json');
  const makes = data.Results;
  const randomMake = makes[Math.floor(Math.random() * makes.length)];
  const result = { make: randomMake, _cached: false };
  cache.set(cacheKey, result, 86400);
  return result;
}
