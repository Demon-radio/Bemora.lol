import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';
import { USER_AGENT } from '../core/headers.js';

const http = httpClient({ headers: { 'User-Agent': USER_AGENT } });

/**
 * Extract the text content of a single XML tag from a block (lightweight
 * regex parser — same approach used by rss.js, no external XML lib needed).
 */
function tag(block, name) {
  const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`, 'i'));
  return m ? m[1].trim() : null;
}

/**
 * Search academic papers on arXiv (no key needed).
 * @param {Object} params
 * @param {string} params.query
 * @param {number} [params.maxResults]
 */
export async function search({ query, maxResults = 10 }) {
  const cacheKey = `arxiv:search:${query}:${maxResults}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  let data;
  try {
    ({ data } = await http.get('https://export.arxiv.org/api/query', {
      params: { search_query: `all:${query}`, start: 0, max_results: maxResults },
      responseType: 'text',
    }));
  } catch (err) {
    throw wrapProviderError(err, 'arxiv');
  }

  const papers = [];
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let match;
  while ((match = entryRegex.exec(data)) !== null) {
    const block = match[1];
    const authors = [...block.matchAll(/<name>(.*?)<\/name>/g)].map((m) => m[1]);
    const linkMatch = block.match(/<link[^>]+title="pdf"[^>]+href="([^"]+)"/i);
    papers.push({
      id: tag(block, 'id'),
      title: tag(block, 'title')?.replace(/\s+/g, ' '),
      summary: tag(block, 'summary')?.replace(/\s+/g, ' ').slice(0, 500),
      authors,
      published: tag(block, 'published'),
      pdf: linkMatch?.[1] || tag(block, 'id')?.replace('/abs/', '/pdf/'),
    });
  }

  const result = { query, count: papers.length, papers, _cached: false };
  cache.set(cacheKey, result, 3600);
  return result;
}
