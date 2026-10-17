/**
 * Perplexity AI provider — chat() with real-time web search grounding, stream().
 * Uses the OpenAI-compatible API.
 */

import { httpClient } from '../../core/http.js';
import { wrapProviderError, ConfigurationError } from '../../core/errors.js';

const BASE = 'https://api.perplexity.ai';

function client(apiKey) {
  return httpClient({ timeout: 60_000, headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' } });
}

/**
 * Chat with real-time web search grounding.
 * @param {{ messages: Array<{role,content}>, model?: string, temperature?: number, maxTokens?: number, signal?: AbortSignal }} params
 */
export async function chat({ messages, model = 'llama-3.1-sonar-small-128k-online', temperature = 0.2, maxTokens = 1024, signal } = {}, apiKey) {
  if (!apiKey) throw new ConfigurationError('[perplexity] Missing apiKey', { provider: 'perplexity' });
  try {
    const { data } = await client(apiKey).post(`${BASE}/chat/completions`, {
      model, messages, temperature, max_tokens: maxTokens,
    }, { signal });
    return {
      content: data.choices[0].message.content,
      model: data.model,
      tokens: data.usage,
      provider: 'perplexity',
      citations: data.citations,
      finishReason: data.choices[0].finish_reason,
    };
  } catch (err) {
    throw wrapProviderError(err, 'perplexity');
  }
}

/**
 * Streaming chat — yields text deltas.
 * @yields {{ content: string, done: boolean, citations?: string[] }}
 */
export async function* stream({ messages, model = 'llama-3.1-sonar-small-128k-online', temperature = 0.2, signal } = {}, apiKey) {
  if (!apiKey) throw new ConfigurationError('[perplexity] Missing apiKey', { provider: 'perplexity' });
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
          if (delta) yield { content: delta, done: false, citations: parsed.citations };
        } catch {}
      }
    }
    yield { content: '', done: true };
  } catch (err) {
    throw wrapProviderError(err, 'perplexity');
  }
}
