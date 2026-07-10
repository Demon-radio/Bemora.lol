/**
 * Plugin system for Bemora.
 * A plugin is an object with a name and install(api) method.
 * Optionally a plugin can expose lifecycle hooks:
 *   beforeRequest(context)    — called before every provider call; may mutate context.args
 *   afterResponse(context)    — called after a successful provider call; may mutate context.result
 *   onError(context)          — called when a provider call throws; receives context.error
 *
 * @example
 * const loggingPlugin = {
 *   name: 'logging',
 *   install(api) {},
 *   beforeRequest({ provider, args }) { console.log('→', provider); },
 *   afterResponse({ provider, result }) { console.log('←', provider); },
 *   onError({ provider, error }) { console.error('✗', provider, error.message); },
 * };
 * api.use(loggingPlugin);
 */
export class PluginSystem {
  constructor() {
    this._installed = new Set();
    /** @type {Function[]} */
    this._beforeRequest = [];
    /** @type {Function[]} */
    this._afterResponse = [];
    /** @type {Function[]} */
    this._onError = [];
  }

  /**
   * Install a plugin into a Bemora instance
   * @param {Object} plugin
   * @param {string} plugin.name
   * @param {Function} plugin.install
   * @param {Function} [plugin.beforeRequest]
   * @param {Function} [plugin.afterResponse]
   * @param {Function} [plugin.onError]
   * @param {Object} api - the Bemora instance
   */
  use(plugin, api) {
    if (!plugin?.name || typeof plugin.install !== 'function') {
      throw new Error('Bemora plugin must have a name and an install(api) method.');
    }
    if (this._installed.has(plugin.name)) return; // idempotent
    plugin.install(api);
    if (typeof plugin.beforeRequest === 'function') this._beforeRequest.push(plugin.beforeRequest.bind(plugin));
    if (typeof plugin.afterResponse === 'function') this._afterResponse.push(plugin.afterResponse.bind(plugin));
    if (typeof plugin.onError === 'function') this._onError.push(plugin.onError.bind(plugin));
    this._installed.add(plugin.name);
  }

  /**
   * Run all beforeRequest hooks (in installation order).
   * @param {{ provider: string, args: any[] }} context
   */
  async runBeforeRequest(context) {
    for (const hook of this._beforeRequest) {
      try { await hook(context); } catch {}
    }
  }

  /**
   * Run all afterResponse hooks (in installation order).
   * @param {{ provider: string, args: any[], result: any }} context
   */
  async runAfterResponse(context) {
    for (const hook of this._afterResponse) {
      try { await hook(context); } catch {}
    }
  }

  /**
   * Run all onError hooks (in installation order).
   * @param {{ provider: string, args: any[], error: Error }} context
   */
  async runOnError(context) {
    for (const hook of this._onError) {
      try { await hook(context); } catch {}
    }
  }

  /**
   * List installed plugin names
   * @returns {string[]}
   */
  list() {
    return [...this._installed];
  }
}
