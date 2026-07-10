/**
 * SSRF guard tests for websites.js.
 * Verifies that private / loopback / internal URLs are blocked before any
 * network call is made.
 */
import { describe, it, expect, vi } from 'vitest';
import { status, detectTechStack, getMeta } from '../../src/providers/websites.js';
import { ValidationError } from '../../src/core/errors.js';

// Prevent real HTTP calls; SSRF tests should throw before reaching the client.
vi.mock('../../src/core/http.js', () => ({
  httpClient: vi.fn(() => ({
    get: vi.fn().mockRejectedValue(new Error('Should not reach network')),
  })),
  setTracingHeadersProvider: vi.fn(),
}));

const SSRF_CASES = [
  'http://127.0.0.1',
  'http://127.0.0.1:8080/admin',
  'http://localhost',
  'http://localhost:3000',
  'http://0.0.0.0',
  'http://10.0.0.1',
  'http://10.255.255.255',
  'http://172.16.0.1',
  'http://172.31.255.255',
  'http://192.168.1.1',
  'http://169.254.169.254',         // AWS metadata endpoint
  'http://169.254.169.254/latest/meta-data/',
];

describe('websites — SSRF guard', () => {
  for (const url of SSRF_CASES) {
    it(`blocks ${url}`, async () => {
      await expect(status({ url })).rejects.toBeInstanceOf(ValidationError);
    });
  }

  it('blocks non-http/https protocols (file://)', async () => {
    await expect(status({ url: 'file:///etc/passwd' })).rejects.toBeInstanceOf(ValidationError);
  });

  it('blocks non-http/https protocols (ftp://)', async () => {
    await expect(status({ url: 'ftp://example.com' })).rejects.toBeInstanceOf(ValidationError);
  });

  it('allows legitimate public URLs', async () => {
    const { httpClient } = await import('../../src/core/http.js');
    httpClient.mockReturnValue({
      get: vi.fn().mockResolvedValue({
        status: 200,
        headers: { 'content-type': 'text/html' },
      }),
    });
    // Should not throw — call will succeed or reject due to mock, but NOT ValidationError
    const result = await status({ url: 'https://example.com' }).catch((e) => e);
    expect(result).not.toBeInstanceOf(ValidationError);
  });

  it('detectTechStack also blocks SSRF URLs', async () => {
    await expect(detectTechStack({ url: 'http://192.168.0.1' })).rejects.toBeInstanceOf(ValidationError);
  });

  it('getMeta also blocks SSRF URLs', async () => {
    await expect(getMeta({ url: 'http://10.0.0.1' })).rejects.toBeInstanceOf(ValidationError);
  });
});
