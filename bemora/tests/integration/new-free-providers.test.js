/**
 * Integration tests for the additional free/keyless providers.
 * Hit real public APIs. Skip with: BEMORA_SKIP_INTEGRATION=true
 *
 * Run with: npm run test:integration
 */
import { describe, it, expect, beforeAll } from 'vitest';

const SKIP = process.env.BEMORA_SKIP_INTEGRATION === 'true';
const maybeDescribe = SKIP ? describe.skip : describe;

let dns, geocoding, earth, metno, nws, water, opensky, adsb;
let launches, eonet, biomed, fda, grammar, devto, bluesky, lobsters;
let spacenews, treasury, coinbase, demographics, poetry, vehicles;

beforeAll(async () => {
  if (SKIP) return;
  dns        = await import('../../src/providers/dns.js');
  geocoding  = await import('../../src/providers/geocoding.js');
  earth      = await import('../../src/providers/earth.js');
  metno      = await import('../../src/providers/metno.js');
  nws        = await import('../../src/providers/nws.js');
  water      = await import('../../src/providers/water.js');
  opensky    = await import('../../src/providers/opensky.js');
  adsb       = await import('../../src/providers/adsb.js');
  launches   = await import('../../src/providers/launches.js');
  eonet      = await import('../../src/providers/eonet.js');
  biomed     = await import('../../src/providers/biomed.js');
  fda        = await import('../../src/providers/fda.js');
  grammar    = await import('../../src/providers/grammar.js');
  devto      = await import('../../src/providers/devto.js');
  bluesky    = await import('../../src/providers/bluesky.js');
  lobsters   = await import('../../src/providers/lobsters.js');
  spacenews  = await import('../../src/providers/spacenews.js');
  treasury   = await import('../../src/providers/treasury.js');
  coinbase   = await import('../../src/providers/coinbase.js');
  demographics = await import('../../src/providers/demographics.js');
  poetry     = await import('../../src/providers/poetry.js');
  vehicles   = await import('../../src/providers/vehicles.js');
});

maybeDescribe('DNS over HTTPS (Cloudflare + Google — no key)', { timeout: 15000 }, () => {
  it('resolves A records for example.com', async () => {
    const result = await dns.a({ name: 'example.com' });
    expect(result.records.length).toBeGreaterThan(0);
  });

  it('resolves MX records for a domain', async () => {
    const result = await dns.mx({ name: 'google.com' });
    expect(result.type).toBe('MX');
    expect(Array.isArray(result.records)).toBe(true);
  });
});

maybeDescribe('Geocoding (Open-Meteo — no key)', { timeout: 15000 }, () => {
  it('geocodes a place name', async () => {
    const result = await geocoding.search({ name: 'Cairo' });
    expect(result.results.length).toBeGreaterThan(0);
    expect(result.results[0]).toHaveProperty('latitude');
  });
});

maybeDescribe('Earth data (Open-Meteo — no key)', { timeout: 15000 }, () => {
  it('returns elevation for a coordinate', async () => {
    const result = await earth.elevation({ lat: 30.04, lon: 31.24 });
    expect(typeof result.elevation_m).toBe('number');
  });

  it('returns historical weather observations', async () => {
    const result = await earth.historical({ lat: 30, lon: 31, startDate: '2020-01-01', endDate: '2020-01-03' });
    expect(Array.isArray(result.time)).toBe(true);
  });
});

maybeDescribe('Weather (met.no / weather.gov — no key)', { timeout: 15000 }, () => {
  it('returns a met.no forecast timeseries', async () => {
    const result = await metno.forecast({ lat: 59.91, lon: 10.75 });
    expect(Array.isArray(result.timeseries)).toBe(true);
    expect(result.timeseries.length).toBeGreaterThan(0);
  });

  it('returns NWS forecast periods', async () => {
    const result = await nws.forecast({ lat: 38.9, lon: -77.03 });
    expect(result.periods.length).toBeGreaterThan(0);
  });

  it('returns NWS active alerts', async () => {
    const result = await nws.alerts({ area: 'CA' });
    expect(Array.isArray(result.alerts)).toBe(true);
  });
});

maybeDescribe('Water (USGS — no key)', { timeout: 15000 }, () => {
  it('returns streamflow for a USGS site', async () => {
    const result = await water.usgs({ site: '01646500' });
    expect(Array.isArray(result.sites)).toBe(true);
    expect(result.sites.length).toBeGreaterThan(0);
  });
});

maybeDescribe('Flights (OpenSky + ADSBDB — no key)', { timeout: 20000 }, () => {
  it('returns live aircraft states', async () => {
    const result = await opensky.states({});
    expect(Array.isArray(result.states)).toBe(true);
    expect(result.states.length).toBeGreaterThan(0);
  });

  it('looks up an aircraft by ICAO address', async () => {
    const result = await adsb.aircraft({ icao: '406b30' });
    expect(result.registration).toBeTruthy();
  });

  it('looks up a flight route by callsign', async () => {
    const result = await adsb.callsign({ callsign: 'BAW123' });
    expect(result.airline_name).toBeTruthy();
  });
});

