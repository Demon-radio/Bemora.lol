/**
 * Unit tests for the provider fixes shipped after the first Provider Health
 * run (jobs/politics rewrites, basketball/sportsdb key gating, fandom/domain
 * browser-UA clients). HTTP layer mocked — no network, no real keys.
 */
import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';

const { mockGet, mockPost, mockCreate } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockPost: vi.fn(),
  mockCreate: vi.fn(),
}));

vi.mock('../../src/core/http.js', () => ({
  httpClient: vi.fn((opts) => {
    mockCreate(opts);
    return { get: mockGet, post: mockPost };
  }),
}));

import * as jobs from '../../src/providers/jobs.js';
import * as politics from '../../src/providers/politics.js';
import * as basketball from '../../src/providers/basketball.js';
import * as sportsdb from '../../src/providers/sportsdb.js';
import * as fandom from '../../src/providers/fandom.js';
import * as domain from '../../src/providers/domain.js';

beforeEach(() => {
  mockGet.mockReset();
  mockPost.mockReset();
  delete process.env.BEMORA_BALLDONTLIE_KEY;
  delete process.env.BEMORA_SPORTSDB_KEY;
});

afterAll(() => {
  delete process.env.BEMORA_BALLDONTLIE_KEY;
  delete process.env.BEMORA_SPORTSDB_KEY;
});

describe('jobs (Remotive backend)', () => {
  it('normalizes Remotive job rows', async () => {
    mockGet.mockResolvedValueOnce({
      data: {
        jobs: [
          { title: 'Frontend Dev', company_name: 'Acme', candidate_required_location: 'Worldwide', url: 'https://job/1', salary: '100k', category: 'Frontend', publication_date: '2026-01-01' },
          { title: 'Backend Dev', company_name: 'Globex', candidate_required_location: 'EU', url: 'https://job/2' },
        ],
      },
    });
    const result = await jobs.searchJobs({ query: 'dev', limit: 10 });
    expect(result.jobs[0]).toMatchObject({ title: 'Frontend Dev', company: 'Acme', location: 'Worldwide' });
    expect(result.count).toBe(2);
  });

  it('loads the search params and filters by location', async () => {
    mockGet.mockResolvedValueOnce({
      data: {
        jobs: [
          { title: 'EU role', company_name: 'A', candidate_required_location: 'Germany', url: 'u' },
          { title: 'anywhere', company_name: 'B', candidate_required_location: 'Worldwide', url: 'u' },
        ],
      },
    });
    const result = await jobs.searchJobs({ query: 'rust', location: 'germany', limit: 5 });
    expect(mockGet).toHaveBeenCalledWith('https://remotive.com/api/remote-jobs', expect.objectContaining({ params: expect.objectContaining({ search: 'rust' }) }));
    expect(result.jobs).toHaveLength(1);
    expect(result.jobs[0].title).toBe('EU role');
  });
});

describe('politics (static dataset)', () => {
  it('returns the full list without any HTTP call', async () => {
    const result = await politics.getPresidents();
    expect(result.count).toBe(47);
    expect(result.presidents[0]).toEqual({ number: 1, name: 'George Washington', party: 'Independent', start: 1789, end: 1797 });
    expect(result.presidents.at(-1)).toMatchObject({ number: 47, name: 'Donald Trump' });
    expect(mockGet).not.toHaveBeenCalled();
    expect(result._cached).toBe(false);
  });

  it('Grover Cleveland appears twice (22nd & 24th) and filters work', async () => {
    const all = await politics.getPresidents();
    const cleveland = all.presidents.filter((p) => p.name === 'Grover Cleveland');
    expect(cleveland.map((p) => p.number)).toEqual([22, 24]);

    const byParty = await politics.getPresidents({ party: 'republican' });
    expect(byParty.count).toBeGreaterThan(0);
    for (const p of byParty.presidents) expect(p.party).toBe('Republican');

    const byName = await politics.getPresidents({ name: 'lincoln' });
    expect(byName.presidents[0].name).toBe('Abraham Lincoln');
  });
});

