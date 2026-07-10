/**
 * Integration tests for Tier 1 enterprise providers.
 *
 * Uses vitest module mocks so no real API keys or network calls are needed.
 * Tests verify:
 *   - Request shape (correct URL, auth headers, body encoding)
 *   - Error mapping (401 → AuthError, 429 → RateLimitError, timeout → TimeoutError)
 *   - Streaming API yields text deltas
 *   - Webhook signatures verified with real HMAC (no mocking)
 *   - S3 presigned URL generation (real local crypto, no HTTP)
 */

import { vi, describe, it, expect, beforeEach } from 'vitest';
import { createHmac } from 'node:crypto';

// ── HTTP layer mock ───────────────────────────────────────────────────────────

const { mockGet, mockPost, mockPut } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockPost: vi.fn(),
  mockPut: vi.fn(),
}));

vi.mock('../../src/core/http.js', () => ({
  httpClient: vi.fn(() => ({ get: mockGet, post: mockPost, put: mockPut })),
  request: vi.fn(),
  DEFAULT_TIMEOUT: 8000,
}));

// Mock SigV4 signing so S3 HTTP tests don't need real AWS credentials.
vi.mock('../../src/core/signing/awsSigV4.js', () => ({
  signAwsRequest: vi.fn(async () => ({
    'x-amz-date': '20240101T000000Z',
    Authorization: 'AWS4-HMAC-SHA256 Credential=FAKE/...',
    'x-amz-content-sha256': 'UNSIGNED-PAYLOAD',
  })),
  presignUrl: vi.fn(async ({ url }) =>
    url + '?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Expires=3600&X-Amz-Signature=fakesig'),
}));

// ── Provider imports (after mocks are registered) ────────────────────────────

import * as stripe      from '../../src/providers/payments/stripe.js';
import * as anthropic   from '../../src/providers/ai/anthropic.js';
import * as s3          from '../../src/providers/storage/s3.js';
import * as pinecone    from '../../src/providers/vectordb/pinecone.js';
import {
  verify,
  verifyStripeWebhook,
  verifyGitHubWebhook,
  verifyTwilioWebhook,
} from '../../src/providers/webhooks/verify.js';
import {
  AuthError,
  RateLimitError,
  TimeoutError,
  ConfigurationError,
  BemoraError,
} from '../../src/core/errors.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Create a fake axios 4xx/5xx error in the shape wrapProviderError expects. */
function axiosError(status, message = 'Upstream error') {
  const err = new Error(message);
  err.response = {
    status,
    data: { message },
    headers: {
      'retry-after': status === 429 ? '60' : undefined,
      'x-ratelimit-limit': status === 429 ? '100' : undefined,
      'x-ratelimit-remaining': status === 429 ? '0' : undefined,
    },
  };
  return err;
}

/** Create a fake axios timeout error. */
function timeoutError() {
  const err = new Error('timeout of 8000ms exceeded');
  err.code = 'ECONNABORTED';
  return err;
}

/** Build a valid Stripe webhook signature for `payload` signed with `secret`. */
function stripeSignature(payload, secret, timestamp = Math.floor(Date.now() / 1000)) {
  const signed = createHmac('sha256', secret).update(`${timestamp}.${payload}`).digest('hex');
  return `t=${timestamp},v1=${signed}`;
}

/** Build a valid GitHub webhook signature for `payload` signed with `secret`. */
function githubSignature(payload, secret) {
  return 'sha256=' + createHmac('sha256', secret).update(payload).digest('hex');
}

/** Build a valid Twilio webhook signature for a URL + params + authToken. */
function twilioSignature(url, params, authToken) {
  const sortedParams = Object.keys(params).sort().reduce((a, k) => a + k + params[k], '');
  return createHmac('sha1', authToken).update(url + sortedParams).digest('base64');
}

