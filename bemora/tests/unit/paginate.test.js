import { describe, it, expect } from 'vitest';
import { paginate, paginateStream } from '../../src/core/paginate.js';

// ── helpers ───────────────────────────────────────────────────────────────────

/** Build a fake cursor-based paginated API. */
function fakeCursorApi(items, pageSize = 3) {
  return async (cursor) => {
    const start = cursor ? items.findIndex((_, i) => String(i) === String(cursor)) : 0;
    const page  = items.slice(start, start + pageSize);
    const lastIdx = start + pageSize;
    return {
      data: page,
      has_more: lastIdx < items.length,
      next_cursor: lastIdx < items.length ? String(lastIdx) : null,
    };
  };
}

/** Build a fake offset-based API. */
function fakeOffsetApi(items, pageSize = 3) {
  return async (offset) => ({
    items: items.slice(offset, offset + pageSize),
  });
}

/** Build a fake page-number API. */
function fakePageApi(items, pageSize = 3) {
  return async (page) => ({
    results: items.slice((page - 1) * pageSize, page * pageSize),
  });
}

const ITEMS = Array.from({ length: 10 }, (_, i) => ({ id: i }));

// ── cursor strategy ───────────────────────────────────────────────────────────

describe('paginate — cursor strategy', () => {
  it('collects all items across pages', async () => {
    const fn = fakeCursorApi(ITEMS, 3);
    const result = await paginate(fn, {
      strategy: 'cursor',
      nextCursorPath: 'next_cursor',
      hasMorePath: 'has_more',
    });
    expect(result).toHaveLength(ITEMS.length);
    expect(result[0]).toEqual({ id: 0 });
    expect(result[9]).toEqual({ id: 9 });
  });

  it('respects the limit option', async () => {
    const fn = fakeCursorApi(ITEMS, 3);
    const result = await paginate(fn, {
      strategy: 'cursor',
      nextCursorPath: 'next_cursor',
      hasMorePath: 'has_more',
      limit: 5,
    });
    expect(result).toHaveLength(5);
  });

  it('stops when has_more is false', async () => {
    const singlePage = async () => ({ data: [{ id: 1 }], has_more: false });
    const result = await paginate(singlePage, { strategy: 'cursor' });
    expect(result).toHaveLength(1);
  });
});

// ── offset strategy ───────────────────────────────────────────────────────────

describe('paginate — offset strategy', () => {
  it('collects all items', async () => {
    const fn = fakeOffsetApi(ITEMS, 3);
    const result = await paginate(fn, { strategy: 'offset', pageSize: 3 });
    expect(result).toHaveLength(ITEMS.length);
  });

  it('stops when a page returns fewer items than pageSize', async () => {
    const fn = fakeOffsetApi(ITEMS, 3);
    const result = await paginate(fn, { strategy: 'offset', pageSize: 3, limit: 4 });
    expect(result).toHaveLength(4);
  });
});

// ── page strategy ─────────────────────────────────────────────────────────────

describe('paginate — page strategy', () => {
  it('collects all items starting from page 1', async () => {
    const fn = fakePageApi(ITEMS, 3);
    const result = await paginate(fn, { strategy: 'page', pageSize: 3, startPage: 1 });
    expect(result).toHaveLength(ITEMS.length);
  });

  it('respects startPage', async () => {
    const fn = fakePageApi(ITEMS, 3);
    // Starting on page 2 skips first 3 items
    const result = await paginate(fn, { strategy: 'page', pageSize: 3, startPage: 2 });
    expect(result[0]).toEqual({ id: 3 });
  });
});

// ── unknown strategy ──────────────────────────────────────────────────────────

describe('paginate — unknown strategy', () => {
  it('throws for unsupported strategy', async () => {
    // @ts-ignore deliberate invalid strategy
    await expect(paginate(() => {}, { strategy: 'exotic' })).rejects.toThrow('Unknown strategy');
  });
});

// ── paginateStream ────────────────────────────────────────────────────────────

describe('paginateStream', () => {
  it('yields all items lazily (cursor strategy)', async () => {
    const fn = fakeCursorApi(ITEMS, 3);
    const collected = [];
    for await (const item of paginateStream(fn, {
      strategy: 'cursor',
      nextCursorPath: 'next_cursor',
      hasMorePath: 'has_more',
    })) {
      collected.push(item);
    }
    expect(collected).toHaveLength(ITEMS.length);
  });

  it('yields items lazily (offset strategy)', async () => {
    const fn = fakeOffsetApi(ITEMS, 5);
    const collected = [];
    for await (const item of paginateStream(fn, { strategy: 'offset', pageSize: 5 })) {
      collected.push(item);
    }
    expect(collected).toHaveLength(ITEMS.length);
  });
});
