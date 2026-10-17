/**
 * Google Gemini AI provider — generateContent(), stream(), embed().
 * Standalone module (also available via api.ai.geminiChat).
 */

import { httpClient } from '../../core/http.js';
import { wrapProviderError, ConfigurationError } from '../../core/errors.js';

const BASE = 'https://generativelanguage.googleapis.com/v1beta';

function client() {
  return httpClient({ timeout: 60_000, headers: { 'Content-Type': 'application/json' } });
}

function toContents(messages) {
  return messages.map((msg) => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content) }],
  }));
}

/**
 * Generate content (chat completion).
 * @param {{ messages: Array<{role,content}>, model?: string, temperature?: number, maxOutputTokens?: number, signal?: AbortSignal }} params
 * @param {string} apiKey
 */
export async function generateContent({ messages, model = 'gemini-1.5-flash', temperature = 0.7, maxOutputTokens, signal } = {}, apiKey) {
  if (!apiKey) throw new ConfigurationError('[gemini] Missing apiKey', { provider: 'gemini' });
  try {
    const { data } = await client().post(
      `${BASE}/models/${model}:generateContent?key=${apiKey}`,
      {
        contents: toContents(messages),
        generationConfig: { temperature, ...(maxOutputTokens && { maxOutputTokens }) },
      },
      { signal }
    );
    const candidate = data.candidates?.[0];
    return {
      content: candidate?.content?.parts?.[0]?.text ?? '',
      model,
      tokens: {
        input: data.usageMetadata?.promptTokenCount ?? 0,
        output: data.usageMetadata?.candidatesTokenCount ?? 0,
      },
      provider: 'google',
      finishReason: candidate?.finishReason,
    };
  } catch (err) {
    throw wrapProviderError(err, 'gemini');
  }
}

/**
 * Streaming content — yields text deltas.
 * @yields {{ content: string, done: boolean }}
 */
export async function* stream({ messages, model = 'gemini-1.5-flash', temperature = 0.7, signal } = {}, apiKey) {
  if (!apiKey) throw new ConfigurationError('[gemini] Missing apiKey', { provider: 'gemini' });
  try {
    const response = await client().post(
      `${BASE}/models/${model}:streamGenerateContent?key=${apiKey}&alt=sse`,
      { contents: toContents(messages), generationConfig: { temperature } },
      { responseType: 'stream', signal }
    );

    let buffer = '';
    for await (const chunk of response.data) {
      buffer += chunk.toString('utf8');
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        if (!line.startsWith('data:')) continue;
        const payload = line.slice(5).trim();
        try {
          const parsed = JSON.parse(payload);
          const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) yield { content: text, done: false };
          if (parsed.candidates?.[0]?.finishReason) {
            yield { content: '', done: true };
            return;
          }
        } catch {}
      }
    }
    yield { content: '', done: true };
  } catch (err) {
    throw wrapProviderError(err, 'gemini');
  }
}

/**
 * Generate text embeddings.
 */
export async function embed({ content, model = 'text-embedding-004', taskType = 'RETRIEVAL_DOCUMENT', signal } = {}, apiKey) {
  if (!apiKey) throw new ConfigurationError('[gemini] Missing apiKey', { provider: 'gemini' });
  try {
    const texts = Array.isArray(content) ? content : [content];
    const requests = texts.map((text) => ({ model: `models/${model}`, content: { parts: [{ text }] }, taskType }));
    const { data } = await client().post(
      `${BASE}/models/${model}:batchEmbedContents?key=${apiKey}`,
      { requests },
      { signal }
    );
    return { embeddings: data.embeddings.map((e) => e.values), model };
  } catch (err) {
    throw wrapProviderError(err, 'gemini');
  }
}
