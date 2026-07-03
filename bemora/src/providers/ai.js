import axios from 'axios';

/**
 * AI provider — lightweight wrappers for LLM APIs.
 * Bemora gives you the same interface whether you use OpenAI, Groq, or Mistral.
 */

/**
 * Chat with OpenAI (GPT-4o, GPT-3.5, etc.)
 * @param {{ messages: Array<{role,content}>, model?: string, temperature?: number }} params
 * @param {string} apiKey — OpenAI API key
 */
export async function openaiChat({ messages, model = 'gpt-4o-mini', temperature = 0.7 }, apiKey) {
  const { data } = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    { model, messages, temperature },
    { headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' } }
  );
  return {
    content: data.choices[0].message.content,
    model: data.model,
    tokens: data.usage,
  };
}

/**
 * Generate an image with DALL-E 3
 * @param {{ prompt: string, size?: string, quality?: string }} params
 * @param {string} apiKey
 */
export async function generateImage({ prompt, size = '1024x1024', quality = 'standard' }, apiKey) {
  const { data } = await axios.post(
    'https://api.openai.com/v1/images/generations',
    { model: 'dall-e-3', prompt, size, quality, n: 1 },
    { headers: { Authorization: `Bearer ${apiKey}` } }
  );
  return { url: data.data[0].url, revised_prompt: data.data[0].revised_prompt };
}

/**
 * Groq ultra-fast inference (Llama 3, Mixtral — FREE tier available)
 * Free key: https://console.groq.com
 * @param {{ messages: Array<{role,content}>, model?: string }} params
 * @param {string} apiKey — Groq API key
 */
export async function groqChat({ messages, model = 'llama3-8b-8192', temperature = 0.7 }, apiKey) {
  const { data } = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    { model, messages, temperature },
    { headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' } }
  );
  return {
    content: data.choices[0].message.content,
    model: data.model,
    tokens: data.usage,
    provider: 'groq',
  };
}

/**
 * Smart chat router — tries Groq first (free/fast), falls back to OpenAI
 * @param {{ messages: Array<{role,content}>, model?: string }} params
 * @param {{ groqKey?: string, openaiKey?: string }} keys
 */
export async function smartChat({ messages, system }, { groqKey, openaiKey } = {}) {
  const msgs = system
    ? [{ role: 'system', content: system }, ...messages]
    : messages;

  if (groqKey) {
    try {
      return await groqChat({ messages: msgs }, groqKey);
    } catch (_) {}
  }

  if (openaiKey) {
    return await openaiChat({ messages: msgs }, openaiKey);
  }

  throw new Error(
    '[bemora] AI chat requires groqKey or openaiKey.\n' +
    '  → Free Groq key: https://console.groq.com\n' +
    '  → OpenAI key: https://platform.openai.com'
  );
}

/**
 * Embedding via OpenAI
 * @param {{ input: string|string[], model?: string }} params
 * @param {string} apiKey
 */
export async function embed({ input, model = 'text-embedding-3-small' }, apiKey) {
  const { data } = await axios.post(
    'https://api.openai.com/v1/embeddings',
    { model, input },
    { headers: { Authorization: `Bearer ${apiKey}` } }
  );
  return {
    embeddings: data.data.map((d) => d.embedding),
    model: data.model,
    tokens: data.usage.total_tokens,
  };
}