maybeDescribe('Rocket launches (TheSpaceDevs — no key)', { timeout: 20000 }, () => {
  it('returns upcoming launches', async () => {
    const result = await launches.upcoming({ limit: 2 });
    expect(Array.isArray(result.launches)).toBe(true);
    expect(result.launches.length).toBeGreaterThan(0);
    expect(result.launches[0]).toHaveProperty('name');
  });
});

maybeDescribe('Natural events (NASA EONET — no key)', { timeout: 15000 }, () => {
  it('returns current events', async () => {
    const result = await eonet.events({ limit: 5 });
    expect(Array.isArray(result.events)).toBe(true);
  });

  it('returns wildfires', async () => {
    const result = await eonet.wildfires({ limit: 3 });
    expect(result.category).toBe('wildfires');
    expect(Array.isArray(result.events)).toBe(true);
  });
});

maybeDescribe('Biomedicine (PubMed / Europe PMC / ClinicalTrials — no key)', { timeout: 20000 }, () => {
  it('searches PubMed', async () => {
    const result = await biomed.pubmedSearch({ query: 'diabetes', limit: 2 });
    expect(result.articles.length).toBeGreaterThan(0);
    expect(result.articles[0]).toHaveProperty('pmid');
  });

  it('searches Europe PMC', async () => {
    const result = await biomed.europePmc({ query: 'diabetes', limit: 2 });
    expect(result.articles.length).toBeGreaterThan(0);
  });

  it('searches ClinicalTrials.gov', async () => {
    const result = await biomed.clinicalTrials({ query: 'diabetes', limit: 2 });
    expect(result.trials.length).toBeGreaterThan(0);
  });
});

maybeDescribe('openFDA (no key)', { timeout: 20000 }, () => {
  it('returns food recall reports', async () => {
    const result = await fda.foodRecalls({ limit: 1 });
    expect(Array.isArray(result.results)).toBe(true);
  });
});

maybeDescribe('Grammar (LanguageTool — no key)', { timeout: 15000 }, () => {
  it('flags an obvious grammar mistake', async () => {
    const result = await grammar.check({ text: 'This are a test.' });
    expect(result.match_count).toBeGreaterThan(0);
    expect(Array.isArray(result.matches)).toBe(true);
  });
});

maybeDescribe('Dev.to (no key)', { timeout: 15000 }, () => {
  it('returns articles for a tag', async () => {
    const result = await devto.articles({ tag: 'javascript', perPage: 2 });
    expect(result.articles.length).toBeGreaterThan(0);
    expect(result.articles[0]).toHaveProperty('title');
  });

  it('returns trending tags', async () => {
    const result = await devto.tags({ perPage: 3 });
    expect(result.tags.length).toBeGreaterThan(0);
  });
});

maybeDescribe('Bluesky public API (no key)', { timeout: 15000 }, () => {
  it('fetches a profile', async () => {
    const result = await bluesky.profile({ actor: 'bsky.app' });
    expect(result.handle).toBe('bsky.app');
  });

  it('fetches an author feed', async () => {
    const result = await bluesky.authorFeed({ actor: 'bsky.app', limit: 2 });
    expect(Array.isArray(result.posts)).toBe(true);
  });
});

maybeDescribe('Lobsters (no key)', { timeout: 15000 }, () => {
  it('returns hottest stories', async () => {
    const result = await lobsters.hottest();
    expect(result.stories.length).toBeGreaterThan(0);
    expect(result.stories[0]).toHaveProperty('title');
  });
});

maybeDescribe('Spaceflight News (no key)', { timeout: 15000 }, () => {
  it('returns spaceflight articles', async () => {
    const result = await spacenews.articles({ limit: 2 });
    expect(result.articles.length).toBeGreaterThan(0);
  });
});

maybeDescribe('US Treasury Fiscal Data (no key)', { timeout: 15000 }, () => {
  it('returns national debt to the penny', async () => {
    const result = await treasury.debtToPenny({ limit: 1 });
    expect(Array.isArray(result.records)).toBe(true);
  });
});

maybeDescribe('Coinbase (no key)', { timeout: 15000 }, () => {
  it('returns a spot price', async () => {
    const result = await coinbase.spot({ pair: 'BTC-USD' });
    expect(typeof result.amount).toBe('number');
    expect(result.amount).toBeGreaterThan(0);
  });
});

maybeDescribe('Demographics (Genderize/Agify/Nationalize — no key)', { timeout: 15000 }, () => {
  it('predicts gender', async () => {
    const result = await demographics.gender({ name: 'alex' });
    expect(['male', 'female']).toContain(result.gender);
  });
});

maybeDescribe('PoetryDB (no key)', { timeout: 20000 }, () => {
  it('returns poems by author', async () => {
    const result = await poetry.byAuthor({ author: 'Emily Dickinson', limit: 1 });
    expect(result.poems.length).toBeGreaterThan(0);
    expect(result.poems[0]).toHaveProperty('title');
  });
});

maybeDescribe('Vehicles (NHTSA — no key)', { timeout: 15000 }, () => {
  it('decodes a VIN', async () => {
    const result = await vehicles.vinDecode({ vin: '1HGCM82633A004352' });
    expect(result.make).toBeTruthy();
    expect(result.model).toBeTruthy();
  });
});
