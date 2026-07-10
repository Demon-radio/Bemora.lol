import { describe, it, expect, vi, beforeEach } from 'vitest';
import { upsert, query, createCollection } from '../../src/providers/vectordb/qdrant.js';
import { ConfigurationError, BemoraError } from '../../src/core/errors.js';

vi.mock('../../src/core/http.js', () => ({
  httpClient: vi.fn(),
  setTracingHeadersProvider: vi.fn(),
}));

import { httpClient } from '../../src/core/http.js';

const URL_BASE = 'http://localhost:6333';
const CREDS = { apiKey: 'qdrant_test' };

const POINTS = [
  { id: '1', vector: [0.1, 0.2, 0.3], payload: { text: 'hello' } },
  { id: '2', vector: [0.4, 0.5, 0.6], payload: { text: 'world' } },
];

function makeHttp(putData = {}, postData = {}) {
  return {
    put:  vi.fn().mockResolvedValue({ data: putData }),
    post: vi.fn().mockResolvedValue({ data: postData }),
    get:  vi.fn().mockResolvedValue({ data: {} }),
  };
}

describe('qdrant — ConfigurationError on missing url', () => {
  it('upsert() throws ConfigurationError when url is missing', async () => {
    await expect(upsert({ collection: 'c1', points: POINTS }, CREDS)).rejects.toBeInstanceOf(ConfigurationError);
  });
  it('query() throws ConfigurationError when url is missing', async () => {
    await expect(query({ collection: 'c1', vector: [0.1, 0.2, 0.3] }, CREDS)).rejects.toBeInstanceOf(ConfigurationError);
  });
});

describe('qdrant — upsert()', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns status and result', async () => {
    httpClient.mockReturnValue(makeHttp({ status: 'ok', result: true }));
    const result = await upsert({ url: URL_BASE, collection: 'my_col', points: POINTS }, CREDS);
    expect(result).toMatchObject({ status: 'ok', result: true });
  });

  it('wraps upstream errors as BemoraError', async () => {
    httpClient.mockReturnValue({
      put: vi.fn().mockRejectedValue(Object.assign(new Error('Not found'), { response: { status: 404, data: {} } })),
    });
    await expect(upsert({ url: URL_BASE, collection: 'bad', points: POINTS }, CREDS)).rejects.toBeInstanceOf(BemoraError);
  });
});

describe('qdrant — query()', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns matches array', async () => {
    httpClient.mockReturnValue(makeHttp({}, { result: [{ id: '1', score: 0.99 }] }));
    const result = await query({ url: URL_BASE, collection: 'my_col', vector: [0.1, 0.2, 0.3] }, CREDS);
    // qdrant query returns { results: data.result }
    expect(Array.isArray(result.results)).toBe(true);
    expect(result.results[0]).toMatchObject({ id: '1', score: 0.99 });
  });
});

describe('qdrant — createCollection()', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns success status', async () => {
    const mockHttp = { put: vi.fn().mockResolvedValue({ data: { result: true, status: 'ok' } }) };
    httpClient.mockReturnValue(mockHttp);
    const result = await createCollection({ url: URL_BASE, collection: 'new_col', vectorSize: 384 }, CREDS);
    expect(result.result).toBe(true);
  });
});
