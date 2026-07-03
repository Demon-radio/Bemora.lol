import axios from 'axios';
import * as cache from '../core/cache.js';

export async function getMilitaryTime({ time }) {
  return { militaryTime: time };
}
