import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();

const LLAMA = 'https://api.llama.fi';
const COINS = 'https://coins.llama.fi';

/**
 * Fetch DeFi protocols ranked by TVL.
 * @param {Object} params
 * @param {number} [params.limit=10] - max number of protocols to return
 * @returns {Promise<Object>} normalized protocols array
 */
export async function protocols({ limit = 10 } = {}) {
  const cacheKey = `defillama:protocols:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${LLAMA}/protocols`);
    const result = {
      protocols: data.slice(0, limit).map((p) => ({
        name: p.name,
        symbol: p.symbol,
        category: p.category,
        chains: p.chains,
        tvl: p.tvl,
        change1d: p.change_1d,
        change7d: p.change_7d,
        slug: p.slug,
      })),
      _cached: false,
    };
    cache.set(cacheKey, result, 300);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'defillama');
  }
}

/**
 * Fetch details for a single DeFi protocol by slug.
 * @param {Object} params
 * @param {string} params.slug - protocol slug
 * @returns {Promise<Object>} normalized protocol details
 */
export async function protocol({ slug } = {}) {
  const cacheKey = `defillama:protocol:${slug}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${LLAMA}/protocol/${encodeURIComponent(slug)}`);
    const result = {
      name: data.name,
      symbol: data.symbol,
      category: data.category,
      description: data.description,
      tvl: data.tvl,
      chains: data.chains,
      currentChainTvls: data.currentChainTvls,
      _cached: false,
    };
    cache.set(cacheKey, result, 600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'defillama');
  }
}

/**
 * Fetch TVL for all supported chains.
 * @returns {Promise<Object>} normalized chains array
 */
export async function chains() {
  const cacheKey = 'defillama:chains';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${LLAMA}/v2/chains`);
    const result = {
      chains: (Array.isArray(data) ? data : []).map((c) => ({
        name: c.name,
        tvl: c.tvl,
        token: c.tokenSymbol,
      })),
      _cached: false,
    };
    cache.set(cacheKey, result, 600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'defillama');
  }
}

/**
 * Fetch the current total TVL for a protocol as plain text.
 * @param {Object} params
 * @param {string} params.protocol - protocol slug
 * @returns {Promise<Object>} protocol plus numeric TVL
 */
export async function tvl({ protocol } = {}) {
  const cacheKey = `defillama:tvl:${protocol}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${LLAMA}/tvl/${encodeURIComponent(protocol)}`, {
      responseType: 'text',
    });
    const result = { protocol, tvl: parseFloat(data), _cached: false };
    cache.set(cacheKey, result, 300);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'defillama');
  }
}

/**
 * Fetch current prices for a set of tokens.
 * @param {Object} params
 * @param {string} params.coins - comma-separated chain:address path segment
 * @returns {Promise<Object>} coin prices keyed by token
 */
export async function prices({ coins } = {}) {
  const cacheKey = `defillama:prices:${coins}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${COINS}/prices/current/${coins}`);
    const result = { coins: data.coins, _cached: false };
    cache.set(cacheKey, result, 60);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'defillama');
  }
}
