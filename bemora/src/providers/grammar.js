import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();

/**
 * Run LanguageTool grammar/spelling/style checks over a block of text.
 * Uses the public LanguageTool API (no key required, rate-limited).
 * @param {Object} params
 * @param {string} params.text - text to check
 * @param {string} [params.language='en-US'] - BCP-47 style language code
 * @returns {Promise<Object>} normalized matches plus a text preview
 */
export async function check({ text, language = 'en-US' } = {}) {
  const cacheKey = `grammar:check:${language}:${(text || '').slice(0, 200)}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.post(
      'https://api.languagetool.org/v2/check',
      new URLSearchParams({ text, language }).toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    const matches = (data.matches || []).map((m) => ({
      message: m.message,
      short_message: m.shortMessage,
      offset: m.offset,
      length: m.length,
      rule_id: m.rule?.id,
      rule_description: m.rule?.description,
      issue_type: m.rule?.issueType,
      category: m.rule?.category?.name,
      replacements: (m.replacements || []).slice(0, 5).map((r) => r.value),
      context: m.context?.text,
    }));
    const result = {
      text: (text || '').slice(0, 200),
      language,
      match_count: matches.length,
      matches,
      _cached: false,
    };
    cache.set(cacheKey, result, 600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'grammar');
  }
}
