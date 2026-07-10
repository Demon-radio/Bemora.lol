import { describe, it, expect, vi, beforeEach } from 'vitest';
import { chat, embed } from '../../src/providers/ai/cohere.js';
import { ConfigurationError, BemoraError } from '../../src/core/errors.js';

vi.mock('../../src/core/http.js', () => ({
  httpClient: vi.fn(),
  setTracingHeadersProvider: vi.fn(),
}));

import { httpClient } from '../../src/core/http.js';

const API_KEY = 'cohere_test_key';

function makeChatHttp(data = {}) {
  return { post: vi.fn().mockResolvedValue({ data }) };
}

describe('cohere — ConfigurationError on missing apiKey', () => {
  it('chat() throws ConfigurationError', async () => {
    await expect(chat({ message: 'Hello' }, undefined)).rejects.toBeInstanceOf(ConfigurationError);
  });
});

describe('cohere — chat()', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns normalized response shape', async () => {
    httpClient.mockReturnValue(makeChatHttp({
      text: 'Hello there!',
      model: 'command-r',
      finish_reason: 'COMPLETE',
      meta: { tokens: { input_tokens: 10, output_tokens: 5 } },
    }));
    const result = await chat({ message: 'Hello' }, API_KEY);
    expect(result).toMatchObject({
      content: 'Hello there!',
      model: 'command-r',
      provider: 'cohere',
      finishReason: 'COMPLETE',
    });
    expect(result.tokens).toMatchObject({ input: 10, output: 5 });
  });

  it('wraps upstream 429 as RateLimitError', async () => {
    httpClient.mockReturnValue({
      post: vi.fn().mockRejectedValue(Object.assign(new Error('Too Many Requests'), {
        response: { status: 429, data: { message: 'Rate limited' }, headers: { 'retry-after': '30' } },
      })),
    });
    const { RateLimitError } = await import('../../src/core/errors.js');
    await expect(chat({ message: 'Hello' }, API_KEY)).rejects.toBeInstanceOf(RateLimitError);
  });
});

describe('cohere — embed()', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns embedding vectors', async () => {
    // Cohere returns embeddings under the 'float' key when embedding_types=['float']
    httpClient.mockReturnValue(makeChatHttp({
      embeddings: { float: [[0.1, 0.2, 0.3]] },
      model: 'embed-english-v3.0',
    }));
    const { embed } = await import('../../src/providers/ai/cohere.js');
    const result = await embed({ texts: ['hello world'] }, API_KEY);
    expect(Array.isArray(result.embeddings)).toBe(true);
    expect(result.embeddings[0]).toEqual([0.1, 0.2, 0.3]);
  });
});
