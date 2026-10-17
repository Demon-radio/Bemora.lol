/**
 * Unit tests for the additional free/keyless providers.
 * HTTP layer mocked — no network, no keys.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockGet, mockPost } = vi.hoisted(() => ({ mockGet: vi.fn(), mockPost: vi.fn() }));

vi.mock('../../src/core/http.js', () => ({
  httpClient: vi.fn(() => ({ get: mockGet, post: mockPost })),
}));

import * as dns from '../../src/providers/dns.js';
import * as geocoding from '../../src/providers/geocoding.js';
import * as earth from '../../src/providers/earth.js';
import * as metno from '../../src/providers/metno.js';
import * as nws from '../../src/providers/nws.js';
import * as water from '../../src/providers/water.js';
import * as opensky from '../../src/providers/opensky.js';
import * as adsb from '../../src/providers/adsb.js';
import * as launches from '../../src/providers/launches.js';
import * as eonet from '../../src/providers/eonet.js';
import * as biomed from '../../src/providers/biomed.js';
import * as fda from '../../src/providers/fda.js';
import * as grammar from '../../src/providers/grammar.js';
import * as devto from '../../src/providers/devto.js';
import * as bluesky from '../../src/providers/bluesky.js';
import * as lobsters from '../../src/providers/lobsters.js';
import * as spacenews from '../../src/providers/spacenews.js';
import * as treasury from '../../src/providers/treasury.js';
import * as coinbase from '../../src/providers/coinbase.js';
import * as demographics from '../../src/providers/demographics.js';
import * as poetry from '../../src/providers/poetry.js';
import * as vehicles from '../../src/providers/vehicles.js';

beforeEach(() => {
  mockGet.mockReset();
  mockPost.mockReset();
});

describe('dns', () => {
  it('falls back to Google when Cloudflare fails', async () => {
    mockGet
      .mockRejectedValueOnce(new Error('cloudflare down'))
      .mockResolvedValueOnce({ data: { Status: 0, Answer: [{ name: 'x.com', type: 1, TTL: 60, data: '1.2.3.4' }] } });
    const result = await dns.resolve({ name: 'fallback-test.com', type: 'A' });
    expect(result.status).toBe('NOERROR');
    expect(result.answers[0].data).toBe('1.2.3.4');
    expect(mockGet.mock.calls[1][0]).toContain('dns.google');
  });

  it('maps an MX query into a records list', async () => {
    mockGet.mockResolvedValueOnce({ data: { Status: 0, Answer: [{ name: 'x.com', type: 15, TTL: 60, data: '10 mx.x.com.' }] } });
    const result = await dns.mx({ name: 'mx-test.com' });
    expect(result.records).toEqual(['10 mx.x.com.']);
  });
});

describe('geocoding', () => {
  it('normalizes Open-Meteo geocoding results', async () => {
    mockGet.mockResolvedValueOnce({
      data: { results: [{ name: 'Cairo', country: 'Egypt', country_code: 'EG', latitude: 30, longitude: 31 }] },
    });
    const result = await geocoding.search({ name: 'geo-test' });
    expect(result.count).toBe(1);
    expect(result.results[0].country_code).toBe('EG');
  });
});

describe('earth', () => {
  it('extracts elevation', async () => {
    mockGet.mockResolvedValueOnce({ data: { elevation: [29] } });
    const result = await earth.elevation({ lat: 1, lon: 2 });
    expect(result.elevation_m).toBe(29);
  });

  it('extracts river discharge', async () => {
    mockGet.mockResolvedValueOnce({ data: { daily: { time: ['2020-01-01'], river_discharge: [5] } } });
    const result = await earth.flood({ lat: 1, lon: 2, days: 1 });
    expect(result.river_discharge).toEqual([5]);
  });
});

describe('metno', () => {
  it('normalizes the forecast timeseries', async () => {
    mockGet.mockResolvedValueOnce({
      data: {
        properties: {
          meta: { updated_at: 'now' },
          timeseries: [{ time: 't', data: { instant: { details: { air_temperature: 20 } } } }],
        },
      },
    });
    const result = await metno.forecast({ lat: 1, lon: 2 });
    expect(result.timeseries[0].temperature).toBe(20);
  });
});

describe('nws', () => {
  it('resolves points then fetches the forecast', async () => {
    mockGet
      .mockResolvedValueOnce({ data: { properties: { forecast: 'https://api.weather.gov/gridpoints/X/1,2/forecast' } } })
      .mockResolvedValueOnce({ data: { properties: { periods: [{ name: 'Today', temperature: 80, temperatureUnit: 'F', isDaytime: true }] } } });
    const result = await nws.forecast({ lat: 1, lon: 2 });
    expect(result.periods[0].temperature).toBe(80);
  });
});

describe('water', () => {
  it('maps USGS time series', async () => {
    mockGet.mockResolvedValueOnce({
      data: { value: { timeSeries: [{ sourceInfo: { siteName: 'S' }, variable: { variableDescription: 'D' }, values: [{ value: [{ value: '1.5', dateTime: 't' }] }] }] } },
    });
    const result = await water.usgs({ site: '123' });
    expect(result.sites[0].values[0].value).toBe(1.5);
  });
});

describe('opensky', () => {
  it('maps array state vectors and passes a bounding box', async () => {
    mockGet.mockResolvedValueOnce({ data: { time: 1, states: [['abc', 'BAW1 ', 'UK', null, null, 1, 2, 3, false, 4, 5]] } });
    const result = await opensky.states({ bbox: { lamin: 1, lomin: 2, lamax: 3, lomax: 4 } });
    expect(result.states[0].callsign).toBe('BAW1');
    expect(mockGet.mock.calls[0][1].params.lamin).toBe(1);
  });
});

describe('adsb', () => {
  it('reports not-found for unknown aircraft', async () => {
    mockGet.mockResolvedValueOnce({ data: { response: {} } });
    const result = await adsb.aircraft({ icao: 'nomatch' });
    expect(result.found).toBe(false);
  });
});

describe('launches', () => {
  it('normalizes a launch list', async () => {
    mockGet.mockResolvedValueOnce({
      data: { results: [{ id: '1', name: 'F9', status: { abbrev: 'Go', name: 'Go' }, rocket: { configuration: { name: 'Falcon 9' } } }] },
    });
    const result = await launches.upcoming({ limit: 1 });
    expect(result.launches[0].rocket).toBe('Falcon 9');
    expect(result.launches[0].status).toBe('Go');
  });
});

describe('eonet', () => {
  it('normalizes an event', async () => {
    mockGet.mockResolvedValueOnce({
      data: { events: [{ id: 'E1', title: 'Fire', categories: [{ title: 'Wildfires' }], geometry: [] }] },
    });
    const result = await eonet.events({ limit: 1 });
    expect(result.events[0].category).toEqual(['Wildfires']);
  });

  it('targets a category endpoint', async () => {
    mockGet.mockResolvedValueOnce({ data: { events: [] } });
    await eonet.volcanoes({ limit: 1 });
    expect(mockGet.mock.calls[0][0]).toContain('/categories/volcanoes');
  });
});

describe('biomed', () => {
  it('searches then summarizes PubMed', async () => {
    mockGet
      .mockResolvedValueOnce({ data: { esearchresult: { count: '1', idlist: ['123'] } } })
      .mockResolvedValueOnce({ data: { result: { 123: { title: 'T', pubdate: '2020', source: 'J', authors: [{ name: 'A' }] } } } });
    const result = await biomed.pubmedSearch({ query: 'x', limit: 1 });
    expect(result.count).toBe(1);
    expect(result.articles[0].title).toBe('T');
  });

  it('maps Europe PMC results', async () => {
    mockGet.mockResolvedValueOnce({ data: { hitCount: 2, resultList: { result: [{ id: '1', title: 'P', source: 'MED' }] } } });
    const result = await biomed.europePmc({ query: 'x' });
    expect(result.count).toBe(2);
    expect(result.articles[0].source).toBe('MED');
  });

  it('maps ClinicalTrials v2 studies', async () => {
    mockGet.mockResolvedValueOnce({
      data: { studies: [{ protocolSection: { identificationModule: { nctId: 'NCT1', briefTitle: 'T' } } }] },
    });
    const result = await biomed.clinicalTrials({ query: 'x' });
    expect(result.trials[0].nct_id).toBe('NCT1');
  });
});

describe('fda', () => {
  it('returns an empty result set on HTTP 404', async () => {
    const err = new Error('not found');
    err.response = { status: 404 };
    mockGet.mockRejectedValueOnce(err);
    const result = await fda.foodRecalls({ search: 'nomatch' });
    expect(result).toEqual({ count: 0, results: [], _cached: false });
  });

  it('normalizes drug event reports', async () => {
    mockGet.mockResolvedValueOnce({ data: { meta: { results: { total: 5 } }, results: [{ safetyreportid: '1', patient: { reaction: [{ reactionmeddrapt: 'Nausea' }] } }] } });
    const result = await fda.drugEvents({ limit: 1 });
    expect(result.count).toBe(5);
    expect(result.results[0].patient.reaction).toEqual(['Nausea']);
  });
});

describe('grammar', () => {
  it('posts form data and normalizes matches', async () => {
    mockPost.mockResolvedValueOnce({ data: { matches: [{ message: 'm', offset: 1, length: 2, replacements: [{ value: 'x' }], rule: { id: 'R' } }] } });
    const result = await grammar.check({ text: 'bad text' });
    expect(result.match_count).toBe(1);
    expect(result.matches[0].replacements).toEqual(['x']);
    expect(mockPost.mock.calls[0][0]).toContain('languagetool');
  });
});

describe('devto', () => {
  it('normalizes articles', async () => {
    mockGet.mockResolvedValueOnce({ data: [{ id: 1, title: 'T', user: { name: 'A', username: 'a' }, tag_list: ['x'] }] });
    const result = await devto.articles({ tag: 'x' });
    expect(result.articles[0].author).toBe('A');
    expect(result.articles[0].tags).toEqual(['x']);
  });
});

describe('bluesky', () => {
  it('normalizes a profile', async () => {
    mockGet.mockResolvedValueOnce({ data: { did: 'did:1', handle: 'h', followersCount: 3 } });
    const result = await bluesky.profile({ actor: 'h' });
    expect(result.followers).toBe(3);
  });
});

describe('lobsters', () => {
  it('normalizes stories', async () => {
    mockGet.mockResolvedValueOnce({ data: [{ short_id: 'a', title: 'T', score: 1, tags: ['x'] }] });
    const result = await lobsters.hottest();
    expect(result.stories[0].short_id).toBe('a');
  });
});

describe('spacenews', () => {
  it('normalizes articles', async () => {
    mockGet.mockResolvedValueOnce({ data: { count: 1, results: [{ id: 1, title: 'T', news_site: 'S' }] } });
    const result = await spacenews.articles({ limit: 1 });
    expect(result.count).toBe(1);
    expect(result.articles[0].news_site).toBe('S');
  });
});

describe('treasury', () => {
  it('returns debt records and total count', async () => {
    mockGet.mockResolvedValueOnce({ data: { meta: { total_count: 9 }, data: [{ record_date: '2020-01-01' }] } });
    const result = await treasury.debtToPenny({ limit: 1 });
    expect(result.count).toBe(9);
    expect(result.records).toHaveLength(1);
  });
});

describe('coinbase', () => {
  it('parses the spot amount to a number', async () => {
    mockGet.mockResolvedValueOnce({ data: { data: { base: 'BTC', currency: 'USD', amount: '81321.51' } } });
    const result = await coinbase.spot({ pair: 'BTC-USD' });
    expect(result.amount).toBe(81321.51);
  });
});

describe('demographics', () => {
  it('normalizes nationality countries', async () => {
    mockGet.mockResolvedValueOnce({ data: { count: 1, country: [{ country_id: 'US', probability: 0.5 }] } });
    const result = await demographics.nationality({ name: 'x' });
    expect(result.countries[0].country_id).toBe('US');
  });
});

describe('poetry', () => {
  it('normalizes poems', async () => {
    mockGet.mockResolvedValueOnce({ data: [{ title: 'T', author: 'A', linecount: '8', lines: ['l'] }] });
    const result = await poetry.random({ limit: 1 });
    expect(result.poems[0].line_count).toBe(8);
  });

  it('returns an empty list for the PoetryDB error envelope', async () => {
    mockGet.mockResolvedValueOnce({ data: [{ status: 404, reason: 'Not found' }] });
    const result = await poetry.byAuthor({ author: 'Nobody' });
    expect(result.poems).toEqual([]);
  });
});

describe('vehicles', () => {
  it('decodes a VIN into vehicle attributes', async () => {
    mockGet.mockResolvedValueOnce({
      data: { Results: [{ Make: 'HONDA', Model: 'Accord', ModelYear: '2003', ErrorText: '0 - OK' }] },
    });
    const result = await vehicles.vinDecode({ vin: 'X' });
    expect(result.make).toBe('HONDA');
    expect(result.errors).toEqual(['0 - OK']);
  });

  it('normalizes recalls', async () => {
    mockGet.mockResolvedValueOnce({ data: { Count: 1, results: [{ NHTSACampaignNumber: '12V1', Component: 'AIR BAG' }] } });
    const result = await vehicles.recalls({ make: 'honda', model: 'accord', year: 2003 });
    expect(result.count).toBe(1);
    expect(result.recalls[0].campaign_number).toBe('12V1');
  });
});
