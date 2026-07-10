import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createCharge,
  createPaymentIntent,
  createCustomer,
  getCustomer,
  createSubscription,
  createRefund,
} from '../../src/providers/payments/stripe.js';
import { ConfigurationError } from '../../src/core/errors.js';

vi.mock('../../src/core/http.js', () => ({
  httpClient: vi.fn(),
  setTracingHeadersProvider: vi.fn(),
}));
vi.mock('../../src/providers/webhooks/verify.js', () => ({
  verifyStripeWebhook: vi.fn(() => ({ valid: true })),
}));

import { httpClient } from '../../src/core/http.js';

function makeHttp(data = {}) {
  const mock = { post: vi.fn().mockResolvedValue({ data }), get: vi.fn().mockResolvedValue({ data }), delete: vi.fn().mockResolvedValue({ data }) };
  return mock;
}

// ── ConfigurationError guard ──────────────────────────────────────────────────

describe('stripe — ConfigurationError on missing apiKey', () => {
  it('createCharge throws ConfigurationError when apiKey is missing', async () => {
    await expect(createCharge({ amount: 100, currency: 'usd' }, undefined)).rejects.toBeInstanceOf(ConfigurationError);
  });
  it('createPaymentIntent throws ConfigurationError when apiKey is missing', async () => {
    await expect(createPaymentIntent({ amount: 100, currency: 'usd' }, undefined)).rejects.toBeInstanceOf(ConfigurationError);
  });
  it('createCustomer throws ConfigurationError when apiKey is missing', async () => {
    await expect(createCustomer({ email: 'a@b.com' }, undefined)).rejects.toBeInstanceOf(ConfigurationError);
  });
  it('getCustomer throws ConfigurationError when apiKey is missing', async () => {
    await expect(getCustomer({ id: 'cus_1' }, undefined)).rejects.toBeInstanceOf(ConfigurationError);
  });
});

// ── createCharge ──────────────────────────────────────────────────────────────

describe('stripe — createCharge', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns data on success', async () => {
    httpClient.mockReturnValue(makeHttp({ id: 'ch_001', amount: 2000 }));
    const result = await createCharge({ amount: 2000, currency: 'usd', source: 'tok_visa' }, 'sk_test_key');
    expect(result.id).toBe('ch_001');
  });

  it('forwards Idempotency-Key header when idempotencyKey is provided', async () => {
    const mockHttp = makeHttp({ id: 'ch_idem' });
    httpClient.mockReturnValue(mockHttp);
    await createCharge({ amount: 2000, currency: 'usd', idempotencyKey: 'idem_abc' }, 'sk_test_key');
    const [, , config] = mockHttp.post.mock.calls[0];
    expect(config.headers['Idempotency-Key']).toBe('idem_abc');
  });

  it('does NOT set Idempotency-Key when not provided', async () => {
    const mockHttp = makeHttp({ id: 'ch_002' });
    httpClient.mockReturnValue(mockHttp);
    await createCharge({ amount: 500, currency: 'usd' }, 'sk_test_key');
    const [, , config] = mockHttp.post.mock.calls[0];
    expect(config.headers['Idempotency-Key']).toBeUndefined();
  });
});

// ── createPaymentIntent ───────────────────────────────────────────────────────

describe('stripe — createPaymentIntent', () => {
  beforeEach(() => vi.clearAllMocks());

  it('forwards idempotencyKey header', async () => {
    const mockHttp = makeHttp({ id: 'pi_001' });
    httpClient.mockReturnValue(mockHttp);
    await createPaymentIntent({ amount: 3000, currency: 'usd', idempotencyKey: 'pi_idem' }, 'sk_test_key');
    const [, , config] = mockHttp.post.mock.calls[0];
    expect(config.headers['Idempotency-Key']).toBe('pi_idem');
  });
});

// ── createRefund ──────────────────────────────────────────────────────────────

describe('stripe — createRefund', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns refund data', async () => {
    httpClient.mockReturnValue(makeHttp({ id: 're_001', amount: 500 }));
    const result = await createRefund({ chargeId: 'ch_001', amount: 500 }, 'sk_test_key');
    expect(result.id).toBe('re_001');
  });
});
