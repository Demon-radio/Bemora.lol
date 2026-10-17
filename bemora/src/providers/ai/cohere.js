/**
 * Cohere AI provider — chat(), stream(), embed(), rerank().
 */

import { httpClient } from '../../core/http.js';
import { wrapProviderError, ConfigurationError } from '../../core/errors.js';

const BASE = 'https://api.cohere.ai/v1';

function client(apiKey) {
  return httpClient({ timeout: 60_000, headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' } });
}

/**
 * Chat with Cohere.
 * @param {{ message: string, chatHistory?: Array<{role, message}>, model?: string, temperature?: number, maxTokens?: number, signal?: AbortSignal }} params
 * @param {string} apiKey
 */
export async function chat({ message, chatHistory = [], model = 'command-r', temperature = 0.7, maxTokens = 1024, signal } = {}, apiKey) {
  if (!apiKey) throw new ConfigurationError('[cohere] Missing apiKey', { provider: 'cohere' });
  try {
    const { data } = await client(apiKey).post(`${BASE}/chat`, {
      model, message, chat_history: chatHistory, temperature, max_tokens: maxTokens,
    }, { signal });
    return {
      content: data.text,
      model: data.model ?? model,
      tokens: { input: data.meta?.tokens?.input_tokens, output: data.meta?.tokens?.output_tokens },
      provider: 'cohere',
      finishReason: data.finish_reason,
    };
  } catch (err) {
    throw wrapProviderError(err, 'cohere');
  }
}

/**
 * Streaming chat — yields text deltas.
 * @param {{ message: string, chatHistory?: Array<{role, message}>, model?: string, temperature?: number, signal?: AbortSignal }} params
 * @yields {{ content: string, done: boolean }}
 */
export async function* stream({ message, chatHistory = [], model = 'command-r', temperature = 0.7, signal } = {}, apiKey) {
  if (!apiKey) throw new ConfigurationError('[cohere] Missing apiKey', { provider: 'cohere' });
  try {
    const response = await client(apiKey).post(`${BASE}/chat`, {
      model, message, chat_history: chatHistory, temperature, stream: true,
    }, { responseType: 'stream', signal });

    let buffer = '';
    for await (const chunk of response.data) {
      buffer += chunk.toString('utf8');
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const parsed = JSON.parse(line);
          if (parsed.event_type === 'text-generation' && parsed.text) {
            yield { content: parsed.text, done: false };
          } else if (parsed.event_type === 'stream-end') {
            yield { content: '', done: true };
            return;
          }
        } catch {}
      }
    }
    yield { content: '', done: true };
  } catch (err) {
    throw wrapProviderError(err, 'cohere');
  }
}

/**
 * Generate embeddings.
 * @param {{ texts: string[], model?: string, inputType?: string, signal?: AbortSignal }} params
 */
export async function embed({ texts, model = 'embed-english-v3.0', inputType = 'search_document', signal } = {}, apiKey) {
  if (!apiKey) throw new ConfigurationError('[cohere] Missing apiKey', { provider: 'cohere' });
  try {
    const { data } = await client(apiKey).post(`${BASE}/embed`, {
      texts, model, input_type: inputType, embedding_types: ['float'],
    }, { signal });
    return {
      embeddings: data.embeddings?.float ?? data.embeddings,
      model: data.model,
      tokens: data.meta?.tokens,
    };
  } catch (err) {
    throw wrapProviderError(err, 'cohere');
  }
}

/**
 * Rerank documents by relevance to a query.
 */
export async function rerank({ query, documents, model = 'rerank-english-v3.0', topN, signal } = {}, apiKey) {
  if (!apiKey) throw new ConfigurationError('[cohere] Missing apiKey', { provider: 'cohere' });
  try {
    const { data } = await client(apiKey).post(`${BASE}/rerank`, {
      query, documents, model, ...(topN && { top_n: topN }),
    }, { signal });
    return { results: data.results, tokens: data.meta?.tokens };
  } catch (err) {
    throw wrapProviderError(err, 'cohere');
  }
}
