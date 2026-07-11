import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();

/**
 * blockchain.info public stats — free, no key.
 * Bitcoin network-wide stats: difficulty, hash rate, market price, etc.
 */
export async function bitcoinStats() {
  const cacheKey = 'blockchain:btc:stats';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  let data;
  try {
    ({ data } = await http.get('https://api.blockchain.info/stats'));
  } catch (err) {
    throw wrapProviderError(err, 'blockchain');
  }

  const result = {
    provider: 'blockchain.info',
    market_price_usd: data.market_price_usd,
    hash_rate: data.hash_rate,
    difficulty: data.difficulty,
    total_btc_mined: data.totalbc / 1e8,
    n_tx_last_24h: data.n_tx,
    minutes_between_blocks: data.minutes_between_blocks,
    _cached: false,
  };

  cache.set(cacheKey, result, 300);
  return result;
}

/**
 * Look up a Bitcoin address's balance and transaction count (BlockCypher, no key).
 * @param {{ address: string }} params
 */
export async function bitcoinAddress({ address }) {
  const cacheKey = `blockchain:btc:addr:${address}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  let data;
  try {
    ({ data } = await http.get(`https://api.blockcypher.com/v1/btc/main/addrs/${encodeURIComponent(address)}/balance`));
  } catch (err) {
    throw wrapProviderError(err, 'blockchain');
  }

  const result = {
    provider: 'blockcypher',
    address: data.address,
    balance_satoshis: data.balance,
    balance_btc: data.balance / 1e8,
    total_received_btc: data.total_received / 1e8,
    total_sent_btc: data.total_sent / 1e8,
    unconfirmed_tx_count: data.unconfirmed_n_tx,
    final_tx_count: data.final_n_tx,
    _cached: false,
  };

  cache.set(cacheKey, result, 60);
  return result;
}

/**
 * Ethereum network gas price snapshot (Owlracle — free, no key, rate-limited).
 * Note: Etherscan's old V1 gasoracle endpoint (no-key) was deprecated in favor
 * of a key-required V2 API, so this uses Owlracle instead.
 */
export async function ethGasPrice() {
  const cacheKey = 'blockchain:eth:gas';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  let data;
  try {
    ({ data } = await http.get('https://api.owlracle.info/v4/eth/gas'));
  } catch (err) {
    throw wrapProviderError(err, 'blockchain');
  }

  const speeds = data.speeds || [];
  const byAcceptance = (target) =>
    speeds.reduce((best, s) => (Math.abs(s.acceptance - target) < Math.abs((best?.acceptance ?? -1) - target) ? s : best), null);

  const result = {
    provider: 'owlracle',
    base_fee_gwei: data.baseFee,
    safe_gwei: byAcceptance(0.35)?.maxFeePerGas,
    proposed_gwei: byAcceptance(0.6)?.maxFeePerGas,
    fast_gwei: byAcceptance(0.9)?.maxFeePerGas,
    _cached: false,
  };

  cache.set(cacheKey, result, 30);
  return result;
}
