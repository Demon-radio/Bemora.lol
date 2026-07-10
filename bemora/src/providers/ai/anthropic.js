/**
 * Anthropic Claude provider — messages(), stream().
 * Standalone module for direct use (also available via api.ai.anthropicChat).
 */

import { httpClient } from '../../core/http.js';
import { wrapProviderError, ConfigurationError } from '../../core/errors.js';

const BASE = 'https://api.anthropic.com/v1';
const DEFAULT_VERSION = '2023-06-01';

function client(apiKey) {
  return httpClient({
    timeout: 120_000,
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': DEFAULT_VERSION,
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Send messages to Claude.
 * @param {{ messages: Array<{role,content}>, model?: string, maxTokens?: number, temperature?: number, system?: string, signal?: AbortSignal }} params
 * @param {string} apiKey
 */
export async function messages({ messages: msgs, model = 'claude-3-5-sonnet-20241022', maxTokens = 1024, temperature = 0.7, system, signal } = {}, apiKey) {
  if (!apiKey) throw new ConfigurationError('[anthropic] Missing apiKey', { provider: 'anthropic' });
  try {
    const { data } = await client(apiKey).post(`${BASE}/messages`, {
      model, messages: msgs, max_tokens: maxTokens, temperature,
      ...(system && { system }),
    }, { signal });
    return {
      content: data.content[0].text,
      model: data.model,
      tokens: { input: data.usage.input_tokens, output: data.usage.output_tokens },
      provider: 'anthropic',
      stopReason: data.stop_reason,
    };
  } catch (err) {
    throw wrapProviderError(err, 'anthropic');
  }
}

/**
 * Streaming messages — yields text deltas as async iterator.
 *
 * @example
 * for await (const chunk of api.anthropic.stream({ messages: [...] })) {
 *   process.stdout.write(chunk.content);
 * }
 *
 * @yields {{ content: string, done: boolean, inputTokens?: number, outputTokens?: number }}
 */
export async function* stream({ messages: msgs, model = 'claude-3-5-sonnet-20241022', maxTokens = 1024, temperature = 0.7, system, signal } = {}, apiKey) {
  if (!apiKey) throw new ConfigurationError('[anthropic] Missing apiKey', { provider: 'anthropic' });
  try {
    const response = await client(apiKey).post(`${BASE}/messages`, {
      model, messages: msgs, max_tokens: maxTokens, temperature, stream: true,
      ...(system && { system }),
    }, { responseType: 'stream', signal });

    let inputTokens, outputTokens;
    let buffer = '';
    for await (const chunk of response.data) {
      buffer += chunk.toString('utf8');
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (line.startsWith('event:')) continue;
        if (!line.startsWith('data:')) continue;
        const payload = line.slice(5).trim();
        try {
          const evt = JSON.parse(payload);
          if (evt.type === 'content_block_delta' && evt.delta?.text) {
            yield { content: evt.delta.text, done: false };
          } else if (evt.type === 'message_start') {
            inputTokens = evt.message?.usage?.input_tokens;
          } else if (evt.type === 'message_delta') {
            outputTokens = evt.usage?.output_tokens;
          } else if (evt.type === 'message_stop') {
            yield { content: '', done: true, inputTokens, outputTokens };
            return;
          }
        } catch {}
      }
    }
    yield { content: '', done: true };
  } catch (err) {
    throw wrapProviderError(err, 'anthropic');
  }
}
