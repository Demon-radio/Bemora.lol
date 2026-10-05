/**
 * Plugin system for Bemora.
 *
 * A plugin takes one of two forms (both are first-class):
 *
 * 1. Object form — `{ name, install(api), beforeRequest?, afterResponse?, onError? }`
 * 2. Function form — a bare `install(api)` function. The plugin name is taken
 *    from `fn.pluginName`, then the function's own `name`, then `opts.name`.
 *    Lifecycle hooks may be attached as function properties:
 *    `fn.beforeRequest = async (...) => {...}`.
 *
 * Lifecycle:
 *   define → use()/loadPlugin() → validate → install(api) → registered
 *   → hooks run on every provider call → hook errors are swallowed.
 * An install() that throws aborts registration loudly (fail-fast at setup)
 * and the plugin is NOT marked installed, so a fixed plugin can be retried.
 * Registration is idempotent per name; there is no uninstall — create a
 * fresh Bemora instance for isolation (see forTenant()/withTenant()).
 *
 * @example object form
 * const loggingPlugin = {
 *   name: 'logging',
 *   install(api) {},
 *   beforeRequest({ provider, args }) { console.log('→', provider); },
 *   afterResponse({ provider, result }) { console.log('←', provider); },
 *   onError({ provider, error }) { console.error('✗', provider, error.message); },
 * };
 * api.use(loggingPlugin);
 *
 * @example function form
 * async function logging(api) { api.logCalls = true; }
 * logging.beforeRequest = async ({ provider }) => console.log('→', provider);
 * api.use(logging); // name taken from the function name: 'logging'
 */
/**
 * Normalize a plugin definition to the canonical object form.
 * Accepts an object `{ name, install }` or a bare `install(api)` function.
 * @param {Object|Function} plugin
 * @param {{ name?: string }} [opts] - fallback name for anonymous functions
 * @returns {{ name: string, install: Function, beforeRequest?: Function, afterResponse?: Function, onError?: Function }}
 * @throws {Error} when no usable name or install function exists
 */
export function normalizePlugin(plugin, opts = {}) {
  if (typeof plugin === 'function') {
    // Note: anonymous functions have name === '' (not nullish), so use ||.
    const name = plugin.pluginName || plugin.name || opts.name;
    if (!name) {
      throw new Error(
        'Bemora plugin must have a name and an install(api) method. ' +
          'Pass a named function, set fn.pluginName, or use api.use(fn, { name: "my-plugin" }).'
      );
    }
    return {
      name,
      install: plugin,
      beforeRequest: typeof plugin.beforeRequest === 'function' ? plugin.beforeRequest : undefined,
      afterResponse: typeof plugin.afterResponse === 'function' ? plugin.afterResponse : undefined,
      onError: typeof plugin.onError === 'function' ? plugin.onError : undefined,
    };
  }
  if (!plugin?.name || typeof plugin.install !== 'function') {
    throw new Error('Bemora plugin must have a name and an install(api) method.');
  }
  return plugin;
}

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
   * Install a plugin into a Bemora instance.
   * Accepts the object form `{ name, install, ...hooks }` or a bare
   * `install(api)` function (see normalizePlugin). Idempotent per name.
   * A throwing install() propagates and leaves nothing registered.
   * @param {Object|Function} plugin
   * @param {Object} api - the Bemora instance
   * @param {{ name?: string }} [opts] - fallback name for anonymous functions
   */
  use(plugin, api, opts = {}) {
    const normalized = normalizePlugin(plugin, opts);
    if (this._installed.has(normalized.name)) return; // idempotent
    normalized.install(api);
    if (typeof normalized.beforeRequest === 'function')
      this._beforeRequest.push(normalized.beforeRequest.bind(normalized));
    if (typeof normalized.afterResponse === 'function')
      this._afterResponse.push(normalized.afterResponse.bind(normalized));
    if (typeof normalized.onError === 'function') this._onError.push(normalized.onError.bind(normalized));
    this._installed.add(normalized.name);
  }

  /**
   * Run all beforeRequest hooks (in installation order).
   * @param {{ provider: string, args: any[] }} context
   */
  async runBeforeRequest(context) {
    for (const hook of this._beforeRequest) {
      try {
        await hook(context);
      } catch {}
    }
  }

  /**
   * Run all afterResponse hooks (in installation order).
   * @param {{ provider: string, args: any[], result: any }} context
   */
  async runAfterResponse(context) {
    for (const hook of this._afterResponse) {
      try {
        await hook(context);
      } catch {}
    }
  }

  /**
   * Run all onError hooks (in installation order).
   * @param {{ provider: string, args: any[], error: Error }} context
   */
  async runOnError(context) {
    for (const hook of this._onError) {
      try {
        await hook(context);
      } catch {}
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
