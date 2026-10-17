/**
 * Webhook receiver router.
 *
 * Parses, verifies, and dispatches incoming webhook payloads to registered handlers.
 *
 * Usage (Express):
 *   import express from 'express';
 *   import { WebhookRouter } from 'bemora/src/core/webhooks.js';
 *
 *   const webhooks = new WebhookRouter();
 *
 *   webhooks.on('stripe', 'payment_intent.succeeded', async (event) => {
 *     console.log('Payment succeeded:', event.data.object.id);
 *   });
 *
 *   app.post('/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
 *     try {
 *       await webhooks.route('stripe', {
 *         payload: req.body,
 *         headers: req.headers,
 *         secret: process.env.STRIPE_WEBHOOK_SECRET,
 *       });
 *       res.sendStatus(200);
 *     } catch (err) {
 *       res.status(400).send(err.message);
 *     }
 *   });
 */

import { verify as verifyWebhook } from '../providers/webhooks/verify.js';
import { logger } from './logger.js';

export class WebhookRouter {
  constructor() {
    /** @type {Map<string, Map<string, Function[]>>} */
    this._handlers = new Map();
    this._middleware = [];
  }

  /**
   * Register a handler for a provider + event type.
   * Use '*' as event type to handle all events from a provider.
   * @param {string} provider - e.g. 'stripe', 'github', 'clerk'
   * @param {string} eventType - e.g. 'payment_intent.succeeded', '*'
   * @param {(event: object, raw: object) => void|Promise<void>} handler
   */
  on(provider, eventType, handler) {
    if (!this._handlers.has(provider)) this._handlers.set(provider, new Map());
    const pMap = this._handlers.get(provider);
    if (!pMap.has(eventType)) pMap.set(eventType, []);
    pMap.get(eventType).push(handler);
    return this;
  }

  /**
   * Register middleware that runs before all handlers.
   * @param {(ctx: { provider, event, raw }) => void|Promise<void>} fn
   */
  use(fn) {
    this._middleware.push(fn);
    return this;
  }

  /**
   * Route an incoming webhook request.
   *
   * @param {'stripe'|'github'|'clerk'|'resend'|'sendgrid'|'twilio'} provider
   * @param {{ payload: Buffer|string, headers: object, secret?: string, [key: string]: any }} opts
   * @returns {Promise<{ verified: boolean, event: object, dispatched: number }>}
   */
  async route(provider, { payload, headers = {}, secret, ...extra } = {}) {
    // Verify signature
    const providerLower = provider.toLowerCase();
    let verifyParams;

    switch (providerLower) {
      case 'stripe':
        verifyParams = { payload, signature: headers['stripe-signature'], secret };
        break;
      case 'github':
        verifyParams = { payload, signature: headers['x-hub-signature-256'], secret };
        break;
      case 'clerk':
        verifyParams = { payload, headers, secret };
        break;
      case 'resend':
        verifyParams = { payload, headers, secret };
        break;
      case 'twilio':
        verifyParams = { url: extra.url, params: extra.params || {}, signature: headers['x-twilio-signature'], authToken: secret };
        break;
      default:
        verifyParams = { payload, signature: headers['x-signature'] || headers['x-webhook-signature'], secret };
    }

    let verified = false;
    let event = null;

    try {
      const result = verifyWebhook(providerLower, verifyParams);
      verified = typeof result === 'boolean' ? result : result.valid;
      event = typeof result === 'object' && result.event ? result.event : null;
    } catch (verifyErr) {
      logger.warn(`[webhooks] Signature verification failed for ${provider}: ${verifyErr.message}`);
      throw new Error(`Webhook signature verification failed: ${verifyErr.message}`);
    }

    if (!verified) {
      throw new Error(`Invalid webhook signature for provider "${provider}"`);
    }

    // Parse payload if not already an object
    if (!event) {
      try {
        const raw = Buffer.isBuffer(payload) ? payload.toString('utf8') : payload;
        event = JSON.parse(raw);
      } catch {
        event = {};
      }
    }

    // Run middleware
    const ctx = { provider, event, raw: payload };
    for (const mw of this._middleware) {
      await mw(ctx);
    }

    // Dispatch handlers
    let dispatched = 0;
    const pHandlers = this._handlers.get(providerLower);
    if (pHandlers) {
      const eventType = event.type || event.event || event.eventType || 'unknown';

      // Specific handlers
      const specific = pHandlers.get(eventType) || [];
      // Wildcard handlers
      const wildcard = pHandlers.get('*') || [];

      for (const handler of [...specific, ...wildcard]) {
        try {
          await handler(event, payload);
          dispatched++;
        } catch (handlerErr) {
          logger.error(`[webhooks] Handler for ${provider}/${eventType} threw: ${handlerErr.message}`);
        }
      }
    }

    return { verified, event, dispatched };
  }

  /**
   * Remove all handlers for a provider (or a specific event type).
   */
  off(provider, eventType) {
    const pMap = this._handlers.get(provider.toLowerCase());
    if (!pMap) return this;
    if (eventType) pMap.delete(eventType);
    else this._handlers.delete(provider.toLowerCase());
    return this;
  }

  /**
   * List all registered providers and event types.
   */
  list() {
    const result = {};
    for (const [p, evMap] of this._handlers) {
      result[p] = [...evMap.keys()];
    }
    return result;
  }
}
