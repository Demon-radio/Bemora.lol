import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();

const BASE = 'https://translate.google.com';

/**
 * Build a Google Translate TTS URL from text.
 * @param {Object} params
 * @param {string} params.text
 * @param {string} [params.lang]
 * @returns {Object} text, lang, and url
 */
export async function tts({ text, lang = 'en' } = {}) {
  const params = { ie: 'UTF-8', q: text, tl: lang, client: 'tw-ob' };
  const url = `${BASE}/translate_tts?${new URLSearchParams(params).toString()}`;
  return { text, lang, url, _cached: false };
}

/**
 * List supported speech synthesis languages.
 * @returns {Object} languages array
 */
export async function voices() {
  return {
    languages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ar', 'hi', 'ja', 'ko', 'zh-CN', 'nl', 'pl', 'tr', 'sv', 'id', 'th', 'vi', 'uk'],
    _cached: false,
  };
}
