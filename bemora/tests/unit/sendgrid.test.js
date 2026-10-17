import { describe, it, expect, vi, beforeEach } from 'vitest';
import { send, batch } from '../../src/providers/email/sendgrid.js';
import { BemoraError } from '../../src/core/errors.js';

vi.mock('../../src/core/http.js', () => ({
  httpClient: vi.fn(),
  setTracingHeadersProvider: vi.fn(),
}));
vi.mock('../../src/providers/webhooks/verify.js', () => ({
  verifySendGridWebhook: vi.fn(() => ({ valid: true })),
}));

import { httpClient } from '../../src/core/http.js';

const API_KEY = 'SG.test_key';

function makeHttp(statusCode = 202) {
  return { post: vi.fn().mockResolvedValue({ data: {}, status: statusCode }) };
}

describe('sendgrid — send()', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns { success: true } on 202', async () => {
    httpClient.mockReturnValue(makeHttp(202));
    const result = await send({ to: 'user@example.com', from: 'sender@example.com', subject: 'Hi', text: 'Hello' }, API_KEY);
    expect(result.success).toBe(true);
  });

  it('sends to multiple recipients', async () => {
    const mockHttp = makeHttp(202);
    httpClient.mockReturnValue(mockHttp);
    await send({ to: ['a@b.com', 'c@d.com'], from: 'sender@example.com', subject: 'Multi', text: 'Hi' }, API_KEY);
    const body = mockHttp.post.mock.calls[0][1];
    // Personalizations should have both recipients
    expect(JSON.stringify(body)).toContain('a@b.com');
  });

  it('wraps 400 errors as BemoraError', async () => {
    httpClient.mockReturnValue({
      post: vi.fn().mockRejectedValue(Object.assign(new Error('Bad Request'), { response: { status: 400, data: { message: 'Bad request' } } })),
    });
    await expect(send({ to: 'u@e.com', from: 'f@e.com', subject: 'S', text: 'T' }, API_KEY)).rejects.toBeInstanceOf(BemoraError);
  });
});

describe('sendgrid — batch()', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns { success: true } for a batch send', async () => {
    httpClient.mockReturnValue(makeHttp(202));
    const result = await batch({
      messages: [{ to: 'a@b.com' }, { to: 'c@d.com' }],
      from: 'sender@example.com',
      templateId: 'd-template123',
    }, API_KEY);
    expect(result.success).toBe(true);
  });
});
