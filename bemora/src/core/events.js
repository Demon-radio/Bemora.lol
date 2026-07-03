/**
 * Lightweight event emitter for Bemora lifecycle events.
 * Events: 'cache:hit', 'cache:miss', 'error', 'request', 'response', 'retry'
 */
export class BemoraEvents {
  constructor() {
    this._handlers = {};
  }

  /**
   * Listen to an event
   * @param {string} event
   * @param {Function} handler
   * @returns {this}
   */
  on(event, handler) {
    if (!this._handlers[event]) this._handlers[event] = [];
    this._handlers[event].push(handler);
    return this;
  }

  /**
   * Remove a listener
   * @param {string} event
   * @param {Function} handler
   */
  off(event, handler) {
    if (!this._handlers[event]) return;
    this._handlers[event] = this._handlers[event].filter((h) => h !== handler);
  }

  /**
   * Emit an event
   * @param {string} event
   * @param {any} payload
   */
  emit(event, payload) {
    (this._handlers[event] || []).forEach((h) => {
      try { h(payload); } catch (_) {}
    });
    (this._handlers['*'] || []).forEach((h) => {
      try { h({ event, payload }); } catch (_) {}
    });
  }
}
