import axios from 'axios';
import * as cache from '../core/cache.js';

export async function searchLaws({ query }) {
  return { laws: [], query };
}