describe('basketball (keyed balldontlie)', () => {
  it('throws ConfigurationError without a key', async () => {
    await expect(basketball.getNBATeams()).rejects.toThrow(/BEMORA_BALLDONTLIE_KEY/);
    expect(mockGet).not.toHaveBeenCalled();
  });

  it('uses the new api.balldontlie.io endpoint with an Authorization header', async () => {
    process.env.BEMORA_BALLDONTLIE_KEY = 'bd-test-key';
    mockGet.mockResolvedValueOnce({ data: { data: [{ id: 1, full_name: 'Atlanta Hawks' }] } });
    const result = await basketball.getNBATeams();
    expect(mockGet).toHaveBeenCalledWith('https://api.balldontlie.io/nba/v1/teams');
    expect(result.teams[0].full_name).toBe('Atlanta Hawks');
    // httpClient() is also invoked at module load by other providers, so scan
    // every recorded call for the keyed client instead of matching any call.
    const bdCall = mockCreate.mock.calls.find((c) => c?.[0]?.headers?.Authorization === 'bd-test-key');
    expect(bdCall).toBeTruthy();
  });
});

describe('sportsdb (personal test key)', () => {
  it('throws ConfigurationError without a key', async () => {
    await expect(sportsdb.searchTeam({ name: 'Arsenal' })).rejects.toThrow(/BEMORA_SPORTSDB_KEY/);
    expect(mockGet).not.toHaveBeenCalled();
  });

  it('builds URLs with the personal key embedded', async () => {
    process.env.BEMORA_SPORTSDB_KEY = 'sd-test-key';
    mockGet.mockResolvedValueOnce({ data: { teams: [{ strTeam: 'Arsenal', strLeague: 'Premier League', strSport: 'Soccer' }] } });
    const result = await sportsdb.searchTeam({ name: 'Arsenal' });
    expect(mockGet).toHaveBeenCalledWith('https://www.thesportsdb.com/api/v1/json/sd-test-key/searchteams.php', expect.objectContaining({ params: { t: 'Arsenal' } }));
    expect(result.teams[0].name).toBe('Arsenal');
  });
});

describe('fandom (browser UA client)', () => {
  it('searches a wiki and builds result URLs', async () => {
    mockGet.mockResolvedValueOnce({
      data: { total: 1, items: [{ id: 628, title: 'Creeper', snippet: 'explosive mob' }] },
    });
    const result = await fandom.search({ wiki: 'minecraft', query: 'creeper', limit: 2 });
    expect(result.results[0].url).toContain('minecraft.fandom.com/wiki/Creeper');
    // The Cloudflare-passing UA must be configured on the client. httpClient()
    // is also invoked at module load by other providers, so scan every
    // recorded call instead of relying on matcher semantics.
    const uaCall = mockCreate.mock.calls.find((c) => String(c?.[0]?.headers?.['User-Agent'] || '').includes('Mozilla/5.0'));
    expect(uaCall).toBeTruthy();
  });

  it('rejects malformed wiki names', async () => {
    await expect(fandom.search({ wiki: 'bad wiki', query: 'x' })).rejects.toThrow(/Invalid wiki name/);
  });
});

describe('domain (whois via rdap.org)', () => {
  it('maps RDAP fields and keeps a 20s client timeout', async () => {
    mockGet.mockResolvedValueOnce({
      data: { handle: 'EXAMPLE-DOM', status: ['client delete prohibited'], nameservers: [{ ldhName: 'a.iana-servers.net' }], events: [{ eventAction: 'expiration', eventDate: '2027-01-01' }] },
    });
    const result = await domain.whois({ domain: 'example.com' });
    expect(result.handle).toBe('EXAMPLE-DOM');
    expect(result.nameservers).toEqual(['a.iana-servers.net']);
    const slowCall = mockCreate.mock.calls.find((c) => c?.[0]?.timeout === 20000);
    expect(slowCall).toBeTruthy();
  });

  it('resolves DNS locally without HTTP', async () => {
    await expect(domain.resolveIp({ domain: 'localhost' })).resolves.toBeTruthy();
  });
});
