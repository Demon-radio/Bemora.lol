/**
 * Mistral AI provider — chat(), stream(), embed().
 */

import { httpClient } from '../../core/http.js';
import { wrapProviderError, ConfigurationError } from '../../core/errors.js';

const BASE = 'https://api.mistral.ai/v1';

function client(apiKey) {
  return httpClient({ timeout: 60_000, headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' } });
}

/**
 * Chat completion.
 * @param {{ messages: Array<{role,content}>, model?: string, temperature?: number, maxTokens?: number, signal?: AbortSignal }} params
 */
export async function chat({ messages, model = 'mistral-small-latest', temperature = 0.7, maxTokens, signal } = {}, apiKey) {
  if (!apiKey) throw new ConfigurationError('[mistral] Missing apiKey', { provider: 'mistral' });
  try {
    const { data } = await client(apiKey).post(`${BASE}/chat/completions`, {
      model, messages, temperature, ...(maxTokens && { max_tokens: maxTokens }),
    }, { signal });
    return {
      content: data.choices[0].message.content,
      model: data.model,
      tokens: data.usage,
      provider: 'mistral',
      finishReason: data.choices[0].finish_reason,
    };
  } catch (err) {
    throw wrapProviderError(err, 'mistral');
  }
}

/**
 * Streaming chat — yields text deltas.
 * @yields {{ content: string, done: boolean }}
 */
export async function* stream({ messages, model = 'mistral-small-latest', temperature = 0.7, signal } = {}, apiKey) {
  if (!apiKey) throw new ConfigurationError('[mistral] Missing apiKey', { provider: 'mistral' });
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
    throw wrapProviderError(err, 'mistral');
  }
}

/**
 * Generate embeddings.
 */
export async function embed({ input, model = 'mistral-embed', signal } = {}, apiKey) {
  if (!apiKey) throw new ConfigurationError('[mistral] Missing apiKey', { provider: 'mistral' });
  try {
    const inputs = Array.isArray(input) ? input : [input];
    const { data } = await client(apiKey).post(`${BASE}/embeddings`, { model, inputs }, { signal });
    return { embeddings: data.data.map((d) => d.embedding), model: data.model, tokens: data.usage };
  } catch (err) {
    throw wrapProviderError(err, 'mistral');
  }
}

/**
 * List available models.
 */
export async function listModels({ signal } = {}, apiKey) {
  if (!apiKey) throw new ConfigurationError('[mistral] Missing apiKey', { provider: 'mistral' });
  try {
    const { data } = await client(apiKey).get(`${BASE}/models`, { signal });
    return data.data;
  } catch (err) {
    throw wrapProviderError(err, 'mistral');
  }
}
