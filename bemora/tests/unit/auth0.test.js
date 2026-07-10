import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getUser, listUsers } from '../../src/providers/auth/auth0.js';
import { ConfigurationError, BemoraError } from '../../src/core/errors.js';

vi.mock('../../src/core/http.js', () => ({
  httpClient: vi.fn(),
  setTracingHeadersProvider: vi.fn(),
}));

import { httpClient } from '../../src/core/http.js';

const CREDS = { domain: 'example.auth0.com', clientId: 'cid', clientSecret: 'csec' };

function makeHttp(userData = {}, tokenData = { access_token: 'mgmt_tok', expires_in: 86400 }) {
  return {
    post: vi.fn().mockResolvedValue({ data: tokenData }),
    get:  vi.fn().mockResolvedValue({ data: userData }),
  };
}

describe('auth0 — ConfigurationError on missing domain', () => {
  it('getUser throws ConfigurationError when domain is missing', async () => {
    await expect(getUser({ userId: 'u1' }, {})).rejects.toBeInstanceOf(ConfigurationError);
  });
});

describe('auth0 — getUser', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns user data', async () => {
    httpClient.mockReturnValue(makeHttp({ user_id: 'auth0|abc', email: 'a@b.com' }));
    const result = await getUser({ userId: 'auth0|abc' }, CREDS);
    expect(result).toMatchObject({ user_id: 'auth0|abc', email: 'a@b.com' });
  });

  it('wraps upstream 404 as BemoraError', async () => {
    const http = {
      post: vi.fn().mockResolvedValue({ data: { access_token: 'tok', expires_in: 86400 } }),
      get:  vi.fn().mockRejectedValue(Object.assign(new Error('Not Found'), { response: { status: 404, data: { message: 'User not found' } } })),
    };
    httpClient.mockReturnValue(http);
    await expect(getUser({ userId: 'unknown' }, CREDS)).rejects.toBeInstanceOf(BemoraError);
  });
});

describe('auth0 — listUsers', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns array of users', async () => {
    httpClient.mockReturnValue(makeHttp([{ user_id: 'u1' }, { user_id: 'u2' }]));
    const result = await listUsers({ perPage: 2 }, CREDS);
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({ user_id: 'u1' });
  });
});
