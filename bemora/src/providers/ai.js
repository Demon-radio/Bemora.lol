
import axios from 'axios';

/**
 * AI provider — lightweight wrappers for LLM APIs.
 * Bemora gives you the same interface whether you use OpenAI, Groq, Anthropic, or Google Gemini.
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
    provider: 'openai',
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
 * Anthropic Claude API (Claude 3, Claude 3.5)
 * @param {{ messages: Array<{role,content}>, model?: string, temperature?: number, maxTokens?: number }} params
 * @param {string} apiKey — Anthropic API key
 */
export async function anthropicChat({ messages, model = 'claude-3-5-sonnet-20241022', temperature = 0.7, maxTokens = 1024 }, apiKey) {
  const { data } = await axios.post(
    'https://api.anthropic.com/v1/messages',
    {
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      anthropic_version: '2023-06-01'
    },
    {
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      }
    }
  );
  return {
    content: data.content[0].text,
    model: data.model,
    tokens: { input: data.usage.input_tokens, output: data.usage.output_tokens },
    provider: 'anthropic',
  };
}

/**
 * Google Gemini API (Gemini 1.5 Flash/Pro)
 * @param {{ messages: Array<{role,content}>, model?: string, temperature?: number }} params
 * @param {string} apiKey — Google Gemini API key
 */
export async function geminiChat({ messages, model = 'gemini-1.5-flash', temperature = 0.7 }, apiKey) {
  const contents = messages.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));
  const { data } = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    { contents, generationConfig: { temperature } }
  );
  return {
    content: data.candidates[0].content.parts[0].text,
    model,
    tokens: {
      input: data.usageMetadata?.promptTokenCount || 0,
      output: data.usageMetadata?.candidatesTokenCount || 0
    },
    provider: 'google',
  };
}

/**
 * Smart chat router — tries Groq first (free/fast), falls back to OpenAI, Anthropic, or Gemini
 * @param {{ messages: Array<{role,content}>, model?: string }} params
 * @param {{ groqKey?: string, openaiKey?: string, anthropicKey?: string, geminiKey?: string }} keys
 */
export async function smartChat({ messages, system }, { groqKey, openaiKey, anthropicKey, geminiKey } = {}) {
  const msgs = system
    ? [{ role: 'system', content: system }, ...messages]
    : messages;

  if (groqKey) {
    try { return await groqChat({ messages: msgs }, groqKey); } catch (_) {}
  }

  if (openaiKey) {
    try { return await openaiChat({ messages: msgs }, openaiKey); } catch (_) {}
  }

  if (anthropicKey) {
    try { return await anthropicChat({ messages: msgs }, anthropicKey); } catch (_) {}
  }

  if (geminiKey) {
    return await geminiChat({ messages: msgs }, geminiKey);
  }

  throw new Error(
    '[bemora] AI chat requires at least one key: groqKey, openaiKey, anthropicKey, or geminiKey.\n' +
    '  → Free keys: https://console.groq.com (Groq), https://aistudio.google.com/app/apikey (Gemini)\n' +
    '  → Paid keys: https://platform.openai.com, https://console.anthropic.com'
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

