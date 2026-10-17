import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();

const BASE = 'https://api.blockchair.com';

/**
 * Fetch aggregate stats for a supported chain.
 * @param {Object} params
 * @param {string} [params.chain=bitcoin] - chain name
 * @returns {Promise<Object>} normalized chain stats
 */
export async function stats({ chain = 'bitcoin' } = {}) {
  const cacheKey = `blockchair:stats:${chain}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE}/${encodeURIComponent(chain)}/stats`);
    const d = data.data || {};
    const result = {
      chain,
      blocks: d.blocks,
      transactions: d.transactions,
      circulation: d.circulation,
      price: d.market_price_usd,
      mempoolTransactions: d.mempool_transactions,
      _cached: false,
    };
    cache.set(cacheKey, result, 300);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'blockchair');
  }
}

/**
 * Fetch dashboard details for an address.
 * @param {Object} params
 * @param {string} [params.chain=bitcoin] - chain name
 * @param {string} params.address - address to inspect
 * @returns {Promise<Object>} normalized address dashboard
 */
export async function address({ chain = 'bitcoin', address } = {}) {
  const cacheKey = `blockchair:address:${chain}:${address}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(
      `${BASE}/${encodeURIComponent(chain)}/dashboards/address/${encodeURIComponent(address)}`
    );
    const a = (data.data || {})[address]?.address || {};
    const result = {
      chain,
      address,
      balance: a.balance,
      txCount: a.transaction_count,
      received: a.received,
      spent: a.spent,
      _cached: false,
    };
    cache.set(cacheKey, result, 300);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'blockchair');
  }
}

/**
 * Fetch dashboard details for a transaction hash.
 * @param {Object} params
 * @param {string} [params.chain=bitcoin] - chain name
 * @param {string} params.hash - transaction hash
 * @returns {Promise<Object>} normalized transaction dashboard
 */
export async function transaction({ chain = 'bitcoin', hash } = {}) {
  const cacheKey = `blockchair:transaction:${chain}:${hash}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(
      `${BASE}/${encodeURIComponent(chain)}/dashboards/transaction/${encodeURIComponent(hash)}`
    );
    const t = (data.data || {})[hash]?.transaction || {};
    const result = {
      chain,
      hash,
      blockId: t.block_id,
      time: t.time,
      balanceChange: t.balance_change,
      _cached: false,
    };
    cache.set(cacheKey, result, 600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'blockchair');
  }
}
