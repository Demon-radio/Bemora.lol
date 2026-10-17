/**
 * Together AI provider — chat(), stream(), embed().
 * Access 50+ open-source models via OpenAI-compatible API.
 */

import { httpClient } from '../../core/http.js';
import { wrapProviderError, ConfigurationError } from '../../core/errors.js';

const BASE = 'https://api.together.xyz/v1';

function client(apiKey) {
  return httpClient({ timeout: 60_000, headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' } });
}

/**
 * Chat completion (OpenAI-compatible).
 * @param {{ messages: Array<{role,content}>, model?: string, temperature?: number, maxTokens?: number, signal?: AbortSignal }} params
 */
export async function chat({ messages, model = 'meta-llama/Llama-3-70b-chat-hf', temperature = 0.7, maxTokens = 1024, signal } = {}, apiKey) {
  if (!apiKey) throw new ConfigurationError('[together] Missing apiKey', { provider: 'together' });
  try {
    const { data } = await client(apiKey).post(`${BASE}/chat/completions`, {
      model, messages, temperature, max_tokens: maxTokens,
    }, { signal });
    return {
      content: data.choices[0].message.content,
      model: data.model,
      tokens: data.usage,
      provider: 'together',
    };
  } catch (err) {
    throw wrapProviderError(err, 'together');
  }
}

/**
 * Streaming chat — yields text deltas.
 * @yields {{ content: string, done: boolean }}
 */
export async function* stream({ messages, model = 'meta-llama/Llama-3-70b-chat-hf', temperature = 0.7, signal } = {}, apiKey) {
  if (!apiKey) throw new ConfigurationError('[together] Missing apiKey', { provider: 'together' });
  try {
    const response = await client(apiKey).post(`${BASE}/chat/completions`, {
      model, messages, temperature, stream: true,
    }, { responseType: 'stream', signal });

    let buffer = '';
    for await (const chunk of response.data) {
      buffer += chunk.toString('utf8');
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        if (!line.startsWith('data:')) continue;
        const payload = line.slice(5).trim();
        if (payload === '[DONE]') { yield { content: '', done: true }; return; }
        try {
          const parsed = JSON.parse(payload);
          const delta = parsed.choices?.[0]?.delta?.content;
          if (delta) yield { content: delta, done: false };
        } catch {}
      }
    }
    yield { content: '', done: true };
  } catch (err) {
    throw wrapProviderError(err, 'together');
  }
}

/**
 * Generate embeddings.
 */
export async function embed({ input, model = 'togethercomputer/m2-bert-80M-8k-retrieval', signal } = {}, apiKey) {
  if (!apiKey) throw new ConfigurationError('[together] Missing apiKey', { provider: 'together' });
  try {
    const { data } = await client(apiKey).post(`${BASE}/embeddings`, {
      model, input: Array.isArray(input) ? input : [input],
    }, { signal });
    return { embeddings: data.data.map((d) => d.embedding), model: data.model, tokens: data.usage };
  } catch (err) {
    throw wrapProviderError(err, 'together');
  }
}

/**
 * List available models.
 */
export async function listModels({ category, signal } = {}, apiKey) {
  if (!apiKey) throw new ConfigurationError('[together] Missing apiKey', { provider: 'together' });
  try {
    const { data } = await client(apiKey).get(`${BASE}/models`, { params: category ? { type: category } : {}, signal });
    return data;
  } catch (err) {
    throw wrapProviderError(err, 'together');
  }
}
