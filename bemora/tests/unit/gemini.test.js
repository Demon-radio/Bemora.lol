import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateContent } from '../../src/providers/ai/gemini.js';
import { ConfigurationError } from '../../src/core/errors.js';

vi.mock('../../src/core/http.js', () => ({
  httpClient: vi.fn(),
  setTracingHeadersProvider: vi.fn(),
}));

import { httpClient } from '../../src/core/http.js';

const API_KEY = 'gemini_test_key';

const FAKE_RESPONSE = {
  candidates: [{
    content: { parts: [{ text: 'Sure, here you go!' }] },
    finishReason: 'STOP',
  }],
  usageMetadata: { promptTokenCount: 8, candidatesTokenCount: 5 },
};

function makeHttp(data = FAKE_RESPONSE) {
  return { post: vi.fn().mockResolvedValue({ data }) };
}

describe('gemini — ConfigurationError on missing apiKey', () => {
  it('generateContent() throws ConfigurationError', async () => {
    await expect(generateContent({ messages: [{ role: 'user', content: 'hi' }] }, undefined)).rejects.toBeInstanceOf(ConfigurationError);
  });
});

describe('gemini — generateContent()', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns normalized response shape', async () => {
    httpClient.mockReturnValue(makeHttp());
    const result = await generateContent({ messages: [{ role: 'user', content: 'Hi' }] }, API_KEY);
    expect(result).toMatchObject({
      content: 'Sure, here you go!',
      provider: 'google',
    });
    expect(typeof result.content).toBe('string');
  });

  it('appends ?key=apiKey to the request URL', async () => {
    const mockHttp = makeHttp();
    httpClient.mockReturnValue(mockHttp);
    await generateContent({ messages: [{ role: 'user', content: 'hi' }] }, API_KEY);
    const [url] = mockHttp.post.mock.calls[0];
    expect(url).toContain(`key=${API_KEY}`);
  });

  it('wraps network errors as BemoraError', async () => {
    httpClient.mockReturnValue({
      post: vi.fn().mockRejectedValue(Object.assign(new Error('ECONNRESET'), { response: { status: 503, data: {} } })),
    });
    const { BemoraError } = await import('../../src/core/errors.js');
    await expect(generateContent({ messages: [{ role: 'user', content: 'hi' }] }, API_KEY)).rejects.toBeInstanceOf(BemoraError);
  });
});
