import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();

const BASE = 'https://mempool.space/api';

/**
 * Fetch recommended Bitcoin transaction fees.
 * @returns {Promise<Object>} recommended fee rates in sat/vB
 */
export async function fees() {
  const cacheKey = 'mempool:fees';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/v1/fees/recommended`);
    const result = {
      fastest: data.fastestFee,
      halfHour: data.halfHourFee,
      hour: data.hourFee,
      economy: data.economyFee,
      minimum: data.minimumFee,
      _cached: false,
    };
    cache.set(cacheKey, result, 60);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'mempool');
  }
}

/**
 * Fetch the current Bitcoin block height.
 * @returns {Promise<Object>} current block height
 */
export async function blockHeight() {
  const cacheKey = 'mempool:blockHeight';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/blocks/tip/height`, { responseType: 'text' });
    const result = { height: parseInt(data, 10), _cached: false };
    cache.set(cacheKey, result, 30);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'mempool');
  }
}

/**
 * Fetch the most recent Bitcoin blocks.
 * @param {Object} params
 * @param {number} [params.limit=10] - max number of blocks to return
 * @returns {Promise<Object>} normalized blocks array
 */
export async function blocks({ limit = 10 } = {}) {
  const cacheKey = `mempool:blocks:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/v1/blocks`);
    const result = {
      blocks: (Array.isArray(data) ? data : []).slice(0, limit).map((b) => ({
        height: b.height,
        id: b.id,
        timestamp: b.timestamp,
        txCount: b.tx_count,
        size: b.size,
        weight: b.weight,
      })),
      _cached: false,
    };
    cache.set(cacheKey, result, 60);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'mempool');
  }
}

/**
 * Fetch the upcoming Bitcoin difficulty adjustment estimate.
 * @returns {Promise<Object>} difficulty adjustment estimate
 */
export async function difficultyAdjustment() {
  const cacheKey = 'mempool:difficultyAdjustment';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/v1/difficulty-adjustment`);
    const result = {
      progress: data.progressPercent,
      change: data.difficultyChange,
      estimatedRetargetDate: data.estimatedRetargetDate,
      remainingBlocks: data.remainingBlocks,
      remainingTime: data.remainingTime,
      _cached: false,
    };
    cache.set(cacheKey, result, 300);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'mempool');
  }
}

/**
 * Fetch current mempool backlog statistics.
 * @returns {Promise<Object>} mempool count, vsize, and total fee
 */
export async function mempool() {
  const cacheKey = 'mempool:mempool';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/mempool`);
    const result = {
      count: data.count,
      vsize: data.vsize,
      totalFee: data.total_fee,
      _cached: false,
    };
    cache.set(cacheKey, result, 30);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'mempool');
  }
}
