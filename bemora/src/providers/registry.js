import { httpClient } from '../core/http.js';
import { ValidationError, wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';
import { USER_AGENT } from '../core/headers.js';

const http = httpClient({ headers: { 'User-Agent': USER_AGENT } });

/**
 * Get PyPI package metadata (versions, deps, license — no key needed).
 * @param {Object} params
 * @param {string} params.package - e.g. requests
 */
export async function pypiInfo({ package: pkg }) {
  if (!pkg || typeof pkg !== 'string') {
    throw new ValidationError('[registry] pypiInfo({ package }) requires a package name.', {
      provider: 'pypi',
    });
  }
  const cacheKey = `registry:pypi:${pkg}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  let data;
  try {
    ({ data } = await http.get(`https://pypi.org/pypi/${encodeURIComponent(pkg)}/json`));
  } catch (err) {
    throw wrapProviderError(err, 'pypi');
  }

  const info = data.info || {};
  const result = {
    package: pkg,
    version: info.version,
    summary: info.summary || null,
    author: info.author || null,
    license: info.license || null,
    requires_python: info.requires_python || null,
    home_page: info.home_page || null,
    release_count: Object.keys(data.releases || {}).length,
    _cached: false,
  };
  cache.set(cacheKey, result, 3600);
  return result;
}

/**
 * Get npm package metadata for the latest version (no key needed).
 * @param {Object} params
 * @param {string} params.package - e.g. express
 */
export async function npmInfo({ package: pkg }) {
  if (!pkg || typeof pkg !== 'string') {
    throw new ValidationError('[registry] npmInfo({ package }) requires a package name.', {
      provider: 'npm',
    });
  }
  const cacheKey = `registry:npm:${pkg}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  let data;
  try {
    ({ data } = await http.get(`https://registry.npmjs.org/${encodeURIComponent(pkg)}/latest`));
  } catch (err) {
    throw wrapProviderError(err, 'npm');
  }

  const result = {
    package: pkg,
    version: data.version,
    description: data.description || null,
    license: data.license || null,
    engines: data.engines || {},
    dependencies: data.dependencies || {},
    funding: data.funding || null,
    _cached: false,
  };
  cache.set(cacheKey, result, 3600);
  return result;
}

/**
 * Query OSV.dev for known vulnerabilities affecting a pinned version (no key needed).
 * @param {Object} params
 * @param {string} params.ecosystem - e.g. PyPI, npm, Go, crates.io
 * @param {string} params.package - e.g. requests
 * @param {string} params.version - e.g. 2.31.0
 */
export async function osvQuery({ ecosystem, package: pkg, version }) {
  if (!ecosystem || !pkg || !version) {
    throw new ValidationError('[registry] osvQuery({ ecosystem, package, version }) requires all three fields.', {
      provider: 'osv',
    });
  }
  const cacheKey = `registry:osv:${ecosystem}:${pkg}:${version}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  let data;
  try {
    const res = await http.post('https://api.osv.dev/v1/query', {
      package: { name: pkg, ecosystem },
      version,
    });
    data = res.data;
  } catch (err) {
    throw wrapProviderError(err, 'osv');
  }

  const result = {
    ecosystem,
    package: pkg,
    version,
    vulnerable: (data.vulns || []).length > 0,
    vulns: (data.vulns || []).map((v) => ({
      id: v.id,
      summary: v.summary || null,
      severity: v.severity || null,
      fixed: [
        ...new Set(
          (v.affected || []).flatMap((a) =>
            (a.ranges || []).flatMap((r) => (r.events || []).map((e) => e.fixed).filter(Boolean))
          )
        ),
      ],
      references: (v.references || [])
        .slice(0, 3)
        .map((r) => r.url)
        .filter(Boolean),
    })),
    _cached: false,
  };
  cache.set(cacheKey, result, 3600);
  return result;
}
