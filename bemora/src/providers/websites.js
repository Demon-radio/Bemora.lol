import { httpClient } from '../core/http.js';
import { ValidationError, wrapProviderError } from '../core/errors.js';

const http = httpClient();

const KNOWN_HEADERS = {
  server: 'server',
  'x-powered-by': 'poweredBy',
  'x-generator': 'generator',
  'x-drupal-cache': 'drupal',
  'x-shopify-stage': 'shopify',
};

/**
 * Check a website's live HTTP status, response time, and headers
 * @param {{ url: string }} params
 */
export async function status({ url }) {
  const target = normalizeUrl(url);
  const start = Date.now();
  try {
    const res = await http.get(target, {
      timeout: 10000,
      maxRedirects: 5,
      validateStatus: () => true,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; bemora-bot/1.0)' },
    });
    return {
      url: target,
      online: res.status < 500,
      statusCode: res.status,
      responseTimeMs: Date.now() - start,
      server: res.headers['server'] || null,
      contentType: res.headers['content-type'] || null,
      https: target.startsWith('https://'),
    };
  } catch (err) {
    return { url: target, online: false, error: err.message, responseTimeMs: Date.now() - start };
  }
}

/**
 * Lightweight tech-stack detection for a website — inspects real response headers and HTML
 * for CMS/framework/library fingerprints (WordPress, Shopify, React, Next.js, Vue, jQuery, etc.)
 * @param {{ url: string }} params
 */
export async function detectTechStack({ url }) {
  const target = normalizeUrl(url);
  try {
    const { data: html, headers } = await http.get(target, {
      timeout: 10000,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; bemora-bot/1.0)' },
    });

    const detected = new Set();

    Object.entries(KNOWN_HEADERS).forEach(([header, label]) => {
      if (headers[header]) detected.add(`${label}: ${headers[header]}`);
    });

    const patterns = [
      [/wp-content|wp-includes/i, 'WordPress'],
      [/cdn\.shopify\.com/i, 'Shopify'],
      [/_next\/static/i, 'Next.js'],
      [/data-reactroot|react-dom/i, 'React'],
      [/__NUXT__|nuxt/i, 'Nuxt.js'],
      [/\bvue(\.min)?\.js/i, 'Vue.js'],
      [/jquery(-[\d.]+)?(\.min)?\.js/i, 'jQuery'],
      [/wix\.com|wixstatic/i, 'Wix'],
      [/squarespace/i, 'Squarespace'],
      [/cdn\.jsdelivr\.net\/npm\/bootstrap/i, 'Bootstrap'],
      [/tailwind/i, 'Tailwind CSS'],
      [/gtag\(|google-analytics\.com|googletagmanager/i, 'Google Analytics'],
      [/cloudflare/i, 'Cloudflare'],
      [/name="generator" content="([^"]+)"/i, (m) => m[1]],
    ];

    patterns.forEach(([regex, label]) => {
      const match = html.match(regex);
      if (match) detected.add(typeof label === 'function' ? label(match) : label);
    });

    return {
      url: target,
      detected: Array.from(detected),
      poweredBy: headers['x-powered-by'] || null,
      server: headers['server'] || null,
    };
  } catch (err) {
    throw wrapProviderError(err, 'websites');
  }
}

/**
 * Extract basic page metadata — title, description, favicon, canonical URL, Open Graph tags
 * @param {{ url: string }} params
 */
export async function getMeta({ url }) {
  const target = normalizeUrl(url);
  try {
    const { data: html } = await http.get(target, {
      timeout: 10000,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; bemora-bot/1.0)' },
    });

    const grab = (regex) => html.match(regex)?.[1]?.trim();

    return {
      url: target,
      title: grab(/<title[^>]*>([^<]*)<\/title>/i),
      description: grab(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i),
      ogTitle: grab(/<meta\s+property=["']og:title["']\s+content=["']([^"']*)["']/i),
      ogImage: grab(/<meta\s+property=["']og:image["']\s+content=["']([^"']*)["']/i),
      ogDescription: grab(/<meta\s+property=["']og:description["']\s+content=["']([^"']*)["']/i),
      canonical: grab(/<link\s+rel=["']canonical["']\s+href=["']([^"']*)["']/i),
      favicon: grab(/<link[^>]+rel=["'](?:shortcut )?icon["'][^>]+href=["']([^"']*)["']/i),
    };
  } catch (err) {
    throw wrapProviderError(err, 'websites');
  }
}

function normalizeUrl(url) {
  if (!url) throw new ValidationError('url is required', { provider: 'websites' });
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}