/** Async generator that simulates an SSE stream from Anthropic's API. */
async function* sseStream(lines) {
  for (const line of lines) {
    yield Buffer.from(line + '\n');
  }
}

const FAKE_KEY = 'sk_test_bemora_enterprise_fake_key';
const FAKE_S3_CREDS = { accessKeyId: 'AKIAFAKE', secretAccessKey: 'fakeSecret123' };
const PINECONE_HOST = 'my-index-abc123.svc.pinecone.io';

beforeEach(() => {
  vi.clearAllMocks();
});

// ═══════════════════════════════════════════════════════════════════════════
// STRIPE
// ═══════════════════════════════════════════════════════════════════════════

describe('Stripe provider', () => {
  it('createCharge — success: POSTs to /v1/charges with Bearer auth', async () => {
    const fakeCharge = { id: 'ch_123', object: 'charge', amount: 2000, currency: 'usd' };
    mockPost.mockResolvedValueOnce({ data: fakeCharge });

    const result = await stripe.createCharge(
      { amount: 2000, currency: 'usd', source: 'tok_visa' },
      FAKE_KEY,
    );

    expect(mockPost).toHaveBeenCalledTimes(1);
    const [url, body] = mockPost.mock.calls[0];
    expect(url).toContain('/v1/charges');
    expect(body).toContain('amount=2000');
    expect(body).toContain('currency=usd');
    expect(result).toEqual(fakeCharge);
  });

  it('createCharge — 401 → throws AuthError with provider=stripe and requestId', async () => {
    mockPost.mockRejectedValueOnce(axiosError(401, 'Invalid API Key'));

    let thrown;
    try {
      await stripe.createCharge({ amount: 100, currency: 'usd' }, FAKE_KEY);
    } catch (err) {
      thrown = err;
    }

    expect(thrown).toBeInstanceOf(AuthError);
    expect(thrown.provider).toBe('stripe');
    expect(thrown.code).toBe('AUTH_ERROR');
    expect(thrown.httpStatus).toBe(401);
    expect(typeof thrown.requestId).toBe('string');
    expect(thrown.requestId.length).toBeGreaterThan(5);
  });

  it('createCharge — 429 → throws RateLimitError with retryAfter headers', async () => {
    mockPost.mockRejectedValueOnce(axiosError(429, 'Too Many Requests'));

    let thrown;
    try {
      await stripe.createCharge({ amount: 100, currency: 'usd' }, FAKE_KEY);
    } catch (err) {
      thrown = err;
    }

    expect(thrown).toBeInstanceOf(RateLimitError);
    expect(thrown.provider).toBe('stripe');
    expect(thrown.retryAfter).toBe('60');
    expect(thrown.limit).toBe('100');
    expect(thrown.remaining).toBe('0');
  });

  it('createCharge — ECONNABORTED timeout → throws TimeoutError', async () => {
    mockPost.mockRejectedValueOnce(timeoutError());

    await expect(stripe.createCharge({ amount: 100, currency: 'usd' }, FAKE_KEY))
      .rejects.toBeInstanceOf(TimeoutError);
  });

  it('createPaymentIntent — POSTs to /v1/payment_intents', async () => {
    mockPost.mockResolvedValueOnce({ data: { id: 'pi_abc', status: 'requires_payment_method' } });

    const result = await stripe.createPaymentIntent(
      { amount: 5000, currency: 'usd' },
      FAKE_KEY,
    );
    expect(mockPost.mock.calls[0][0]).toContain('/v1/payment_intents');
    expect(result.id).toBe('pi_abc');
  });

  it('createCustomer — POSTs to /v1/customers', async () => {
    mockPost.mockResolvedValueOnce({ data: { id: 'cus_123', email: 'test@example.com' } });

    const result = await stripe.createCustomer({ email: 'test@example.com' }, FAKE_KEY);
    expect(mockPost.mock.calls[0][0]).toContain('/v1/customers');
    expect(result.id).toBe('cus_123');
  });

  it('createRefund — POSTs to /v1/refunds', async () => {
    mockPost.mockResolvedValueOnce({ data: { id: 're_123', status: 'succeeded' } });

    const result = await stripe.createRefund({ chargeId: 'ch_123' }, FAKE_KEY);
    expect(mockPost.mock.calls[0][0]).toContain('/v1/refunds');
    expect(result.status).toBe('succeeded');
  });

  it('listCharges — GETs /v1/charges with limit param', async () => {
    mockGet.mockResolvedValueOnce({ data: { data: [], has_more: false } });

    await stripe.listCharges({ limit: 5 }, FAKE_KEY);
    expect(mockGet).toHaveBeenCalledTimes(1);
    expect(mockGet.mock.calls[0][0]).toContain('/v1/charges');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// ANTHROPIC
// ═══════════════════════════════════════════════════════════════════════════

describe('Anthropic provider', () => {
  it('messages() — no apiKey → throws ConfigurationError', async () => {
    await expect(anthropic.messages({ messages: [] }, undefined))
      .rejects.toBeInstanceOf(ConfigurationError);
  });

  it('messages() — success: POSTs to /v1/messages, returns structured response', async () => {
    mockPost.mockResolvedValueOnce({
      data: {
        content: [{ text: 'Hello, world!' }],
        model: 'claude-3-5-sonnet-20241022',
        usage: { input_tokens: 10, output_tokens: 5 },
        stop_reason: 'end_turn',
      },
    });

    const result = await anthropic.messages(
      { messages: [{ role: 'user', content: 'Hi' }] },
      FAKE_KEY,
    );

    expect(mockPost).toHaveBeenCalledTimes(1);
    const [url, body] = mockPost.mock.calls[0];
    expect(url).toContain('/v1/messages');
    expect(body.messages).toHaveLength(1);

    expect(result.content).toBe('Hello, world!');
    expect(result.provider).toBe('anthropic');
    expect(result.tokens.input).toBe(10);
    expect(result.tokens.output).toBe(5);
    expect(result.stopReason).toBe('end_turn');
  });

  it('messages() — sends x-api-key and anthropic-version headers', async () => {
    mockPost.mockResolvedValueOnce({
      data: {
        content: [{ text: 'ok' }],
        model: 'claude-3-5-sonnet-20241022',
        usage: { input_tokens: 1, output_tokens: 1 },
        stop_reason: 'end_turn',
      },
    });
    await anthropic.messages({ messages: [{ role: 'user', content: 'hi' }] }, FAKE_KEY);
    // httpClient is called with the headers — verify it was called at all
    const { httpClient } = await import('../../src/core/http.js');
    expect(httpClient).toHaveBeenCalled();
    const callArgs = httpClient.mock.calls[0][0];
    expect(callArgs.headers['x-api-key']).toBe(FAKE_KEY);
    expect(callArgs.headers['anthropic-version']).toBeTruthy();
  });

  it('messages() — 401 → throws AuthError', async () => {
    mockPost.mockRejectedValueOnce(axiosError(401, 'Unauthorized'));
    await expect(anthropic.messages({ messages: [] }, FAKE_KEY))
      .rejects.toBeInstanceOf(AuthError);
  });

  it('stream() — no apiKey → throws ConfigurationError', async () => {
    await expect(anthropic.stream({ messages: [] }, undefined).next())
      .rejects.toBeInstanceOf(ConfigurationError);
  });

  it('stream() — yields text deltas and final done chunk', async () => {
    const sseLines = [
      'data: {"type":"message_start","message":{"usage":{"input_tokens":10}}}',
      'data: {"type":"content_block_delta","delta":{"type":"text_delta","text":"Hello"}}',
      'data: {"type":"content_block_delta","delta":{"type":"text_delta","text":", world!"}}',
      'data: {"type":"message_delta","usage":{"output_tokens":5}}',
      'data: {"type":"message_stop"}',
    ];
    mockPost.mockResolvedValueOnce({ data: sseStream(sseLines) });

    const chunks = [];
    for await (const chunk of anthropic.stream(
      { messages: [{ role: 'user', content: 'Hi' }] },
      FAKE_KEY,
    )) {
      chunks.push(chunk);
    }

    // Should yield the two text deltas + a final done chunk
    const textChunks = chunks.filter((c) => c.content && !c.done);
    expect(textChunks).toHaveLength(2);
    expect(textChunks[0].content).toBe('Hello');
    expect(textChunks[1].content).toBe(', world!');

    const doneChunk = chunks.find((c) => c.done === true);
    expect(doneChunk).toBeDefined();
    expect(doneChunk.inputTokens).toBe(10);
    expect(doneChunk.outputTokens).toBe(5);
  });

  it('stream() — timeout → throws TimeoutError', async () => {
    mockPost.mockRejectedValueOnce(timeoutError());

    const gen = anthropic.stream({ messages: [{ role: 'user', content: 'hi' }] }, FAKE_KEY);
    await expect(gen.next()).rejects.toBeInstanceOf(TimeoutError);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// S3
// ═══════════════════════════════════════════════════════════════════════════

describe('S3 provider', () => {
  it('presignedGetUrl — missing credentials → throws ConfigurationError', async () => {
    await expect(s3.presignedGetUrl({ bucket: 'my-bucket', key: 'file.pdf' }, {}))
      .rejects.toBeInstanceOf(ConfigurationError);
  });

  it('presignedGetUrl — returns a URL string containing bucket and key', async () => {
    const url = await s3.presignedGetUrl(
      { bucket: 'my-bucket', key: 'reports/q1.pdf', expiresIn: 3600 },
      FAKE_S3_CREDS,
    );
    expect(typeof url).toBe('string');
    expect(url).toContain('my-bucket');
    expect(url).toContain('q1.pdf');
    expect(url).toContain('X-Amz');
  });

  it('presignedPutUrl — missing credentials → throws ConfigurationError', async () => {
    await expect(s3.presignedPutUrl({ bucket: 'my-bucket', key: 'upload.jpg' }, {}))
      .rejects.toBeInstanceOf(ConfigurationError);
  });

  it('presignedPutUrl — returns a signed URL string', async () => {
    const url = await s3.presignedPutUrl(
      { bucket: 'uploads', key: 'img.jpg', contentType: 'image/jpeg' },
      FAKE_S3_CREDS,
    );
    expect(typeof url).toBe('string');
    expect(url).toContain('uploads');
  });

  it('upload — missing credentials → throws ConfigurationError', async () => {
    await expect(s3.upload({ bucket: 'b', key: 'k', body: 'hello' }, {}))
      .rejects.toBeInstanceOf(ConfigurationError);
  });

  it('upload — success: PUTs signed request, returns { success, url }', async () => {
    mockPut.mockResolvedValueOnce({ status: 200, headers: { etag: '"abc123"' } });

    const result = await s3.upload(
      { bucket: 'my-bucket', key: 'file.txt', body: Buffer.from('hello') },
      FAKE_S3_CREDS,
    );
    expect(mockPut).toHaveBeenCalledTimes(1);
    const [url] = mockPut.mock.calls[0];
    expect(url).toContain('my-bucket');
    expect(result.success).toBe(true);
    expect(result.url).toContain('my-bucket');
  });

  it('upload — 403 → throws AuthError', async () => {
    mockPut.mockRejectedValueOnce(axiosError(403, 'Access Denied'));
    await expect(
      s3.upload({ bucket: 'b', key: 'k', body: 'data' }, FAKE_S3_CREDS),
    ).rejects.toBeInstanceOf(AuthError);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// PINECONE
// ═══════════════════════════════════════════════════════════════════════════

describe('Pinecone provider', () => {
  it('upsert — no apiKey → throws ConfigurationError', async () => {
    await expect(pinecone.upsert({ indexHost: PINECONE_HOST, vectors: [] }, ''))
      .rejects.toBeInstanceOf(ConfigurationError);
  });

  it('upsert — no indexHost → throws ConfigurationError', async () => {
    await expect(pinecone.upsert({ vectors: [] }, FAKE_KEY))
      .rejects.toBeInstanceOf(ConfigurationError);
  });

  it('upsert — success: POSTs to indexHost/vectors/upsert with Api-Key header', async () => {
    mockPost.mockResolvedValueOnce({ data: { upsertedCount: 3 } });

    const result = await pinecone.upsert(
      {
        indexHost: PINECONE_HOST,
        vectors: [
          { id: 'v1', values: [0.1, 0.2, 0.3] },
          { id: 'v2', values: [0.4, 0.5, 0.6] },
          { id: 'v3', values: [0.7, 0.8, 0.9] },
        ],
        namespace: 'prod',
      },
      FAKE_KEY,
    );

    expect(mockPost).toHaveBeenCalledTimes(1);
    const [url, body] = mockPost.mock.calls[0];
    expect(url).toBe(`https://${PINECONE_HOST}/vectors/upsert`);
    expect(body.vectors).toHaveLength(3);
    expect(body.namespace).toBe('prod');

    // Verify Api-Key header was set on the httpClient
    const { httpClient } = await import('../../src/core/http.js');
    const callHeaders = httpClient.mock.calls.at(-1)[0].headers;
    expect(callHeaders['Api-Key']).toBe(FAKE_KEY);

    expect(result.upsertedCount).toBe(3);
  });

  it('query — success: POSTs to indexHost/query, returns matches array', async () => {
    mockPost.mockResolvedValueOnce({
      data: {
        matches: [
          { id: 'v1', score: 0.98, metadata: { text: 'hello' } },
          { id: 'v2', score: 0.87, metadata: { text: 'world' } },
        ],
        namespace: '',
      },
    });

    const result = await pinecone.query(
      { indexHost: PINECONE_HOST, vector: [0.1, 0.2, 0.3], topK: 2 },
      FAKE_KEY,
    );

    expect(mockPost.mock.calls[0][0]).toBe(`https://${PINECONE_HOST}/query`);
    expect(result.matches).toHaveLength(2);
    expect(result.matches[0].score).toBe(0.98);
  });

  it('deleteVectors — success: POSTs to indexHost/vectors/delete', async () => {
    mockPost.mockResolvedValueOnce({ data: {} });

    const result = await pinecone.deleteVectors(
      { indexHost: PINECONE_HOST, ids: ['v1', 'v2'] },
      FAKE_KEY,
    );

    expect(mockPost.mock.calls[0][0]).toBe(`https://${PINECONE_HOST}/vectors/delete`);
    expect(result.success).toBe(true);
  });

  it('upsert — 429 → throws RateLimitError', async () => {
    mockPost.mockRejectedValueOnce(axiosError(429));
    await expect(
      pinecone.upsert({ indexHost: PINECONE_HOST, vectors: [] }, FAKE_KEY),
    ).rejects.toBeInstanceOf(RateLimitError);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// WEBHOOK VERIFY  (no HTTP mocking — pure crypto)
// ═══════════════════════════════════════════════════════════════════════════

describe('webhooks.verify — Stripe', () => {
  const SECRET = 'whsec_test_secret_bemora_enterprise';
  const PAYLOAD = JSON.stringify({ id: 'evt_123', type: 'charge.succeeded' });

  it('returns { valid: true } for a correctly signed payload', () => {
    const sig = stripeSignature(PAYLOAD, SECRET);
    const result = verifyStripeWebhook({ payload: PAYLOAD, signature: sig, secret: SECRET });
    expect(result.valid).toBe(true);
    expect(result.event?.type).toBe('charge.succeeded');
  });

  it('returns { valid: false } for a tampered payload', () => {
    const sig = stripeSignature(PAYLOAD, SECRET);
    const tampered = JSON.stringify({ id: 'evt_123', type: 'charge.refunded' });
    const result = verifyStripeWebhook({ payload: tampered, signature: sig, secret: SECRET });
    expect(result.valid).toBe(false);
  });

  it('returns { valid: false } for an expired timestamp (tolerance exceeded)', () => {
    const oldTs = Math.floor(Date.now() / 1000) - 600; // 10 minutes ago
    const sig = stripeSignature(PAYLOAD, SECRET, oldTs);
    const result = verifyStripeWebhook({ payload: PAYLOAD, signature: sig, secret: SECRET, tolerance: 300 });
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/tolerance/i);
  });

  it('returns { valid: false } for a missing signature header', () => {
    const result = verifyStripeWebhook({ payload: PAYLOAD, signature: '', secret: SECRET });
    expect(result.valid).toBe(false);
  });

  it('unified verify() dispatches to Stripe verifier', () => {
    const sig = stripeSignature(PAYLOAD, SECRET);
    const result = verify('stripe', { payload: PAYLOAD, signature: sig, secret: SECRET });
    expect(result.valid).toBe(true);
  });
});

describe('webhooks.verify — GitHub', () => {
  const SECRET = 'github_webhook_secret_test';
  const PAYLOAD = JSON.stringify({ action: 'opened', pull_request: { number: 42 } });

  it('returns true for a valid sha256 signature', () => {
    const sig = githubSignature(PAYLOAD, SECRET);
    expect(verifyGitHubWebhook({ payload: PAYLOAD, signature: sig, secret: SECRET })).toBe(true);
  });

  it('returns false for a tampered payload', () => {
    const sig = githubSignature(PAYLOAD, SECRET);
    const tampered = JSON.stringify({ action: 'closed' });
    expect(verifyGitHubWebhook({ payload: tampered, signature: sig, secret: SECRET })).toBe(false);
  });

  it('returns false for a completely wrong signature', () => {
    expect(verifyGitHubWebhook({ payload: PAYLOAD, signature: 'sha256=deadbeef', secret: SECRET })).toBe(false);
  });

  it('unified verify() dispatches to GitHub verifier', () => {
    const sig = githubSignature(PAYLOAD, SECRET);
    expect(verify('github', { payload: PAYLOAD, signature: sig, secret: SECRET })).toBe(true);
  });
});

describe('webhooks.verify — Twilio', () => {
  const AUTH_TOKEN = 'twilio_auth_token_test_bemora';
  const URL = 'https://myapp.example.com/webhooks/twilio';
  const PARAMS = { Body: 'Hello', From: '+15005550006', To: '+15005550001' };

  it('returns true for a valid Twilio HMAC-SHA1 signature', () => {
    const sig = twilioSignature(URL, PARAMS, AUTH_TOKEN);
    expect(verifyTwilioWebhook({ url: URL, params: PARAMS, signature: sig, authToken: AUTH_TOKEN })).toBe(true);
  });

  it('returns false for a tampered params object', () => {
    const sig = twilioSignature(URL, PARAMS, AUTH_TOKEN);
    const tampered = { ...PARAMS, Body: 'Tampered' };
    expect(verifyTwilioWebhook({ url: URL, params: tampered, signature: sig, authToken: AUTH_TOKEN })).toBe(false);
  });

  it('unified verify() dispatches to Twilio verifier', () => {
    const sig = twilioSignature(URL, PARAMS, AUTH_TOKEN);
    expect(verify('twilio', { url: URL, params: PARAMS, signature: sig, authToken: AUTH_TOKEN })).toBe(true);
  });
});

describe('webhooks.verify — unknown provider', () => {
  it('throws an error for an unsupported provider name', () => {
    expect(() => verify('unknown_provider', {})).toThrow(/Unknown provider/i);
  });
});
