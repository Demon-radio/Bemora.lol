/**
 * Unit tests for the second batch of free/keyless providers.
 * HTTP layer mocked — no network, no keys.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockGet, mockPost } = vi.hoisted(() => ({ mockGet: vi.fn(), mockPost: vi.fn() }));

vi.mock('../../src/core/http.js', () => ({
  httpClient: vi.fn(() => ({ get: mockGet, post: mockPost })),
}));

import * as coinpaprika from '../../src/providers/coinpaprika.js';
import * as coinlore from '../../src/providers/coinlore.js';
import * as kraken from '../../src/providers/kraken.js';
import * as defillama from '../../src/providers/defillama.js';
import * as mempool from '../../src/providers/mempool.js';
import * as blockchair from '../../src/providers/blockchair.js';
import * as exchangerate from '../../src/providers/exchangerate.js';
import * as nbp from '../../src/providers/nbp.js';
import * as imf from '../../src/providers/imf.js';
import * as eurostat from '../../src/providers/eurostat.js';
import * as aviationwx from '../../src/providers/aviationwx.js';
import * as tides from '../../src/providers/tides.js';
import * as carbon from '../../src/providers/carbon.js';
import * as spaceweather from '../../src/providers/spaceweather.js';
import * as citybikes from '../../src/providers/citybikes.js';
import * as transit from '../../src/providers/transit.js';
import * as tvmaze from '../../src/providers/tvmaze.js';
import * as deezer from '../../src/providers/deezer.js';
import * as anilist from '../../src/providers/anilist.js';
import * as kitsu from '../../src/providers/kitsu.js';
import * as ghibli from '../../src/providers/ghibli.js';
import * as pollinations from '../../src/providers/pollinations.js';
import * as quickchart from '../../src/providers/quickchart.js';
import * as speech from '../../src/providers/speech.js';
import * as pubchem from '../../src/providers/pubchem.js';
import * as rxnav from '../../src/providers/rxnav.js';
import * as uniprot from '../../src/providers/uniprot.js';
import * as ensembl from '../../src/providers/ensembl.js';
import * as gho from '../../src/providers/gho.js';
import * as icd10 from '../../src/providers/icd10.js';
import * as exoplanet from '../../src/providers/exoplanet.js';
import * as packages from '../../src/providers/packages.js';
import * as certs from '../../src/providers/certs.js';
import * as httptool from '../../src/providers/httptool.js';
import * as photon from '../../src/providers/photon.js';
import * as postcodes from '../../src/providers/postcodes.js';
import * as census from '../../src/providers/census.js';
import * as archiveorg from '../../src/providers/archiveorg.js';
import * as gdacs from '../../src/providers/gdacs.js';
import * as reader from '../../src/providers/reader.js';
import * as statuspage from '../../src/providers/status.js';
import * as macaddress from '../../src/providers/macaddress.js';

beforeEach(() => {
  mockGet.mockReset();
  mockPost.mockReset();
});

describe('coinpaprika', () => {
  it('normalizes ticker list', async () => {
    mockGet.mockResolvedValueOnce({
      data: [{ id: 'btc-bitcoin', name: 'Bitcoin', symbol: 'BTC', rank: 1, price_usd: 50000, percent_change_24h: 1, market_cap_usd: 1000 }],
    });
    const result = await coinpaprika.tickers();
    expect(result.tickers[0].symbol).toBe('BTC');
  });

  it('normalizes a single ticker', async () => {
    mockGet.mockResolvedValueOnce({
      data: { id: 'btc-bitcoin', name: 'Bitcoin', symbol: 'BTC', rank: 1, price_usd: 1, percent_change_1h: 1, percent_change_24h: 1, percent_change_7d: 1, market_cap_usd: 1, volume_24h: 1 },
    });
    const result = await coinpaprika.ticker({ id: 'btc-bitcoin' });
    expect(result.id).toBe('btc-bitcoin');
  });
});

describe('coinlore', () => {
  it('normalizes tickers', async () => {
    mockGet.mockResolvedValueOnce({
      data: { data: [{ id: '90', symbol: 'BTC', name: 'Bitcoin', rank: '1', price_usd: '50000', percent_change_24h: '1', market_cap_usd: '1000' }] },
    });
    const result = await coinlore.tickers();
    expect(result.tickers[0].symbol).toBe('BTC');
  });
});

describe('kraken', () => {
  it('parses the ticker last price', async () => {
    mockGet.mockResolvedValueOnce({
      data: { error: [], result: { XXBTZUSD: { a: ['1', '1', '1'], b: ['1', '1', '1'], c: ['2', '1'], h: ['3', '3'], l: ['1', '1'], v: ['1', '1'], p: ['1', '1'], t: ['1', '1'] } } },
    });
    const result = await kraken.ticker({ pair: 'XXBTZUSD' });
    expect(result.last).toBe(2);
  });
});

describe('defillama', () => {
  it('normalizes protocols', async () => {
    mockGet.mockResolvedValueOnce({
      data: [{ name: 'Aave', symbol: 'AAVE', category: 'Lending', chains: ['Ethereum'], tvl: 1, change_1d: 1, change_7d: 2, slug: 'aave' }],
    });
    const result = await defillama.protocols();
    expect(result.protocols[0].name).toBe('Aave');
  });

  it('parses the plain-text TVL', async () => {
    mockGet.mockResolvedValueOnce({ data: '1234.5' });
    const result = await defillama.tvl({ protocol: 'aave' });
    expect(result.tvl).toBe(1234.5);
  });
});

describe('mempool', () => {
  it('normalizes recommended fees', async () => {
    mockGet.mockResolvedValueOnce({ data: { fastestFee: 5, halfHourFee: 4, hourFee: 3, economyFee: 2, minimumFee: 1 } });
    const result = await mempool.fees();
    expect(result.fastest).toBe(5);
  });
});

describe('blockchair', () => {
  it('normalizes chain stats', async () => {
    mockGet.mockResolvedValueOnce({ data: { data: { blocks: 1, transactions: 2, circulation: 3, market_price_usd: 4, mempool_transactions: 5 } } });
    const result = await blockchair.stats();
    expect(result.price).toBe(4);
  });
});

describe('exchangerate', () => {
  it('normalizes the latest rates', async () => {
    mockGet.mockResolvedValueOnce({ data: { result: 'success', base_code: 'USD', time_last_update_utc: 't', rates: { EUR: 0.9 } } });
    const result = await exchangerate.latest();
    expect(result.base).toBe('USD');
  });
});

describe('nbp', () => {
  it('normalizes an exchange rate table', async () => {
    mockGet.mockResolvedValueOnce({ data: [{ table: 'A', no: '1', effectiveDate: 'd', rates: [{ code: 'USD', currency: 'dolar', mid: 4 }] }] });
    const result = await nbp.table();
    expect(result.rates[0].code).toBe('USD');
  });
});

describe('imf', () => {
  it('normalizes indicator values', async () => {
    mockGet.mockResolvedValueOnce({ data: { values: { NGDP_RPCH: { DEU: { 2020: 1 } } } } });
    const result = await imf.data({ indicator: 'NGDP_RPCH' });
    expect(result.indicator).toBe('NGDP_RPCH');
  });
});

describe('eurostat', () => {
  it('normalizes a dataset', async () => {
    mockGet.mockResolvedValueOnce({ data: { label: 'GDP', updated: 't', value: { 0: 1 } } });
    const result = await eurostat.dataset({ dataset: 'nama_10_gdp' });
    expect(result.label).toBe('GDP');
  });
});

describe('aviationwx', () => {
  it('normalizes a METAR', async () => {
    mockGet.mockResolvedValueOnce({ data: [{ icaoId: 'KJFK', rawOb: 'RAW', reportTime: 't', temp: 10 }] });
    const result = await aviationwx.metar();
    expect(result.station).toBe('KJFK');
  });
});

describe('tides', () => {
  it('normalizes water level readings', async () => {
    mockGet.mockResolvedValueOnce({ data: { metadata: { name: 'Boston', id: '8443970' }, data: [{ t: 't', v: '1.5' }] } });
    const result = await tides.waterLevel();
    expect(result.readings[0].level).toBe(1.5);
  });
});

describe('carbon', () => {
  it('normalizes current intensity', async () => {
    mockGet.mockResolvedValueOnce({ data: { data: [{ from: 'a', to: 'b', intensity: { forecast: 100, actual: 110, index: 'moderate' } }] } });
    const result = await carbon.current();
    expect(result.actual).toBe(110);
  });
});

describe('spaceweather', () => {
  it('normalizes Kp entries', async () => {
    mockGet.mockResolvedValueOnce({ data: [{ time_tag: 't', Kp: 3, a_running: 1, station_count: 8 }] });
    const result = await spaceweather.kp();
    expect(result.entries[0].kp).toBe(3);
  });
});

describe('citybikes', () => {
  it('normalizes networks', async () => {
    mockGet.mockResolvedValueOnce({ data: { networks: [{ id: 'n', name: 'N', location: { city: 'C', country: 'X', latitude: 1, longitude: 2 } }] } });
    const result = await citybikes.networks();
    expect(result.networks[0].id).toBe('n');
  });
});

describe('transit', () => {
  it('normalizes locations', async () => {
    mockGet.mockResolvedValueOnce({ data: [{ id: '1', name: 'Alex', type: 'stop', location: { latitude: 1, longitude: 2 } }] });
    const result = await transit.locations({ query: 'Alex' });
    expect(result.locations[0].name).toBe('Alex');
  });
});

describe('tvmaze', () => {
  it('normalizes search results', async () => {
    mockGet.mockResolvedValueOnce({
      data: [{ show: { id: 1, name: 'Girls', genres: ['Drama'], rating: { average: 8 }, premiered: '2012', image: { medium: 'u' }, summary: 's' } }],
    });
    const result = await tvmaze.search({ query: 'Girls' });
    expect(result.shows[0].name).toBe('Girls');
  });
});

describe('deezer', () => {
  it('normalizes track search', async () => {
    mockGet.mockResolvedValueOnce({ data: { data: [{ id: 1, title: 'T', duration: 1, artist: { name: 'A' }, album: { title: 'B' }, preview: 'p' }] } });
    const result = await deezer.search({ query: 'x' });
    expect(result.tracks[0].artist).toBe('A');
  });
});

describe('anilist', () => {
  it('posts graphql and normalizes anime', async () => {
    mockPost.mockResolvedValueOnce({ data: { data: { Page: { media: [{ id: 20, title: { romaji: 'Naruto' } }] } } } });
    const result = await anilist.search({ query: 'naruto' });
    expect(result.anime[0].id).toBe(20);
    expect(mockPost.mock.calls[0][0]).toContain('graphql.anilist.co');
  });
});

describe('kitsu', () => {
  it('normalizes anime search', async () => {
    mockGet.mockResolvedValueOnce({
      data: { data: [{ id: '1', attributes: { canonicalTitle: 'Naruto', titles: { en: 'Naruto' }, subtype: 'TV', status: 'finished', episodeCount: 220, averageRating: '80', startDate: '2002', synopsis: 's' } }] },
    });
    const result = await kitsu.search({ query: 'Naruto' });
    expect(result.anime[0].title).toBe('Naruto');
  });
});

describe('ghibli', () => {
  it('normalizes films', async () => {
    mockGet.mockResolvedValueOnce({ data: [{ id: '1', title: 'Ponyo', original_title: 'x', director: 'M', producer: 'P', release_date: '2008', rt_score: '92', description: 'd' }] });
    const result = await ghibli.films();
    expect(result.films[0].title).toBe('Ponyo');
  });
});

describe('pollinations', () => {
  it('normalizes generated text', async () => {
    mockGet.mockResolvedValueOnce({ data: 'Hello' });
    const result = await pollinations.text({ prompt: 'hi' });
    expect(result.text).toBe('Hello');
  });

  it('builds an image url without HTTP', async () => {
    const result = await pollinations.image({ prompt: 'cat' });
    expect(result.url).toContain('image.pollinations.ai');
  });
});

describe('quickchart', () => {
  it('builds a bar chart url without HTTP', async () => {
    const result = await quickchart.bar({ labels: ['a'], data: [1] });
    expect(result.url).toContain('quickchart.io');
  });
});

describe('speech', () => {
  it('builds a TTS url without HTTP', async () => {
    const result = await speech.tts({ text: 'hi' });
    expect(result.url).toContain('translate_tts');
  });
});

describe('pubchem', () => {
  it('normalizes compound properties', async () => {
    mockGet.mockResolvedValueOnce({ data: { PropertyTable: { Properties: [{ CID: 2244, MolecularFormula: 'C9H8O4', MolecularWeight: '180', CanonicalSMILES: 'CC', IUPACName: 'x' }] } } });
    const result = await pubchem.compound({ name: 'aspirin' });
    expect(result.formula).toBe('C9H8O4');
  });
});

describe('rxnav', () => {
  it('normalizes drug concepts', async () => {
    mockGet.mockResolvedValueOnce({ data: { drugGroup: { conceptGroup: [{ conceptProperties: [{ rxcui: '1', name: 'aspirin', synonym: 'a', tty: 'IN' }] }] } } });
    const result = await rxnav.drugs({ name: 'aspirin' });
    expect(result.drugs[0].rxcui).toBe('1');
  });
});

describe('uniprot', () => {
  it('normalizes search results', async () => {
    mockGet.mockResolvedValueOnce({
      data: { results: [{ primaryAccession: 'P1', uniProtkbId: 'P1_HUMAN', proteinDescription: { recommendedName: { fullName: { value: 'p53' } } }, organism: { scientificName: 'Homo sapiens' }, sequence: { length: 393 } }] },
    });
    const result = await uniprot.search({ query: 'p53' });
    expect(result.results[0].accession).toBe('P1');
  });
});

describe('ensembl', () => {
  it('normalizes a gene symbol lookup', async () => {
    mockGet.mockResolvedValueOnce({ data: { id: 'ENSG', display_name: 'BRCA2', description: 'd', biotype: 'protein_coding', seq_region_name: '13', start: 1, end: 2, strand: 1 } });
    const result = await ensembl.lookupSymbol({ symbol: 'BRCA2' });
    expect(result.symbol).toBe('BRCA2');
  });
});

describe('gho', () => {
  it('normalizes indicators', async () => {
    mockGet.mockResolvedValueOnce({ data: { value: [{ IndicatorCode: 'A', IndicatorName: 'B' }] } });
    const result = await gho.indicators();
    expect(result.indicators[0].code).toBe('A');
  });
});

describe('icd10', () => {
  it('normalizes search results', async () => {
    mockGet.mockResolvedValueOnce({ data: [2, ['E11'], null, [['E11', 'Type 2 diabetes']]] });
    const result = await icd10.search({ terms: 'diabetes' });
    expect(result.results[0].code).toBe('E11');
  });
});

describe('exoplanet', () => {
  it('normalizes planets', async () => {
    mockGet.mockResolvedValueOnce({ data: [{ pl_name: 'WASP-39 b', hostname: 'WASP-39', disc_year: 2011, discoverymethod: 'Transit', pl_orbper: 4, pl_rade: 1, pl_bmasse: 1 }] });
    const result = await exoplanet.planets();
    expect(result.planets[0].name).toBe('WASP-39 b');
  });
});

describe('packages', () => {
  it('normalizes crate metadata', async () => {
    mockGet.mockResolvedValueOnce({ data: { crate: { name: 'serde', description: 'd', downloads: 1, max_version: '1.0', repository: 'r' } } });
    const result = await packages.crates({ name: 'serde' });
    expect(result.name).toBe('serde');
  });

  it('normalizes gem metadata', async () => {
    mockGet.mockResolvedValueOnce({ data: { name: 'rails', version: '8', downloads: 1, info: 'i', authors: ['a'], homepage_uri: 'h' } });
    const result = await packages.rubygems({ name: 'rails' });
    expect(result.version).toBe('8');
  });
});

describe('certs', () => {
  it('dedupes certificates by common name', async () => {
    mockGet.mockResolvedValueOnce({
      data: [
        { issuer_name: 'I', common_name: 'example.com', not_before: 'a', not_after: 'b', serial_number: '1' },
        { issuer_name: 'I', common_name: 'example.com', not_before: 'a', not_after: 'b', serial_number: '2' },
      ],
    });
    const result = await certs.search({ domain: 'example.com' });
    expect(result.certificates.length).toBe(1);
  });
});

describe('httptool', () => {
  it('echoes request details', async () => {
    mockGet.mockResolvedValueOnce({ data: { args: {}, headers: {}, origin: '1.2.3.4', url: 'u' } });
    const result = await httptool.get();
    expect(result.origin).toBe('1.2.3.4');
  });
});

describe('photon', () => {
  it('normalizes geocoding results', async () => {
    mockGet.mockResolvedValueOnce({ data: { features: [{ properties: { name: 'Berlin', city: 'Berlin', osm_type: 'R', osm_id: 1 }, geometry: { coordinates: [13, 52] } }] } });
    const result = await photon.search({ query: 'Berlin' });
    expect(result.results[0].lat).toBe(52);
  });
});

describe('postcodes', () => {
  it('normalizes a postcode lookup', async () => {
    mockGet.mockResolvedValueOnce({ data: { result: { postcode: 'SW1A 1AA', quality: 1, country: 'England', region: 'London', admin_district: 'Westminster', latitude: 51, longitude: 0 } } });
    const result = await postcodes.lookup({ postcode: 'SW1A 1AA' });
    expect(result.postcode).toBe('SW1A 1AA');
  });
});

describe('census', () => {
  it('normalizes geocode matches', async () => {
    mockGet.mockResolvedValueOnce({ data: { result: { addressMatches: [{ matchedAddress: '1600', coordinates: { x: -77, y: 38 }, addressComponents: { city: 'Washington', state: 'DC', zip: '20500' } }] } } });
    const result = await census.geocode({ address: '1600' });
    expect(result.matches[0].state).toBe('DC');
  });
});

describe('archiveorg', () => {
  it('normalizes search items', async () => {
    mockGet.mockResolvedValueOnce({ data: { response: { docs: [{ identifier: 'id', title: 'T', creator: 'C', year: '2000', mediatype: 'texts' }] } } });
    const result = await archiveorg.search({ query: 'x' });
    expect(result.items[0].identifier).toBe('id');
  });
});

describe('gdacs', () => {
  it('normalizes events', async () => {
    mockGet.mockResolvedValueOnce({ data: { features: [{ properties: { eventid: 1, eventtype: 'EQ', name: 'Quake', alertlevel: 'Red', fromdate: 'a', todate: 'b', country: 'X' }, geometry: { coordinates: [1, 2] } }] } });
    const result = await gdacs.events();
    expect(result.events[0].type).toBe('EQ');
  });
});

describe('reader', () => {
  it('normalizes article content', async () => {
    mockGet.mockResolvedValueOnce({ data: '# Title' });
    const result = await reader.article({ url: 'https://x.com' });
    expect(result.content).toBe('# Title');
  });

  it('normalizes rss items', async () => {
    mockGet.mockResolvedValueOnce({ data: { feed: { title: 'F', link: 'l', description: 'd' }, items: [{ title: 'I', link: 'l2', pubDate: 'p', author: 'a', description: 'd' }] } });
    const result = await reader.rssToJson({ url: 'https://x.com/rss' });
    expect(result.items[0].title).toBe('I');
  });
});

describe('statuspage', () => {
  it('normalizes a service status', async () => {
    mockGet.mockResolvedValueOnce({ data: { page: { name: 'GitHub', url: 'u' }, status: { indicator: 'none', description: 'ok' } } });
    const result = await statuspage.service({ service: 'github' });
    expect(result.name).toBe('GitHub');
  });
});

describe('macaddress', () => {
  it('normalizes the vendor', async () => {
    mockGet.mockResolvedValueOnce({ data: 'Apple, Inc.' });
    const result = await macaddress.lookup({ mac: 'x' });
    expect(result.vendor).toBe('Apple, Inc.');
  });
});
