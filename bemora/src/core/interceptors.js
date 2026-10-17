/**
 * Request/response interceptor pipeline, similar to Axios/Got/Ky.
 *
 * @example
 * api.interceptors.request.use((config) => {
 *   config.headers = { ...config.headers, 'X-Custom-Auth': myToken };
 *   return config;
 * });
 * api.interceptors.response.use((data) => {
 *   console.log('got response', data);
 *   return data;
 * });
 */
class InterceptorGroup {
  constructor() {
    this._handlers = [];
  }

  /**
   * Register an interceptor.
   * @param {Function} fn - (value) => value | Promise<value>
   * @returns {number} id — pass to eject() to remove
   */
  use(fn) {
    if (typeof fn !== 'function') {
      throw new Error('Interceptor must be a function.');
    }
    this._handlers.push(fn);
    return this._handlers.length - 1;
  }

  /** Remove a previously registered interceptor by id. */
  eject(id) {
    if (this._handlers[id]) this._handlers[id] = null;
  }

  /** Run all registered interceptors in order, threading the value through each. */
  async run(value) {
    let current = value;
    for (const fn of this._handlers) {
      if (!fn) continue;
      current = await fn(current);
    }
    return current;
  }

  clear() {
    this._handlers = [];
  }
}

export class Interceptors {
  constructor() {
    this.request = new InterceptorGroup();
    this.response = new InterceptorGroup();
  }
}
