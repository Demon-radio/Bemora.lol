/**
 * Multipart/form-data upload helper.
 *
 * Supports:
 *   - S3 presigned POST (multipart upload)
 *   - Cloudinary
 *   - Generic multipart form uploads
 *
 * Usage:
 *   import { upload, uploadPresignedPost } from '../core/upload.js';
 *
 *   // Generic multipart
 *   const result = await upload(url, fileBuffer, {
 *     filename: 'photo.jpg',
 *     contentType: 'image/jpeg',
 *     fields: { acl: 'public-read' },
 *     headers: { Authorization: 'Bearer ...' },
 *   });
 *
 *   // S3 presigned POST
 *   const s3Result = await uploadPresignedPost({
 *     url: presignedPost.url,
 *     fields: presignedPost.fields,
 *     file: buffer,
 *     filename: 'upload.pdf',
 *   });
 */

import { httpClient } from './http.js';
import { ProviderError } from './errors.js';

/**
 * Upload a file as multipart/form-data.
 *
 * @param {string} url - upload endpoint
 * @param {Buffer|Uint8Array|string} file - file content
 * @param {object} [opts]
 * @param {string} [opts.filename='upload'] - file name for the form field
 * @param {string} [opts.contentType='application/octet-stream'] - MIME type
 * @param {string} [opts.fieldName='file'] - form field name for the file
 * @param {object} [opts.fields={}] - additional form fields (e.g. S3 policy fields)
 * @param {object} [opts.headers={}] - extra request headers
 * @param {number} [opts.timeout=120000] - upload timeout in ms
 * @param {AbortSignal} [opts.signal] - abort signal
 * @returns {Promise<{ success: boolean, status: number, data: any }>}
 */
export async function upload(url, file, {
  filename = 'upload',
  contentType = 'application/octet-stream',
  fieldName = 'file',
  fields = {},
  headers = {},
  timeout = 120_000,
  signal,
} = {}) {
  try {
    // Build FormData using the native FormData API (Node 18+) or a blob
    const formData = new FormData();

    // Append regular fields first (required by S3)
    for (const [k, v] of Object.entries(fields)) {
      formData.append(k, v);
    }

    // Append the file
    const blob = new Blob([file], { type: contentType });
    formData.append(fieldName, blob, filename);

    const http = httpClient({ timeout, headers });
    const { status, data } = await http.post(url, formData, {
      signal,
      // Let axios set the Content-Type with boundary automatically
      transformRequest: [(d) => d],
    });

    return { success: status >= 200 && status < 300, status, data };
  } catch (err) {
    throw new ProviderError(`[upload] Upload to ${url} failed: ${err.message}`, { cause: err });
  }
}

/**
 * Upload to S3 using a presigned POST (pre-constructed by the server).
 * S3 requires fields to come BEFORE the file in the form body.
 *
 * @param {{ url: string, fields: object, file: Buffer|Uint8Array, filename?: string, contentType?: string, signal?: AbortSignal }} params
 */
export async function uploadPresignedPost({ url, fields = {}, file, filename = 'upload', contentType = 'application/octet-stream', signal } = {}) {
  return upload(url, file, {
    filename,
    contentType,
    fieldName: 'file',
    fields,
    signal,
  });
}

/**
 * Upload to Cloudinary using their unsigned upload API.
 *
 * @param {{ file: Buffer|string, uploadPreset: string, cloudName: string, folder?: string, signal?: AbortSignal }} params
 */
export async function uploadCloudinary({ file, uploadPreset, cloudName, folder, signal } = {}) {
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;
  return upload(url, file, {
    filename: 'upload',
    fieldName: 'file',
    fields: {
      upload_preset: uploadPreset,
      ...(folder && { folder }),
    },
    signal,
  });
}

/**
 * Stream a remote URL to an upload endpoint (pipe-through upload).
 * Useful for re-uploading without downloading locally.
 *
 * @param {{ sourceUrl: string, uploadUrl: string, filename?: string, contentType?: string, fields?: object, headers?: object, signal?: AbortSignal }} params
 */
export async function uploadFromUrl({ sourceUrl, uploadUrl, filename = 'upload', contentType = 'application/octet-stream', fields = {}, headers = {}, signal } = {}) {
  // Download the source
  const http = httpClient({ timeout: 60_000 });
  const { data: fileBuffer } = await http.get(sourceUrl, { responseType: 'arraybuffer', signal });

  return upload(uploadUrl, Buffer.from(fileBuffer), {
    filename,
    contentType,
    fields,
    headers,
    signal,
  });
}
