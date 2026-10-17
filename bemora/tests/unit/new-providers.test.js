/**
 * New providers: scholarly (OpenAlex + Crossref) and registry (PyPI + npm + OSV).
 * HTTP layer mocked — no network, no keys.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockGet, mockPost } = vi.hoisted(() => ({ mockGet: vi.fn(), mockPost: vi.fn() }));

vi.mock('../../src/core/http.js', () => ({
  httpClient: vi.fn(() => ({ get: mockGet, post: mockPost })),
}));

import * as scholarly from '../../src/providers/scholarly.js';
import * as registry from '../../src/providers/registry.js';
import { ValidationError } from '../../src/core/errors.js';

beforeEach(() => {
  mockGet.mockReset();
  mockPost.mockReset();
});

describe('scholarly', () => {
  it('searchWorks normalizes OpenAlex works', async () => {
    mockGet.mockResolvedValueOnce({
      data: {
        meta: { count: 1 },
        results: [
          {
            id: 'https://openalex.org/W1',
            doi: 'https://doi.org/10.1234/x',
            title: 'Test Paper',
            publication_year: 2023,
            primary_location: { source: { display_name: 'Test Conf' } },
            authorships: [{ author: { display_name: 'A Uthor' }, institutions: [{ display_name: 'Uni' }] }],
            cited_by_count: 42,
            topics: [{ display_name: 'ML' }],
          },
        ],
      },
    });
    const r = await scholarly.searchWorks({ query: 'test' });
    expect(r.total).toBe(1);
    expect(r.works[0].title).toBe('Test Paper');
    expect(r.works[0].authors).toEqual(['A Uthor']);
    expect(r.works[0].cited_by_count).toBe(42);
    expect(mockGet.mock.calls[0][0]).toBe('https://api.openalex.org/works');
  });

  it('searchWorks rejects empty query', async () => {
    await expect(scholarly.searchWorks({ query: '' })).rejects.toBeInstanceOf(ValidationError);
    expect(mockGet).not.toHaveBeenCalled();
  });

  it('getWork strips DOI URLs', async () => {
    mockGet.mockResolvedValueOnce({ data: { id: 'W1', title: 'T', authorships: [] } });
    await scholarly.getWork({ id: 'https://doi.org/10.1234/x' });
    expect(mockGet.mock.calls[0][0]).toContain('10.1234%2Fx');
  });

  it('crossrefSearch + doiMetadata normalize Crossref shape', async () => {
    mockGet.mockResolvedValueOnce({
      data: {
        message: {
          'total-results': 1,
          items: [
            {
              DOI: '10.1/x',
              title: ['Paper'],
              author: [{ given: 'Jane', family: 'Doe' }],
              publisher: 'P',
              URL: 'https://doi.org/10.1/x',
            },
          ],
        },
      },
    });
    const r = await scholarly.crossrefSearch({ query: 'x' });
    expect(r.works[0].authors).toEqual(['Jane Doe']);

    mockGet.mockResolvedValueOnce({ data: { message: { DOI: '10.1/x', title: ['Paper'] } } });
    const d = await scholarly.doiMetadata({ doi: '10.1/x' });
    expect(d.doi).toBe('10.1/x');
  });

  it('doiMetadata rejects missing doi', async () => {
    await expect(scholarly.doiMetadata({})).rejects.toBeInstanceOf(ValidationError);
  });
});

describe('registry', () => {
  it('pypiInfo normalizes package metadata', async () => {
    mockGet.mockResolvedValueOnce({
      data: { info: { version: '2.0', summary: 's', author: 'a', license: 'MIT' }, releases: { 1: 1, 2: 1 } },
    });
    const r = await registry.pypiInfo({ package: 'x' });
    expect(r.version).toBe('2.0');
    expect(r.release_count).toBe(2);
  });

  it('npmInfo normalizes latest metadata', async () => {
    mockGet.mockResolvedValueOnce({ data: { version: '1.0', dependencies: { a: '1' } } });
    const r = await registry.npmInfo({ package: 'x' });
    expect(r.dependencies).toEqual({ a: '1' });
  });

  it('osvQuery reports vulns with fixed versions', async () => {
    mockPost.mockResolvedValueOnce({
      data: {
        vulns: [
          {
            id: 'GHSA-1',
            summary: 's',
            severity: [{ type: 'CVSS_V3', score: '7.5' }],
            affected: [{ ranges: [{ events: [{ fixed: '2.0' }] }] }],
            references: [{ url: 'https://x' }],
          },
        ],
      },
    });
    const r = await registry.osvQuery({ ecosystem: 'PyPI', package: 'x', version: '1.0' });
    expect(r.vulnerable).toBe(true);
    expect(r.vulns[0].fixed).toEqual(['2.0']);
  });

  it('osvQuery reports clean versions', async () => {
    mockPost.mockResolvedValueOnce({ data: {} });
    const r = await registry.osvQuery({ ecosystem: 'npm', package: 'x', version: '9.9.9' });
    expect(r.vulnerable).toBe(false);
    expect(r.vulns).toEqual([]);
  });

  it('missing params throw ValidationError before HTTP', async () => {
    await expect(registry.pypiInfo({})).rejects.toBeInstanceOf(ValidationError);
    await expect(registry.npmInfo({})).rejects.toBeInstanceOf(ValidationError);
    await expect(registry.osvQuery({ ecosystem: 'npm' })).rejects.toBeInstanceOf(ValidationError);
    expect(mockGet).not.toHaveBeenCalled();
    expect(mockPost).not.toHaveBeenCalled();
  });
});
