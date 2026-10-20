/**
 * Provider health check — pokes every keyless (no-API-key) provider in the
 * MCP catalog through the real Bemora pipeline and classifies the outcome.
 *
 * Classification is about rot detection, not correctness:
 *   ALIVE    — call succeeded (or a URL-builder returned)
 *   DEGRADED — the host responded with an HTTP error (4xx/5xx): server is up,
 *              but the endpoint/params may need attention
 *   DEAD     — network-level failure: timeout, DNS, TLS, refused connection
 *   UNKNOWN  — a JS-level error (missing arg, parse bug) worth human eyes
 *
 * Output: health-report.json (committed nowhere; consumed by the
 * Provider Health workflow to open/update an issue).
 *
 * Run:  node scripts/health-check.mjs [--json] [--only ns1,ns2]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));

// Widen the HTTP timeout before any provider module is imported (env is read
// by src/core/http.js at import time). Static imports are hoisted, so env
// must be set before the dynamic import below executes.
process.env.BEMORA_HTTP_TIMEOUT_MS = process.env.BEMORA_HTTP_TIMEOUT_MS || '12000';

const args = process.argv.slice(2);
const jsonOnly = args.includes('--json');
const onlyIdx = args.indexOf('--only');
const only = onlyIdx >= 0 ? args[onlyIdx + 1].split(',').filter(Boolean) : null;

const CONCURRENCY = 8;

// Namespaces that cannot be probed without a key even though the catalog
// flags them keyless (they wrap keyed endpoints internally).
const SKIP = new Set(['enriched']);

// ---------------------------------------------------------------------------
// Verified sample calls (provider -> [method, args]) for endpoints whose
// required params we know. Everything else is auto-probed: every method on
// the namespace is tried with {} until one classifies better than UNKNOWN.
// ---------------------------------------------------------------------------
const SAMPLES = {
  coinpaprika: ['tickers', { limit: 2 }],
  coinlore: ['tickers', { limit: 2 }],
  kraken: ['ticker', { pair: 'XBTUSD' }],
  defillama: ['protocols', { limit: 2 }],
  mempool: ['fees', {}],
  blockchair: ['stats', {}],
  exchangerate: ['latest', { base: 'USD' }],
  nbp: ['rate', { code: 'USD' }],
  imf: ['data', { indicator: 'NGDP_RPCH' }],
  eurostat: ['gdp', {}],
  aviationwx: ['metar', { station: 'KJFK' }],
  tides: ['waterLevel', {}],
  carbon: ['current', {}],
  spaceweather: ['kp', {}],
  citybikes: ['networks', { limit: 3 }],
  transit: ['locations', { query: 'Alexanderplatz', results: 1 }],
  tvmaze: ['search', { query: 'girls' }],
  deezer: ['search', { query: 'eminem', limit: 2 }],
  anilist: ['search', { query: 'naruto', perPage: 2 }],
  kitsu: ['search', { query: 'naruto', limit: 1 }],
  ghibli: ['films', {}],
  pollinations: ['text', { prompt: 'hi' }],
  quickchart: ['bar', { labels: ['a'], data: [1] }],
  speech: ['tts', { text: 'hello' }],
  pubchem: ['compound', { name: 'aspirin' }],
  rxnav: ['drugs', { name: 'aspirin' }],
  uniprot: ['search', { query: 'p53', size: 1 }],
  ensembl: ['lookupSymbol', { symbol: 'BRCA2' }],
  gho: ['indicators', {}],
  icd10: ['search', { terms: 'E11', max: 2 }],
  exoplanet: ['planets', { limit: 2 }],
  packages: ['crates', { name: 'serde' }],
  certs: ['search', { domain: 'example.com', limit: 2 }],
  httptool: ['get', {}],
  photon: ['search', { query: 'berlin', limit: 1 }],
  postcodes: ['lookup', { postcode: 'SW1A1AA' }],
  census: ['geocode', { address: '1600 Pennsylvania Ave NW, Washington DC' }],
  archiveorg: ['search', { query: 'frankenstein', rows: 1 }],
  gdacs: ['events', { limit: 2 }],
  reader: ['article', { url: 'https://example.com' }],
  statuspage: ['service', { service: 'github' }],
  macaddress: ['lookup', { mac: '00:1A:2B:3C:4D:5E' }],
  ip: ['lookup', {}],
  crypto: ['price', { id: 'bitcoin' }],
  space: ['iss', {}],
  dns: ['resolve', { domain: 'example.com', type: 'A' }],
  // Namespaces whose providers guard on required args — probed with real ones.
  countries: ['byName', { name: 'Egypt' }],
  translate: ['text', { text: 'Hello', to: 'es' }],
  anime: ['search', { query: 'naruto', limit: 2 }],
  disasters: ['activeEvents', { limit: 2 }],
  enriched: ['weather', { city: 'Cairo' }],
  geocoding: ['search', { name: 'Cairo' }],
  jobs: ['search', { query: 'developer', limit: 2 }],
  literature: ['searchQuotes', { query: 'love' }],
  politics: ['presidents', {}],
  registry: ['pypiInfo', { package: 'requests' }],
  rss: ['fetch', { source: 'bbc-world', limit: 2 }],
  scholarly: ['searchWorks', { query: 'quantum', limit: 2 }],
  science: ['nasaApod', {}],
  university: ['search', { country: 'Egypt' }],
  water: ['usgs', { site: '01646500' }],
  websites: ['status', { url: 'https://example.com' }],
};

const NET_CODES = new Set([
  'ENOTFOUND', 'ECONNREFUSED', 'EAI_AGAIN', 'ETIMEDOUT', 'ECONNRESET',
  'ENETUNREACH', 'EHOSTUNREACH', 'EPROTO', 'ECONNABORTED',
  'ERR_TLS_CERT_ALTNAME_INVALID', 'CERT_HAS_EXPIRED',
  'DEPTH_ZERO_SELF_SIGNED_CERT', 'UNABLE_TO_VERIFY_LEAF_SIGNATURE',
]);

// Guaranteed termination: some call paths may not honour axios timeouts,
// so every probe gets its own hard cap on top.
const HARD_CAP_MS = 20000;
const cap = (p) => Promise.race([
  p,
  new Promise((_, reject) => setTimeout(() => reject(new Error('hard cap timeout')), HARD_CAP_MS)),
]);

function classify(err) {
  if (!err) return 'ALIVE';
  const msg = String(err?.message || '');
  const cause = err?.cause ?? err;
  const code = cause?.code || err?.code;
  if (err?.name === 'TimeoutError' || code === 'TIMEOUT' || /timed out|timeout/i.test(msg)) return 'DEAD';
  if (code && NET_CODES.has(code)) return 'DEAD';
  // The host answered with an HTTP error — it is up, just unhappy.
  if (cause?.status || err?.status || /\b(4\d\d|5\d\d)\b/.test(msg) || /status code/i.test(msg)) return 'DEGRADED';
  return 'UNKNOWN';
}

// Preference for the namespace verdict: positive signals first, network-level
// failure (a real attempt failed) over an unprobeable JS-level error.
const rank = { ALIVE: 0, DEGRADED: 1, DEAD: 2, UNKNOWN: 3 };

async function probeNamespace(api, ns, methods, sample) {
  const [sampleMethod, sampleArgs] = sample || [];
  const tried = [];
  let best = { status: 'UNKNOWN', method: null, ms: null, error: null };

  const order = sampleMethod
    ? [[sampleMethod, sampleArgs], ...Object.keys(methods)
        .filter((m) => m !== sampleMethod)
        .slice(0, 2)
        .map((m) => [m, {}])]
    : Object.keys(methods).slice(0, 3).map((m) => [m, {}]);

  for (const [method, callArgs] of order) {
    if (typeof api[ns]?.[method] !== 'function') continue;
    const t0 = Date.now();
    try {
      await cap(api[ns][method](callArgs));
      tried.push(`${method}: ok`);
      const res = { status: 'ALIVE', method, ms: Date.now() - t0, error: null };
      if (method === sampleMethod) return { res, tried }; // exact hit, stop
      if (rank[res.status] < rank[best.status]) best = res;
    } catch (err) {
      const status = classify(err);
      const res = { status, method, ms: Date.now() - t0, error: String(err?.message || err).slice(0, 140) };
      tried.push(`${method}: ${status.toLowerCase()}`);
      if (rank[res.status] < rank[best.status]) best = res;
    }
  }
  return { res: best, tried };
}

async function run() {
  const { default: Bemora } = await import('../src/index.js');
  const { default: PROVIDER_INFO } = await import('../src/mcp-server/provider-info.js');

  let entries = Object.entries(PROVIDER_INFO).filter(([, v]) => v.requiresKey === false);
  if (only) entries = entries.filter(([ns]) => only.includes(ns));

  const results = [];
  const queue = [...entries];
  const workers = Array.from({ length: CONCURRENCY }, async () => {
    for (;;) {
      const item = queue.shift();
      if (!item) return;
      const [ns, info] = item;
      if (SKIP.has(ns)) {
        results.push({ ns, category: info.category, status: 'SKIP', method: null, ms: null, error: 'wraps a keyed endpoint; not probeable keylessly', methods: [] });
        continue;
      }
      const api = new Bemora({}, { logLevel: 'silent', retries: 0 });
      if (typeof api[ns] !== 'object' || !api[ns]) {
        results.push({ ns, status: 'UNKNOWN', method: null, ms: null, error: 'namespace not built on Bemora instance', methods: [] });
        continue;
      }
      const { res, tried } = await probeNamespace(api, ns, info.methods || {}, SAMPLES[ns]);
      results.push({ ns, category: info.category, ...res, methods: tried });
      console.error(`[${results.length}/${entries.length}] ${ns}: ${res.status} via ${res.method} [${tried.join(', ')}]${res.error ? ` (${res.error.slice(0, 60)})` : ''}`);
    }
  });
  await Promise.all(workers);

  results.sort((a, b) => rank[a.status] - rank[b.status] || a.ns.localeCompare(b.ns));

  const totals = results.reduce((acc, r) => ((acc[r.status] = (acc[r.status] || 0) + 1), acc), {});
  const report = {
    checkedAt: new Date().toISOString(),
    keylessTotal: entries.length,
    totals: { ALIVE: 0, DEGRADED: 0, DEAD: 0, UNKNOWN: 0, ...totals },
    providers: results.map(({ methods, ...rest }) => rest),
  };

  const outPath = path.join(here, '..', 'health-report.json');
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2));

  const line = (r) => `  ${r.status.padEnd(8)} ${String(r.ns).padEnd(14)} ${(r.method || '-').padEnd(18)} ${r.error || ''}`;
  if (!jsonOnly) {
    console.log(`provider health: ${report.totals.ALIVE} alive, ${report.totals.DEGRADED} degraded, ${report.totals.DEAD} dead, ${report.totals.UNKNOWN} unknown (of ${report.keylessTotal} keyless)`);
    for (const status of ['DEAD', 'DEGRADED', 'UNKNOWN']) {
      const group = results.filter((r) => r.status === status);
      if (group.length) {
        console.log(`\n${status}:`);
        group.forEach((r) => console.log(line(r)));
      }
    }
  }
  console.log(`\nwrote ${path.basename(outPath)}`);
  // Some core modules keep timers alive (rate-limit sweeps, monitors); end
  // the process explicitly — the report is already on disk.
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
