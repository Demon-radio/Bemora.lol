import { EventEmitter } from 'events';
import { logger } from './logger.js';

/**
 * Monitor & Alert System
 * Watch any data source on a schedule and emit alerts when conditions are met.
 *
 * @example
 * const mon = new BemoraMonitor();
 *
 * mon.watch('btc-alert', {
 *   interval: 60000,  // check every 60s
 *   fetch: () => api.crypto.price({ coins: 'bitcoin' }),
 *   condition: (data) => data.prices[0].price > 100000,
 *   onTrigger: (data) => console.log('🚨 BTC hit $100k!', data),
 *   onError: (err) => console.error('Monitor error:', err),
 * });
 *
 * mon.stop('btc-alert'); // stop a watcher
 * mon.stopAll();          // stop everything
 */
export class BemoraMonitor extends EventEmitter {
  constructor() {
    super();
    this._watchers = new Map();
  }

  /**
   * Start watching a data source
   * @param {string} id - unique watcher name
   * @param {Object} opts
   * @param {number} [opts.interval] - ms between checks (default 60000)
   * @param {Function} opts.fetch - async fn that returns data
   * @param {Function} [opts.condition] - fn(data) => boolean, if omitted: always fires
   * @param {Function} [opts.onTrigger] - fn(data) called when condition is true
   * @param {Function} [opts.onError] - fn(err) on fetch error
   * @param {boolean} [opts.once] - stop after first trigger
   * @returns {this}
   */
  watch(id, { interval = 60000, fetch, condition, onTrigger, onError, once = false }) {
    if (this._watchers.has(id)) this.stop(id);

    const run = async () => {
      try {
        const data = await fetch();
        const triggered = condition ? condition(data) : true;
        if (triggered) {
          this.emit('trigger', { id, data });
          if (onTrigger) onTrigger(data);
          if (once) this.stop(id);
        }
        this.emit('check', { id, data, triggered });
      } catch (err) {
        this.emit('error', { id, error: err.message });
        if (onError) onError(err);
        else logger.error(`Monitor "${id}" error: ${err.message}`);
      }
    };

    run(); // run immediately
    const timer = setInterval(run, interval);
    this._watchers.set(id, timer);
    logger.info(`Monitor started: "${id}" every ${interval}ms`);
    return this;
  }

  /** Stop a watcher by ID */
  stop(id) {
    const timer = this._watchers.get(id);
    if (timer) { clearInterval(timer); this._watchers.delete(id); }
    return this;
  }

  /** Stop all watchers */
  stopAll() {
    this._watchers.forEach((timer) => clearInterval(timer));
    this._watchers.clear();
    return this;
  }

  /** List active watcher IDs */
  list() {
    return [...this._watchers.keys()];
  }
}
