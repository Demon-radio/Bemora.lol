import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';
import { USER_AGENT } from '../core/headers.js';

const http = httpClient();

/**
 * Developer tools & utilities — all free, no key
 */

/**
 * Get npm package info
 * @param {{ name: string }} params
 */
export async function npmPackage({ name }) {
  const cacheKey = `dev:npm:${name}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  try {
    const { data } = await http.get(`https://registry.npmjs.org/${encodeURIComponent(name)}`);

    const latest = data['dist-tags']?.latest;
    const v = data.versions?.[latest];

    const result = {
      name: data.name,
      version: latest,
      description: data.description,
      author: data.author?.name || data.author,
      license: v?.license,
      homepage: data.homepage,
      repository: data.repository?.url?.replace(/^git\+/, '').replace(/\.git$/, ''),
      keywords: data.keywords,
      dependencies: Object.keys(v?.dependencies || {}),
      dev_dependencies: Object.keys(v?.devDependencies || {}),
      weekly_downloads: null,
      published: data.time?.[latest],
      versions_count: Object.keys(data.versions || {}).length,
      _cached: false,
    };

    cache.set(cacheKey, result, 3600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'dev');
  }
}

/**
 * Get npm package weekly downloads
 * @param {{ name: string }} params
 */
export async function npmDownloads({ name }) {
  const cacheKey = `dev:npm:dl:${name}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  try {
    const { data } = await http.get(
      `https://api.npmjs.org/downloads/point/last-week/${encodeURIComponent(name)}`
    );

    const result = { package: name, weekly_downloads: data.downloads, period: 'last-week', _cached: false };
    cache.set(cacheKey, result, 3600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'dev');
  }
}

/**
 * Get GitHub user/org repos with stats
 * @param {{ username: string, sort?: 'stars'|'updated'|'forks', limit?: number }} params
 */
export async function githubRepos({ username, sort = 'stars', limit = 10 }) {
  const cacheKey = `dev:gh:repos:${username}:${sort}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  try {
    const { data } = await http.get(`https://api.github.com/users/${username}/repos`, {
      params: { sort, per_page: limit },
      headers: { 'User-Agent': USER_AGENT },
    });

    const result = {
      username,
      repos: data.map((r) => ({
        name: r.name, description: r.description, url: r.html_url,
        stars: r.stargazers_count, forks: r.forks_count,
        language: r.language, topics: r.topics,
        open_issues: r.open_issues_count,
        updated: r.updated_at, size_kb: r.size,
        license: r.license?.name,
      })),
      _cached: false,
    };

    cache.set(cacheKey, result, 600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'dev');
  }
}

/**
 * Get latest GitHub releases for a repo
 * @param {{ owner: string, repo: string, limit?: number }} params
 */
export async function githubReleases({ owner, repo, limit = 5 }) {
  const cacheKey = `dev:gh:releases:${owner}/${repo}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  try {
    const { data } = await http.get(
      `https://api.github.com/repos/${owner}/${repo}/releases`,
      { params: { per_page: limit }, headers: { 'User-Agent': USER_AGENT } }
    );

    const result = {
      repo: `${owner}/${repo}`,
      releases: data.map((r) => ({
        name: r.name,
        tag: r.tag_name,
        published: r.published_at,
        prerelease: r.prerelease,
        body: r.body?.slice(0, 500),
        url: r.html_url,
        assets: r.assets?.map((a) => ({ name: a.name, downloads: a.download_count, url: a.browser_download_url })),
      })),
      _cached: false,
    };

    cache.set(cacheKey, result, 3600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'dev');
  }
}

/**
 * Validate email address format + check MX record
 * @param {{ email: string }} params
 */
export async function validateEmail({ email }) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const valid_format = regex.test(email);
  const domain = email.split('@')[1];

  let has_mx = false;
  try {
    await http.get(`https://dns.google/resolve?name=${domain}&type=MX`);
    has_mx = true;
  } catch (_) {}

  return {
    email,
    valid_format,
    has_mx,
    domain,
    likely_valid: valid_format && has_mx,
  };
}

/**
 * Check if a domain is up / get DNS info
 * @param {{ domain: string, type?: 'A'|'MX'|'TXT'|'CNAME' }} params
 */
export async function dnsLookup({ domain, type = 'A' }) {
  const cacheKey = `dev:dns:${domain}:${type}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  try {
    const { data } = await http.get(
      `https://dns.google/resolve?name=${domain}&type=${type}`
    );

    const result = {
      domain,
      type,
      status: data.Status === 0 ? 'ok' : 'error',
      answers: (data.Answer || []).map((a) => ({ name: a.name, ttl: a.TTL, data: a.data })),
      _cached: false,
    };

    cache.set(cacheKey, result, 300);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'dev');
  }
}

/**
 * Generate Lorem Ipsum text
 * @param {{ paragraphs?: number, type?: 'paras'|'sentences'|'words', amount?: number }} params
 */
export async function loremIpsum({ paragraphs = 1, type = 'paras', amount = 1 } = {}) {
  const { data } = await http.get('https://loripsum.net/api', {
    params: { [type]: amount, format: 'text' },
  }).catch(() => ({ data: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' }));
  return { text: typeof data === 'string' ? data.trim() : 'Lorem ipsum dolor sit amet.' };
}

/**
 * Get HTTP status code meaning
 * @param {{ code: number }} params
 */
export function httpStatus({ code }) {
  const statuses = {
    200: 'OK', 201: 'Created', 204: 'No Content', 301: 'Moved Permanently',
    302: 'Found', 304: 'Not Modified', 400: 'Bad Request', 401: 'Unauthorized',
    403: 'Forbidden', 404: 'Not Found', 405: 'Method Not Allowed',
    408: 'Request Timeout', 409: 'Conflict', 410: 'Gone',
    422: 'Unprocessable Entity', 429: 'Too Many Requests',
    500: 'Internal Server Error', 502: 'Bad Gateway', 503: 'Service Unavailable',
    504: 'Gateway Timeout',
  };
  const type =
    code < 200 ? 'informational' : code < 300 ? 'success' :
    code < 400 ? 'redirection' : code < 500 ? 'client error' : 'server error';
  return { code, meaning: statuses[code] || 'Unknown', type };
}
