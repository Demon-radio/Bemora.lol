/**
 * Plugin system for Bemora.
 * A plugin is an object with a name and install(api) method.
 *
 * @example
 * const stocksPlugin = {
 *   name: 'stocks',
 *   install(api) {
 *     api.stocks = {
 *       price: async ({ symbol }) => { ... }
 *     };
 *   }
 * };
 * api.use(stocksPlugin);
 * await api.stocks.price({ symbol: 'AAPL' });
 */
export class PluginSystem {
  constructor() {
    this._installed = new Set();
  }

  /**
   * Install a plugin into a Bemora instance
   * @param {Object} plugin
   * @param {string} plugin.name
   * @param {Function} plugin.install
   * @param {Object} api - the Bemora instance
   */
  use(plugin, api) {
    if (!plugin?.name || typeof plugin.install !== 'function') {
      throw new Error('Bemora plugin must have a name and an install(api) method.');
    }
    if (this._installed.has(plugin.name)) return; // idempotent
    plugin.install(api);
    this._installed.add(plugin.name);
  }

  /**
   * List installed plugin names
   * @returns {string[]}
   */
  list() {
    return [...this._installed];
  }
}
