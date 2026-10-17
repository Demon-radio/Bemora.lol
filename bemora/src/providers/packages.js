import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();

/**
 * Fetch crate metadata from crates.io.
 * @param {Object} params
 * @param {string} params.name - crate name
 * @returns {Promise<Object>} crate metadata
 */
export async function crates({ name } = {}) {
  const cacheKey = `packages:crates:${name}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`https://crates.io/api/v1/crates/${encodeURIComponent(name)}`, {
      headers: { 'User-Agent': 'bemora (https://github.com/Demon-radio/Bemora.lol)' },
    });
    const result = {
      name: data.crate?.name,
      description: data.crate?.description,
      downloads: data.crate?.downloads,
      version: data.crate?.max_version,
      repository: data.crate?.repository,
      _cached: false,
    };
    cache.set(cacheKey, result, 86400);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'packages');
  }
}

/**
 * Fetch package metadata from Packagist.
 * @param {Object} params
 * @param {string} params.package - package name
 * @returns {Promise<Object>} package metadata
 */
export async function packagist({ package: name } = {}) {
  const cacheKey = `packages:packagist:${name}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`https://packagist.org/packages/${encodeURIComponent(name)}.json`);
    const p = data.package || {};
    const result = {
      name: p.name,
      description: p.description,
      downloads: p.downloads?.total,
      repository: p.repository,
      _cached: false,
    };
    cache.set(cacheKey, result, 86400);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'packages');
  }
}

/**
 * Fetch gem metadata from RubyGems.
 * @param {Object} params
 * @param {string} params.name - gem name
 * @returns {Promise<Object>} gem metadata
 */
export async function rubygems({ name } = {}) {
  const cacheKey = `packages:rubygems:${name}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`https://rubygems.org/api/v1/gems/${encodeURIComponent(name)}.json`);
    const result = {
      name: data.name,
      version: data.version,
      downloads: data.downloads,
      info: data.info,
      authors: data.authors,
      homepage: data.homepage_uri,
      _cached: false,
    };
    cache.set(cacheKey, result, 86400);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'packages');
  }
}

/**
 * Fetch artifact metadata from Maven Central.
 * @param {Object} params
 * @param {string} params.groupId - maven group id
 * @param {string} params.artifactId - maven artifact id
 * @returns {Promise<Object>} artifact metadata
 */
export async function maven({ groupId, artifactId } = {}) {
  const cacheKey = `packages:maven:${groupId}:${artifactId}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get('https://search.maven.org/solrsearch/select', {
      params: { q: `g:${groupId} AND a:${artifactId}`, rows: 1, wt: 'json' },
    });
    const d = data.response?.docs?.[0] || {};
    const result = {
      id: d.id,
      groupId: d.g,
      artifactId: d.a,
      version: d.latestVersion,
      _cached: false,
    };
    cache.set(cacheKey, result, 86400);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'packages');
  }
}

/**
 * Fetch package versions from NuGet.
 * @param {Object} params
 * @param {string} params.id - package id
 * @returns {Promise<Object>} package versions
 */
export async function nuget({ id } = {}) {
  const cacheKey = `packages:nuget:${id}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`https://api.nuget.org/v3-flatcontainer/${encodeURIComponent(id.toLowerCase())}/index.json`);
    const result = {
      id,
      versions: data.versions || [],
      version: (data.versions || []).slice(-1)[0],
      _cached: false,
    };
    cache.set(cacheKey, result, 86400);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'packages');
  }
}

/**
 * Fetch repository metadata from Docker Hub.
 * @param {Object} params
 * @param {string} [params.name] - repository name
 * @returns {Promise<Object>} repository metadata
 */
export async function dockerhub({ name = 'library/nginx' } = {}) {
  const cacheKey = `packages:dockerhub:${name}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`https://hub.docker.com/v2/repositories/${name}`);
    const result = {
      name: data.name,
      namespace: data.namespace,
      pulls: data.pull_count,
      stars: data.star_count,
      description: data.description,
      _cached: false,
    };
    cache.set(cacheKey, result, 86400);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'packages');
  }
}

/**
 * Fetch formula metadata from Homebrew.
 * @param {Object} params
 * @param {string} params.name - formula name
 * @returns {Promise<Object>} formula metadata
 */
export async function homebrew({ name } = {}) {
  const cacheKey = `packages:homebrew:${name}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`https://formulae.brew.sh/api/formula/${encodeURIComponent(name)}.json`);
    const result = {
      name: data.name,
      description: data.desc,
      homepage: data.homepage,
      version: data.versions?.stable,
      license: data.license,
      _cached: false,
    };
    cache.set(cacheKey, result, 86400);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'packages');
  }
}

/**
 * Fetch module version list from the Go module proxy.
 * @param {Object} params
 * @param {string} params.module - module path
 * @returns {Promise<Object>} module versions
 */
export async function goproxy({ module: name } = {}) {
  const cacheKey = `packages:goproxy:${name}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`https://proxy.golang.org/${name}/@v/list`, { responseType: 'text' });
    const result = {
      module: name,
      versions: String(data).split('\n').filter(Boolean),
      _cached: false,
    };
    cache.set(cacheKey, result, 86400);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'packages');
  }
}
