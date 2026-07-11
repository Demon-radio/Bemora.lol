import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();

/**
 * Google's public favicon service — free, no key.
 * @param {{ domain: string, size?: number }} params
 */
export function favicon({ domain, size = 64 }) {
  return {
    provider: 'google-s2-favicons',
    domain,
    url: `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=${size}`,
  };
}

/**
 * Screenshot a public URL (thum.io — free tier, no key).
 * @param {{ url: string, width?: number }} params
 */
export function screenshot({ url, width = 1200 }) {
  return {
    provider: 'thum.io',
    url,
    image_url: `https://image.thum.io/get/width/${width}/${encodeURIComponent(url)}`,
  };
}

/**
 * Fetch page metadata (title, description, image) via microlink.io's free
 * no-key tier. Useful for link previews / unfurling.
 * @param {{ url: string }} params
 */
export async function metadata({ url }) {
  const cacheKey = `webtools:meta:${url}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  let data;
  try {
    ({ data } = await http.get('https://api.microlink.io', { params: { url } }));
  } catch (err) {
    throw wrapProviderError(err, 'webtools');
  }

  const d = data.data || {};
  const result = {
    provider: 'microlink',
    url,
    title: d.title,
    description: d.description,
    image: d.image?.url,
    logo: d.logo?.url,
    publisher: d.publisher,
    _cached: false,
  };

  cache.set(cacheKey, result, 3600);
  return result;
}
