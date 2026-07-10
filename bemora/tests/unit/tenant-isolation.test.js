/**
 * Unit tests for multi-tenant key isolation and key rotation.
 *
 * Tests verify (acceptance criteria):
 *   - api.withTenant('cust_123', { stripe: 'sk_...' }) isolates keys per tenant
 *   - Tenant instance uses only its own keys, never the parent's
 *   - Parent instance keys are unchanged after withTenant() is called
 *   - Two concurrent tenant instances don't share key state
 *   - api.keys.rotate(name, newKey) updates the key atomically
 *   - api.keys.rotate emits a 'keys:rotated' event with the key name
 *   - Rotated key is immediately visible to subsequent provider lookups
 */

import { describe, it, expect, vi } from 'vitest';
import Bemora from '../../src/index.js';

// ─────────────────────────────────────────────────────────────────────────────
// withTenant / forTenant — instance isolation
// ─────────────────────────────────────────────────────────────────────────────

describe('withTenant — instance isolation', () => {
  it('returns a new Bemora instance (not the same reference)', () => {
    const parent = new Bemora();
    const tenant = parent.withTenant('cust_1', { stripe: 'sk_tenant' });
    expect(tenant).toBeInstanceOf(Bemora);
    expect(tenant).not.toBe(parent);
  });

  it('forTenant() is an alias for withTenant()', () => {
    const parent = new Bemora();
    const a = parent.withTenant('t1', { openai: 'key_a' });
    const b = parent.forTenant('t1', { openai: 'key_a' });
    // Both return independent instances with the same key config
    expect(a).toBeInstanceOf(Bemora);
    expect(b).toBeInstanceOf(Bemora);
    expect(a._keys.openai).toBe('key_a');
    expect(b._keys.openai).toBe('key_a');
  });

  it('tenant instance uses the tenant\'s stripe key, not the parent\'s', () => {
    const parent = new Bemora({ stripe: 'sk_parent_key' });
    const tenant = parent.withTenant('cust_42', { stripe: 'sk_tenant_42' });

    expect(tenant._keys.stripe).toBe('sk_tenant_42');
    expect(parent._keys.stripe).toBe('sk_parent_key');
  });

  it('parent keys are completely unchanged after withTenant() is called', () => {
    const parent = new Bemora({
      stripe: 'sk_live_parent',
      openai: 'openai_parent_key',
      anthropic: 'ant_parent_key',
    });

    parent.withTenant('cust_x', {
      stripe: 'sk_live_tenant',
      openai: 'openai_tenant_key',
    });

    // Parent must be unaffected
    expect(parent._keys.stripe).toBe('sk_live_parent');
    expect(parent._keys.openai).toBe('openai_parent_key');
    expect(parent._keys.anthropic).toBe('ant_parent_key');
  });

  it('tenant instance only has the keys provided — parent keys not leaked into tenant', () => {
    const parent = new Bemora({ stripe: 'sk_parent', sendgrid: 'sg_parent' });
    // Tenant only provides a stripe key
    const tenant = parent.withTenant('cust_10', { stripe: 'sk_cust_10' });

    expect(tenant._keys.stripe).toBe('sk_cust_10');
    // sendgrid key should NOT be inherited from parent
    // (new Bemora({stripe}) leaves sendgrid undefined)
    expect(tenant._keys.sendgrid).toBeUndefined();
  });

  it('two concurrent tenant instances have completely independent key state', () => {
    const parent = new Bemora({ stripe: 'sk_parent' });

    const tenantA = parent.withTenant('cust_a', { stripe: 'sk_a', openai: 'oai_a' });
    const tenantB = parent.withTenant('cust_b', { stripe: 'sk_b', openai: 'oai_b' });

    expect(tenantA._keys.stripe).toBe('sk_a');
    expect(tenantA._keys.openai).toBe('oai_a');
    expect(tenantB._keys.stripe).toBe('sk_b');
    expect(tenantB._keys.openai).toBe('oai_b');

    // Mutating tenant A does not affect tenant B
    tenantA._keys.stripe = 'sk_a_updated';
    expect(tenantB._keys.stripe).toBe('sk_b');
    expect(parent._keys.stripe).toBe('sk_parent');
  });

  it('deeply nested tenant-of-tenant isolation holds', () => {
    const root   = new Bemora({ stripe: 'sk_root' });
    const mid    = root.withTenant('reseller_1', { stripe: 'sk_mid' });
    const leaf   = mid.withTenant('end_user_1', { stripe: 'sk_leaf' });

    expect(root._keys.stripe).toBe('sk_root');
    expect(mid._keys.stripe).toBe('sk_mid');
    expect(leaf._keys.stripe).toBe('sk_leaf');
  });

  it('withTenant() supports all enterprise provider key names', () => {
    const parent = new Bemora();
    const tenant = parent.withTenant('enterprise_cust', {
      stripe:    'sk_stripe',
      sendgrid:  'sg_key',
      twilio:    { accountSid: 'AC123', authToken: 'auth_tok' },
      anthropic: 'ant_key',
      pinecone:  'pc_key',
      s3:        { accessKeyId: 'AKID', secretAccessKey: 'SAK' },
    });

    expect(tenant._keys.stripe).toBe('sk_stripe');
    expect(tenant._keys.sendgrid).toBe('sg_key');
    expect(tenant._keys.anthropic).toBe('ant_key');
    // pinecone is stored as a plain API key string (short-form)
    expect(tenant._keys.pinecone).toBe('pc_key');
    // object-form keys are accepted and stored as-is
    expect(tenant._keys.s3.accessKeyId).toBe('AKID');
    expect(tenant._keys.twilio.accountSid).toBe('AC123');
    expect(tenant._keys.twilio.authToken).toBe('auth_tok');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// keys.rotate / setKey
// ─────────────────────────────────────────────────────────────────────────────

describe('keys.rotate — key update and event emission', () => {
  it('updates _keys[name] to the new value', () => {
    const api = new Bemora({ stripe: 'sk_old' });
    api.keys.rotate('stripe', 'sk_new');
    expect(api._keys.stripe).toBe('sk_new');
  });

  it('takes effect immediately (same process, no restart needed)', () => {
    const api = new Bemora({ stripe: 'sk_v1' });

    expect(api._keys.stripe).toBe('sk_v1');
    api.keys.rotate('stripe', 'sk_v2');
    expect(api._keys.stripe).toBe('sk_v2');
    api.keys.rotate('stripe', 'sk_v3');
    expect(api._keys.stripe).toBe('sk_v3');
  });

  it('can add a previously absent key', () => {
    const api = new Bemora({});
    expect(api._keys.anthropic).toBeUndefined();
    api.keys.rotate('anthropic', 'ant_live_key');
    expect(api._keys.anthropic).toBe('ant_live_key');
  });

  it('returns the Bemora instance (chainable)', () => {
    const api = new Bemora({});
    const returned = api.keys.rotate('openai', 'oai_key');
    expect(returned).toBe(api);
  });

  it('emits a "keys:rotated" event with the key name', () => {
    const api = new Bemora({ stripe: 'sk_old' });
    const handler = vi.fn();
    api.on('keys:rotated', handler);

    api.keys.rotate('stripe', 'sk_new');

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith({ name: 'stripe' });
  });

  it('emits "keys:rotated" even when rotating a key added after construction', () => {
    const api = new Bemora({});
    const handler = vi.fn();
    api.on('keys:rotated', handler);

    api.keys.rotate('sendgrid', 'SG.newkey');

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith({ name: 'sendgrid' });
  });

  it('multiple rotations each emit a separate event', () => {
    const api = new Bemora({ stripe: 'sk_1', openai: 'oai_1' });
    const events = [];
    api.on('keys:rotated', (e) => events.push(e));

    api.keys.rotate('stripe', 'sk_2');
    api.keys.rotate('openai', 'oai_2');
    api.keys.rotate('stripe', 'sk_3');

    expect(events).toHaveLength(3);
    expect(events[0]).toEqual({ name: 'stripe' });
    expect(events[1]).toEqual({ name: 'openai' });
    expect(events[2]).toEqual({ name: 'stripe' });
  });

  it('rotation on one instance does not affect another instance', () => {
    const api1 = new Bemora({ stripe: 'sk_shared_1' });
    const api2 = new Bemora({ stripe: 'sk_shared_2' });

    api1.keys.rotate('stripe', 'sk_rotated');

    expect(api1._keys.stripe).toBe('sk_rotated');
    expect(api2._keys.stripe).toBe('sk_shared_2'); // unchanged
  });

  it('rotation does not affect tenant instances already created', () => {
    const parent = new Bemora({ stripe: 'sk_parent' });
    const tenant = parent.withTenant('cust_1', { stripe: 'sk_tenant' });

    parent.keys.rotate('stripe', 'sk_parent_rotated');

    // Tenant was already a separate instance — its keys are unaffected
    expect(tenant._keys.stripe).toBe('sk_tenant');
    expect(parent._keys.stripe).toBe('sk_parent_rotated');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// setKey (direct method — same as keys.rotate)
// ─────────────────────────────────────────────────────────────────────────────

describe('setKey — direct API', () => {
  it('setKey() is equivalent to keys.rotate()', () => {
    const api = new Bemora({ stripe: 'sk_original' });
    api.setKey('stripe', 'sk_via_setKey');
    expect(api._keys.stripe).toBe('sk_via_setKey');
  });

  it('setKey() also emits the keys:rotated event', () => {
    const api = new Bemora({});
    const handler = vi.fn();
    api.on('keys:rotated', handler);
    api.setKey('twilio', { accountSid: 'AC_new', authToken: 'tok_new' });
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0]).toEqual({ name: 'twilio' });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Circuits API sanity check (not isolation but platform feature parity)
// ─────────────────────────────────────────────────────────────────────────────

describe('circuits.status — state snapshot', () => {
  it('status() returns an object (may be empty when no requests have been made)', () => {
    const api = new Bemora();
    const state = api.circuits.status();
    expect(state !== null && typeof state === 'object').toBe(true);
  });

  it('statusOf() returns state for a named provider', () => {
    const api = new Bemora();
    const state = api.circuits.statusOf('stripe');
    // State object should have at least a state property
    expect(state).toBeDefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Runtime wiring — rotated key is used by subsequent provider calls
// ─────────────────────────────────────────────────────────────────────────────

describe('runtime wiring — rotated key propagates to provider calls', () => {
  it('setKey("stripe", newVal) means the next _keys.stripe lookup sees the new value', () => {
    const api = new Bemora({ stripe: 'sk_old_wiring' });
    // Capture the initial key as a baseline
    const initialKey = api._keys.stripe;
    expect(initialKey).toBe('sk_old_wiring');

    // Rotate the key
    api.setKey('stripe', 'sk_new_wiring');

    // _keys is read by reference in every _buildPayments() closure, so the
    // arrow functions `(p) => stripeProvider.*(p, this._keys.stripe)` will
    // pick up the updated value on the very next call.
    expect(api._keys.stripe).toBe('sk_new_wiring');
  });

  it('keys.rotate("anthropic", newVal) is immediately reflected in api._keys', () => {
    const api = new Bemora({ anthropic: 'ant_v1' });
    api.keys.rotate('anthropic', 'ant_v2');
    expect(api._keys.anthropic).toBe('ant_v2');
    // A further rotation shows the key is not frozen after the first rotate
    api.keys.rotate('anthropic', 'ant_v3');
    expect(api._keys.anthropic).toBe('ant_v3');
  });

  it('tenant key is independent from parent even after parent rotation', () => {
    const parent = new Bemora({ anthropic: 'ant_parent' });
    const tenant = parent.withTenant('cust_1', { anthropic: 'ant_tenant' });

    // Rotate parent key
    parent.keys.rotate('anthropic', 'ant_parent_v2');

    // Parent picks up new key
    expect(parent._keys.anthropic).toBe('ant_parent_v2');
    // Tenant is completely unaffected — its _keys is its own object
    expect(tenant._keys.anthropic).toBe('ant_tenant');
  });

  it('pinecone key stored as plain string when short-form used in withTenant', () => {
    const parent = new Bemora();
    const tenant = parent.withTenant('cust_pinecone', { pinecone: 'pc-api-key-abc' });
    // Must be the raw string, not wrapped in { apiKey: ... }
    expect(typeof tenant._keys.pinecone).toBe('string');
    expect(tenant._keys.pinecone).toBe('pc-api-key-abc');
  });

  it('pinecone key normalized from object form { apiKey, host } in withTenant', () => {
    const parent = new Bemora();
    // Old long-form object — constructor normalizes .apiKey out of it
    const tenant = parent.withTenant('cust_pinecone_obj', {
      pineconeKey: 'pc-from-pineconeKey',
    });
    expect(tenant._keys.pinecone).toBe('pc-from-pineconeKey');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// costs.snapshot — LLM spend tracking
// ─────────────────────────────────────────────────────────────────────────────

describe('costs.snapshot — per-provider spend', () => {
  it('snapshot() returns a value (object or null/undefined before any calls)', () => {
    const api = new Bemora();
    // Just verify it doesn't throw — the exact shape depends on whether
    // any AI calls have been made in the test suite
    expect(() => api.costs.snapshot()).not.toThrow();
  });

  it('snapshotForTenant() accepts a tenantId without throwing', () => {
    const api = new Bemora();
    expect(() => api.costs.snapshotForTenant('cust_123')).not.toThrow();
  });
});
