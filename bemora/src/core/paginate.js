/**
 * Unified pagination helper.
 *
 * Abstracts cursor, offset/page, and page-number based pagination strategies.
 *
 * Usage:
 *   import { paginate } from '../core/paginate.js';
 *
 *   // Cursor-based
 *   const items = await paginate(
 *     (cursor) => api.stripe.listCustomers({ limit: 50, startingAfter: cursor }),
 *     { strategy: 'cursor', cursorPath: 'data[-1].id', hasMorePath: 'has_more', limit: 200 }
 *   );
 *
 *   // Offset-based
 *   const posts = await paginate(
 *     (offset) => api.fakedb.getPosts({ offset, limit: 10 }),
 *     { strategy: 'offset', pageSize: 10, limit: 100 }
 *   );
 *
 *   // Page-number-based
 *   const results = await paginate(
 *     (page) => searchApi({ page, per_page: 20 }),
 *     { strategy: 'page', startPage: 1, pageSize: 20, limit: 200 }
 *   );
 */

/**
 * Safely read a dotted path from an object (supports negative array indices).
 * e.g. getPath(obj, 'data[-1].id')
 */
function getPath(obj, path) {
  if (!path) return undefined;
  return path.split('.').reduce((acc, part) => {
    if (acc === undefined || acc === null) return undefined;
    const arrMatch = part.match(/^(.+)\[(-?\d+)\]$/);
    if (arrMatch) {
      const arr = acc[arrMatch[1]];
      if (!Array.isArray(arr)) return undefined;
      const idx = parseInt(arrMatch[2], 10);
      return arr[idx < 0 ? arr.length + idx : idx];
    }
    return acc[part];
  }, obj);
}

/**
 * Paginate a function call, collecting all results.
 *
 * @param {(cursorOrOffsetOrPage: any) => Promise<any>} fn - called with the next cursor/offset/page
 * @param {object} opts
 * @param {'cursor'|'offset'|'page'} [opts.strategy='cursor'] - pagination strategy
 * @param {string} [opts.resultPath] - dot path to the array of items in each response (default: tries common names)
 * @param {string} [opts.cursorPath] - dot path to next cursor in response (cursor strategy)
 * @param {string} [opts.hasMorePath] - dot path to hasMore boolean (cursor strategy)
 * @param {string} [opts.nextCursorPath] - dot path to explicit next cursor value
 * @param {number} [opts.pageSize=20] - items per page (offset/page strategies)
 * @param {number} [opts.startPage=1] - starting page number (page strategy)
 * @param {number} [opts.limit=Infinity] - max total items to collect
 * @param {number} [opts.maxPages=100] - safety cap on page count
 * @returns {Promise<Array>}
 */
export async function paginate(fn, {
  strategy = 'cursor',
  resultPath,
  cursorPath,
  hasMorePath = 'has_more',
  nextCursorPath,
  pageSize = 20,
  startPage = 1,
  limit = Infinity,
  maxPages = 100,
} = {}) {
  const all = [];
  let pages = 0;

  function extractItems(response) {
    if (resultPath) return getPath(response, resultPath) ?? [];
    // Heuristic: look for common array fields
    for (const key of ['data', 'items', 'results', 'records', 'hits']) {
      if (Array.isArray(response[key])) return response[key];
    }
    if (Array.isArray(response)) return response;
    return [];
  }

  if (strategy === 'cursor') {
    let cursor = undefined;
    while (pages < maxPages && all.length < limit) {
      const response = await fn(cursor);
      const items = extractItems(response);
      all.push(...items.slice(0, limit - all.length));
      pages++;

      // Determine next cursor
      const hasMore = getPath(response, hasMorePath);
      if (hasMore === false || !hasMore) break;

      const nextCursor = nextCursorPath
        ? getPath(response, nextCursorPath)
        : cursorPath ? getPath(response, cursorPath) : null;

      if (!nextCursor || nextCursor === cursor) break;
      cursor = nextCursor;
    }
  } else if (strategy === 'offset') {
    let offset = 0;
    while (pages < maxPages && all.length < limit) {
      const response = await fn(offset);
      const items = extractItems(response);
      if (!items.length) break;
      all.push(...items.slice(0, limit - all.length));
      pages++;
      if (items.length < pageSize) break; // last page
      offset += pageSize;
    }
  } else if (strategy === 'page') {
    let page = startPage;
    while (pages < maxPages && all.length < limit) {
      const response = await fn(page);
      const items = extractItems(response);
      if (!items.length) break;
      all.push(...items.slice(0, limit - all.length));
      pages++;
      if (items.length < pageSize) break; // last page
      page++;
    }
  } else {
    throw new Error(`[paginate] Unknown strategy: "${strategy}". Use 'cursor', 'offset', or 'page'.`);
  }

  return all;
}

/**
 * Convenience: paginate and return as an async generator (lazy).
 * Useful for streaming very large result sets without buffering everything.
 *
 * @yields {any} each item
 */
export async function* paginateStream(fn, opts = {}) {
  const { strategy = 'cursor', resultPath, cursorPath, hasMorePath = 'has_more', nextCursorPath, pageSize = 20, startPage = 1, maxPages = 100 } = opts;
  let pages = 0;

  function extractItems(response) {
    if (resultPath) {
      const v = response;
      return resultPath.split('.').reduce((a, p) => a?.[p], v) ?? [];
    }
    for (const key of ['data', 'items', 'results', 'records', 'hits']) {
      if (Array.isArray(response[key])) return response[key];
    }
    return Array.isArray(response) ? response : [];
  }

  if (strategy === 'cursor') {
    let cursor = undefined;
    while (pages < maxPages) {
      const response = await fn(cursor);
      const items = extractItems(response);
      for (const item of items) yield item;
      pages++;
      const hasMore = hasMorePath.split('.').reduce((a, p) => a?.[p], response);
      if (!hasMore) break;
      const nextCursor = nextCursorPath
        ? nextCursorPath.split('.').reduce((a, p) => a?.[p], response)
        : cursorPath ? cursorPath.split('.').reduce((a, p) => a?.[p], response) : null;
      if (!nextCursor || nextCursor === cursor) break;
      cursor = nextCursor;
    }
  } else if (strategy === 'offset' || strategy === 'page') {
    let ptr = strategy === 'page' ? startPage : 0;
    while (pages < maxPages) {
      const response = await fn(ptr);
      const items = extractItems(response);
      if (!items.length) break;
      for (const item of items) yield item;
      pages++;
      if (items.length < pageSize) break;
      ptr += strategy === 'page' ? 1 : pageSize;
    }
  }
}
