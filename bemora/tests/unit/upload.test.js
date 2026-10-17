import { describe, it, expect, vi, beforeEach } from 'vitest';
import { upload, uploadPresignedPost, uploadCloudinary } from '../../src/core/upload.js';

// ── mock httpClient ───────────────────────────────────────────────────────────

vi.mock('../../src/core/http.js', () => ({
  httpClient: vi.fn(),
  setTracingHeadersProvider: vi.fn(),
}));

import { httpClient } from '../../src/core/http.js';

const UPLOAD_URL = 'https://upload.example.com/files';

function makeHttp(status = 200, data = { id: 'abc' }) {
  return { post: vi.fn().mockResolvedValue({ status, data }), get: vi.fn() };
}

// ── upload() ──────────────────────────────────────────────────────────────────

describe('upload()', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns { success: true, status, data } on 200', async () => {
    httpClient.mockReturnValue(makeHttp(200, { id: 'file_1' }));
    const result = await upload(UPLOAD_URL, Buffer.from('hello'), { filename: 'hello.txt' });
    expect(result.success).toBe(true);
    expect(result.status).toBe(200);
    expect(result.data).toEqual({ id: 'file_1' });
  });

  it('returns { success: false } on 4xx', async () => {
    httpClient.mockReturnValue(makeHttp(400, {}));
    const result = await upload(UPLOAD_URL, Buffer.from('bad'));
    expect(result.success).toBe(false);
  });

  it('throws ProviderError on network failure', async () => {
    httpClient.mockReturnValue({ post: vi.fn().mockRejectedValue(new Error('timeout')) });
    await expect(upload(UPLOAD_URL, Buffer.from('data'))).rejects.toThrow('timeout');
  });
});

// ── uploadPresignedPost() ─────────────────────────────────────────────────────

describe('uploadPresignedPost()', () => {
  beforeEach(() => vi.clearAllMocks());

  it('delegates to upload() with the given fields', async () => {
    httpClient.mockReturnValue(makeHttp(204, {}));
    const result = await uploadPresignedPost({
      url: 'https://s3.amazonaws.com/mybucket',
      fields: { key: 'uploads/file.pdf', acl: 'public-read' },
      file: Buffer.from('%PDF-1.4'),
      filename: 'file.pdf',
    });
    expect(result.success).toBe(true);
  });
});

// ── uploadCloudinary() ────────────────────────────────────────────────────────

describe('uploadCloudinary()', () => {
  beforeEach(() => vi.clearAllMocks());

  it('posts to the correct Cloudinary URL', async () => {
    const mockHttp = makeHttp(200, { public_id: 'img_001' });
    httpClient.mockReturnValue(mockHttp);
    const result = await uploadCloudinary({
      file: Buffer.from('imgdata'),
      uploadPreset: 'ml_default',
      cloudName: 'mycloud',
    });
    expect(result.success).toBe(true);
    const [url] = mockHttp.post.mock.calls[0];
    expect(url).toContain('mycloud');
    expect(url).toContain('cloudinary.com');
  });
});
