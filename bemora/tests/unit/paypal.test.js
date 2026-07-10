import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createOrder, captureOrder, refundCapture } from '../../src/providers/payments/paypal.js';
import { ConfigurationError } from '../../src/core/errors.js';

vi.mock('../../src/core/http.js', () => ({
  httpClient: vi.fn(),
  setTracingHeadersProvider: vi.fn(),
}));

import { httpClient } from '../../src/core/http.js';

const CREDS = { clientId: 'client_id', clientSecret: 'client_secret', sandbox: true };

function makeHttp(postData = {}, getData = {}) {
  return {
    post: vi.fn().mockResolvedValue({ data: { access_token: 'tok', expires_in: 3600, ...postData } }),
    get:  vi.fn().mockResolvedValue({ data: getData }),
  };
}

describe('paypal — createOrder', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns order data', async () => {
    const mockHttp = makeHttp({ id: 'ORDER_1', status: 'CREATED' });
    httpClient.mockReturnValue(mockHttp);
    const result = await createOrder({ amount: 10.00, currency: 'USD' }, CREDS);
    // Expect something that reflects an order was made
    expect(result).toBeDefined();
  });

  it('wraps errors as BemoraError', async () => {
    // Use distinct clientId so the token cache does not bleed from the first test.
    const freshCreds = { clientId: 'fresh_id', clientSecret: 'fresh_secret', sandbox: true };
    const http = {
      post: vi.fn()
        // first call = token fetch
        .mockResolvedValueOnce({ data: { access_token: 'tok2', expires_in: 3600 } })
        // second call = order creation → fail
        .mockRejectedValueOnce(Object.assign(new Error('Bad Request'), { response: { status: 400, data: { message: 'Bad amount' } } })),
    };
    httpClient.mockReturnValue(http);
    const { BemoraError } = await import('../../src/core/errors.js');
    await expect(createOrder({ amount: -1, currency: 'USD' }, freshCreds)).rejects.toBeInstanceOf(BemoraError);
  });
});

describe('paypal — captureOrder', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns capture data', async () => {
    const mockHttp = makeHttp({ id: 'ORDER_1', status: 'COMPLETED' });
    httpClient.mockReturnValue(mockHttp);
    const result = await captureOrder({ id: 'ORDER_1' }, CREDS);
    expect(result).toBeDefined();
  });
});

describe('paypal — refundCapture', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns refund data', async () => {
    const mockHttp = makeHttp({ id: 'REFUND_1', status: 'COMPLETED' });
    httpClient.mockReturnValue(mockHttp);
    const result = await refundCapture({ captureId: 'CAP_1', amount: 5.00 }, CREDS);
    expect(result).toBeDefined();
  });
});
