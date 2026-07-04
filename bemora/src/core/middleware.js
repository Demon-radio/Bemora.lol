/**
 * Express-style composable middleware chain.
 * More powerful than interceptors: middleware can wrap the entire call
 * (measure timing, short-circuit, retry, mutate ctx) via next().
 *
 * @example
 * api.middleware.use(async (ctx, next) => {
 *   ctx.startTime = Date.now();
 *   await next();
 *   ctx.latency = Date.now() - ctx.startTime;
 * });
 * api.middleware.use(loggingMiddleware);
 */
export class MiddlewareChain {
  constructor() {
    this._stack = [];
  }

  /**
   * Register a middleware function: (ctx, next) => Promise<void>
   * @param {Function} fn
   * @returns {this}
   */
  use(fn) {
    if (typeof fn !== 'function') {
      throw new Error('Middleware must be a function of the form (ctx, next) => {}.');
    }
    this._stack.push(fn);
    return this;
  }

  /**
   * Run the middleware chain around a terminal handler.
   * @param {Object} ctx - mutable context object, shared across the chain
   * @param {Function} terminal - the final async handler, called after all middleware calls next()
   */
  async run(ctx, terminal) {
    const stack = this._stack;
    let index = -1;

    const dispatch = async (i) => {
      if (i <= index) throw new Error('next() called multiple times in one middleware.');
      index = i;
      if (i < stack.length) {
        await stack[i](ctx, () => dispatch(i + 1));
      } else {
        ctx.result = await terminal(ctx);
      }
    };

    await dispatch(0);
    return ctx.result;
  }

  list() {
    return this._stack.length;
  }

  clear() {
    this._stack = [];
  }
}
