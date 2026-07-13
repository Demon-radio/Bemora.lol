import * as cache from '../core/cache.js';
import { httpClient } from '../core/http.js';
import { ValidationError, wrapProviderError } from '../core/errors.js';

const http = httpClient();

/**
 * Translate text using MyMemory API (Free — 1000 words/day, no key)
 * For more: pass an email to increase to 10,000 words/day.
 *
 * @param {{ text: string, from: string, to: string, email?: string }} params
 * Language codes: 'en', 'ar', 'fr', 'de', 'es', 'it', 'zh', 'ja', 'pt', 'ru' ...
 * MyMemory rejects the literal string 'auto' as a source language (returns a
 * 200-status error payload, not an HTTP error) — its real auto-detect keyword
 * is 'autodetect', so 'auto' (or omitting `from`) is normalized to that.
 */
export async function translate({ text, from = 'auto', to, email }) {
  const source = from === 'auto' ? 'autodetect' : from;
  const cacheKey = `translate:${source}:${to}:${text.slice(0, 50)}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const params = { q: text, langpair: `${source}|${to}` };
  if (email) params.de = email;

  try {
    const { data } = await http.get('https://api.mymemory.translated.net/get', { params });

    if (data.responseStatus !== 200) throw new ValidationError(data.responseDetails, { provider: 'translate' });

    const result = {
      original: text,
      translated: data.responseData.translatedText,
      from: source === 'autodetect' ? (data.responseData.detectedLanguage || 'unknown') : source,
      to,
      quality: data.responseData.match,
      _cached: false,
    };

    cache.set(cacheKey, result, 3600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'translate');
  }
}

/**
 * Translate to multiple languages at once
 * @param {{ text: string, from: string, targets: string[] }} params
 */
export async function translateMany({ text, from = 'auto', targets }) {
  const results = await Promise.allSettled(
    targets.map((to) => translate({ text, from, to }))
  );
  return Object.fromEntries(
    targets.map((to, i) => [
      to,
      results[i].status === 'fulfilled'
        ? results[i].value.translated
        : { error: results[i].reason?.message },
    ])
  );
}

/**
 * Detect the language of a piece of text via MyMemory's 'autodetect' source
 * language keyword (the literal string 'auto' is rejected by the upstream API).
 * @param {{ text: string }} params
 */
export async function detectLanguage({ text }) {
  try {
    const { data } = await http.get('https://api.mymemory.translated.net/get', {
      params: { q: text, langpair: 'autodetect|en' },
    });
    if (data.responseStatus !== 200) throw new ValidationError(data.responseDetails, { provider: 'translate' });
    return {
      text,
      detected: data.responseData?.detectedLanguage || 'unknown',
    };
  } catch (err) {
    throw wrapProviderError(err, 'translate');
  }
}
