/**
 * Lightweight event emitter for Bemora lifecycle events.
 * Events: 'cache:hit', 'cache:miss', 'error', 'request', 'response', 'retry'
 */
import { logger } from './logger.js';

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
      try { h(payload); } catch (e) {
        logger.error(`Event handler for "${event}" failed: ${e.message}`, e);
      }
    });
    (this._handlers['*'] || []).forEach((h) => {
      try { h({ event, payload }); } catch (e) {
        logger.error(`Event handler for "*" failed: ${e.message}`, e);
      }
    });
  }
}
