import { describe, it, expect, vi, beforeEach } from 'vitest';
import { gql, gqlTag } from '../../src/core/gql.js';

// ── mock httpClient ───────────────────────────────────────────────────────────

vi.mock('../../src/core/http.js', () => ({
  httpClient: vi.fn(),
}));

import { httpClient } from '../../src/core/http.js';

const ENDPOINT = 'https://api.example.com/graphql';

function makeHttp(responseData) {
  return {
    post: vi.fn().mockResolvedValue({ data: responseData }),
  };
}

// ── gql ───────────────────────────────────────────────────────────────────────

describe('gql()', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the data field on success', async () => {
    httpClient.mockReturnValue(makeHttp({ data: { viewer: { login: 'alice' } } }));
    const result = await gql(ENDPOINT, '{ viewer { login } }');
    expect(result).toEqual({ viewer: { login: 'alice' } });
  });

  it('passes variables to the request body', async () => {
    const mockHttp = makeHttp({ data: { user: { id: '1' } } });
    httpClient.mockReturnValue(mockHttp);
    await gql(ENDPOINT, 'query Q($id: ID!) { user(id: $id) { id } }', { id: '1' });
    const [, body] = mockHttp.post.mock.calls[0];
    const parsed = JSON.parse(body);
    expect(parsed.variables).toEqual({ id: '1' });
  });

  it('throws ProviderError when errors array is non-empty (throwOnErrors = true)', async () => {
    httpClient.mockReturnValue(makeHttp({ errors: [{ message: 'Not found' }], data: null }));
    await expect(gql(ENDPOINT, '{ missing }')).rejects.toThrow('Not found');
  });

  it('does NOT throw when throwOnErrors = false', async () => {
    httpClient.mockReturnValue(makeHttp({ errors: [{ message: 'Not found' }], data: null }));
    const result = await gql(ENDPOINT, '{ missing }', {}, { throwOnErrors: false });
    expect(result).toBeNull();
  });

  it('throws ProviderError on network failure', async () => {
    httpClient.mockReturnValue({
      post: vi.fn().mockRejectedValue(new Error('ECONNREFUSED')),
    });
    await expect(gql(ENDPOINT, '{ viewer { login } }')).rejects.toThrow('ECONNREFUSED');
  });

  it('merges custom headers', async () => {
    const mockHttp = makeHttp({ data: {} });
    httpClient.mockReturnValue(mockHttp);
    await gql(ENDPOINT, '{ viewer { login } }', {}, { headers: { Authorization: 'Bearer tok' } });
    expect(httpClient).toHaveBeenCalledWith(
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer tok' }) })
    );
  });
});

// ── gqlTag ────────────────────────────────────────────────────────────────────

describe('gqlTag', () => {
  it('returns the plain string for a simple template', () => {
    const query = gqlTag`query { viewer { login } }`;
    expect(query).toBe('query { viewer { login } }');
  });

  it('interpolates values', () => {
    const field = 'login';
    const query = gqlTag`query { viewer { ${field} } }`;
    expect(query).toBe('query { viewer { login } }');
  });
});
