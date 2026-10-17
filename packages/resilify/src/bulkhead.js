/**
 * Bulkhead — limit the number of concurrent calls to a dependency.
 *
 * Named after the watertight compartments in a ship: if one section floods,
 * it doesn't sink the whole vessel. Same idea here — a slow or overloaded
 * dependency can only consume up to `concurrency` slots, protecting the rest
 * of your application.
 *
 * @example
 * import { Bulkhead } from 'resilify';
 *
 * // At most 5 concurrent calls to the payments API
 * const paymentsBulkhead = new Bulkhead({ concurrency: 5, queue: 20 });
 *
 * // Every call goes through the bulkhead
 * const result = await paymentsBulkhead.run(() => paymentsApi.charge(order));
 *
 * // Check pressure at any time
 * console.log(paymentsBulkhead.active); // calls in flight
 * console.log(paymentsBulkhead.queued); // calls waiting
 */

export class BulkheadError extends Error {
  constructor(message) {
    super(message);
    this.name = 'BulkheadError';
  }
}

export class Bulkhead {
  /**
   * @param {Object} [opts]
   * @param {number} [opts.concurrency=10] - max simultaneous in-flight calls
   * @param {number} [opts.queue=Infinity]  - max calls allowed to wait; excess are rejected immediately
   */
  constructor({ concurrency = 10, queue = Infinity } = {}) {
    if (!Number.isInteger(concurrency) || concurrency < 1) {
      throw new RangeError(`Bulkhead concurrency must be a positive integer, got ${concurrency}`);
    }
    if (queue !== Infinity && (!Number.isInteger(queue) || queue < 0)) {
      throw new RangeError(`Bulkhead queue must be a non-negative integer or Infinity, got ${queue}`);
    }

    this._concurrency = concurrency;
    this._queueLimit = queue;
    this._active = 0;
    this._pending = []; // { resolve, reject }[]
  }

  /** Number of calls currently in flight. */
  get active() {
    return this._active;
  }

  /** Number of calls waiting for a slot. */
  get queued() {
    return this._pending.length;
  }

  /** @returns {{ active: number, queued: number, concurrency: number, queueLimit: number }} */
  getStats() {
    return {
      active: this._active,
      queued: this._pending.length,
      concurrency: this._concurrency,
      queueLimit: this._queueLimit,
    };
  }

  /**
   * Run `fn` through the bulkhead.
   *
   * - If a slot is free: runs immediately.
   * - If all slots are taken but the queue is not full: waits for a slot.
   * - If the queue is also full: throws `BulkheadError` immediately.
   *
   * @param {() => Promise<any>} fn
   * @returns {Promise<any>}
   */
  async run(fn) {
    if (this._active >= this._concurrency) {
      if (this._pending.length >= this._queueLimit) {
        throw new BulkheadError(
          `Bulkhead queue is full — rejected immediately ` +
            `(concurrency: ${this._concurrency}, queue limit: ${this._queueLimit})`,
        );
      }
      // Wait until a slot opens up
      await new Promise((resolve, reject) => {
        this._pending.push({ resolve, reject });
      });
    }

    this._active++;
    try {
      return await fn();
    } finally {
      this._active--;
      const next = this._pending.shift();
      if (next) next.resolve();
    }
  }
}
