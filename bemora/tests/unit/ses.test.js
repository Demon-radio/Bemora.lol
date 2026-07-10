import { describe, it, expect, vi, beforeEach } from 'vitest';
import { send } from '../../src/providers/email/ses.js';
import { ConfigurationError, BemoraError } from '../../src/core/errors.js';

vi.mock('../../src/core/http.js', () => ({
  httpClient: vi.fn(),
  setTracingHeadersProvider: vi.fn(),
}));
vi.mock('../../src/core/signing/awsSigV4.js', () => ({
  signAwsRequest: vi.fn().mockResolvedValue({ 'X-Amz-Date': '20250101T000000Z', Authorization: 'AWS4-HMAC-SHA256 ...' }),
}));

import { httpClient } from '../../src/core/http.js';

const CREDS = { accessKeyId: 'AKIA_FAKE', secretAccessKey: 'fake_secret', region: 'us-east-1' };

function makeHttp(data = { MessageId: 'msg_001' }) {
  return { post: vi.fn().mockResolvedValue({ data }) };
}

describe('ses — ConfigurationError on missing credentials', () => {
  it('throws ConfigurationError when accessKeyId is missing', async () => {
    await expect(send({ to: 'u@e.com', from: 'f@e.com', subject: 'S', text: 'T' }, {})).rejects.toBeInstanceOf(ConfigurationError);
  });
});

describe('ses — send()', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns messageId on success', async () => {
    httpClient.mockReturnValue(makeHttp({ MessageId: 'ses_msg_001' }));
    const result = await send({ to: 'user@example.com', from: 'sender@example.com', subject: 'Hello', text: 'World' }, CREDS);
    expect(result).toMatchObject({ messageId: 'ses_msg_001', success: true });
  });

  it('sends to array of recipients', async () => {
    const mockHttp = makeHttp({ MessageId: 'ses_msg_002' });
    httpClient.mockReturnValue(mockHttp);
    const result = await send({ to: ['a@b.com', 'c@d.com'], from: 'f@e.com', subject: 'S', text: 'T' }, CREDS);
    expect(result.success).toBe(true);
  });

  it('wraps upstream errors as BemoraError', async () => {
    httpClient.mockReturnValue({
      post: vi.fn().mockRejectedValue(Object.assign(new Error('Forbidden'), { response: { status: 403, data: { message: 'Access denied' } } })),
    });
    await expect(send({ to: 'u@e.com', from: 'f@e.com', subject: 'S', text: 'T' }, CREDS)).rejects.toBeInstanceOf(BemoraError);
  });
});
