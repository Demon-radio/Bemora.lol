import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();

const TEXT = 'https://text.pollinations.ai';
const IMAGE = 'https://image.pollinations.ai';

/**
 * Generate text from a prompt.
 * @param {Object} params
 * @param {string} params.prompt
 * @returns {Promise<Object>} prompt plus text
 */
export async function text({ prompt } = {}) {
  const cacheKey = `pollinations:text:${prompt}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${TEXT}/${encodeURIComponent(prompt)}`, {
      responseType: 'text',
    });
    const result = {
      prompt,
      text: typeof data === 'string' ? data : String(data),
      _cached: false,
    };
    cache.set(cacheKey, result, 60);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'pollinations');
  }
}

/**
 * Build an image generation URL from a prompt.
 * @param {Object} params
 * @param {string} params.prompt
 * @param {number} [params.width]
 * @param {number} [params.height]
 * @returns {Object} prompt, dimensions, and url
 */
export async function image({ prompt, width = 512, height = 512 } = {}) {
  const url = `${IMAGE}/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}`;
  return { prompt, width, height, url, _cached: false };
}
