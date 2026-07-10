// Load .env in Node.js environments; no-op in edge/browser runtimes.
// Deliberately avoids both a top-level `await` (breaks bundlers that don't
// target es2022, e.g. webpack/esbuild defaults) and any static top-level
// import of a Node builtin (would break `src/edge.js`, which re-exports from
// this file and must stay loadable in non-Node runtimes).
//
// `process.loadEnvFile()` (Node >=20.6) is a synchronous builtin already
// attached to the global `process` object — no import required — so on
// modern Node this loads .env before any provider code runs, with zero race.
// On older Node (18–20.5) or non-Node runtimes it falls through to a
// fire-and-forget dynamic import of dotenv, which is best-effort: callers on
// those runtimes should load their own .env before constructing `Bemora()`.
if (typeof process !== 'undefined' && process.versions?.node) {
  if (typeof process.loadEnvFile === 'function') {
    try { process.loadEnvFile(); } catch { /* no .env file present */ }
  } else {
    import('dotenv/config').catch(() => { /* dotenv absent */ });
  }
}
import * as weather from './providers/weather.js';
import * as currency from './providers/currency.js';
import * as news from './providers/news.js';
import * as images from './providers/images.js';
import * as football from './providers/football.js';
import * as crypto from './providers/crypto.js';
import * as gold from './providers/gold.js';
import * as research from './providers/research.js';
import * as enriched from './providers/enriched.js';
import * as combined from './providers/combined.js';
import * as location from './providers/location.js';
import * as ip from './providers/ip.js';
import * as countries from './providers/countries.js';
import * as translate from './providers/translate.js';
import * as movies from './providers/movies.js';
import * as food from './providers/food.js';
import * as space from './providers/space.js';
import * as search from './providers/search.js';
import * as stocks from './providers/stocks.js';
import * as utils from './providers/utils.js';
import * as music from './providers/music.js';
import * as social from './providers/social.js';
import * as ai from './providers/ai.js';
import * as rss from './providers/rss.js';
import * as pub from './providers/public-apis.js';
import * as realtime from './providers/realtime.js';
import * as prayer from './providers/prayer.js';
import * as anime from './providers/anime.js';
import * as flights from './providers/flights.js';
import * as art from './providers/art.js';
import * as dev from './providers/dev.js';
import * as podcasts from './providers/podcasts.js';
import * as medical from './providers/health.js';
import * as fandom from './providers/fandom.js';
import * as spotify from './providers/spotify.js';
import * as stackexchange from './providers/stackexchange.js';
import * as steam from './providers/steam.js';
import * as animals from './providers/animals.js';
import * as books from './providers/books.js';
import * as lyrics from './providers/lyrics.js';
import * as math from './providers/math.js';
import * as jobs from './providers/jobs.js';
import * as science from './providers/science.js';
import * as basketball from './providers/basketball.js';
import * as vehicles from './providers/vehicles.js';
import * as pets from './providers/pets.js';
import * as drinks from './providers/drinks.js';
import * as geography from './providers/geography.js';
import * as comics from './providers/comics.js';
import * as tv from './providers/tv.js';
import * as baseball from './providers/baseball.js';
import * as hockey from './providers/hockey.js';
import * as finance from './providers/finance.js';
import * as literature from './providers/literature.js';
import * as wildlife from './providers/wildlife.js';
import * as politics from './providers/politics.js';
import * as language from './providers/language.js';
import * as law from './providers/law.js';
import * as military from './providers/military.js';
import * as thesaurus from './providers/thesaurus.js';
import * as currencyhistory from './providers/currencyhistory.js';
import * as markdown from './providers/markdown.js';
import * as techdb from './providers/techdb.js';
import * as websites from './providers/websites.js';
import * as fakedb from './providers/fakedb.js';
import * as religion from './providers/religion.js';
import * as islamic from './providers/islamic.js';
import * as gaming from './providers/gaming.js';
import * as spaceExtended from './providers/space-extended.js';
import * as covid from './providers/covid.js';
import * as earthquake from './providers/earthquake.js';
import * as airquality from './providers/airquality.js';
import * as astronomy from './providers/astronomy.js';
import * as postal from './providers/postal.js';
import * as predict from './providers/predict.js';
import * as brewery from './providers/brewery.js';
import * as sportsdb from './providers/sportsdb.js';
import * as domain from './providers/domain.js';
import * as placeholder from './providers/placeholder.js';
import * as weatheralerts from './providers/weatheralerts.js';
import * as coinwizard from './providers/coinwizard.js';
// ── Enterprise providers ──────────────────────────────────────────────────────
import * as stripeProvider from './providers/payments/stripe.js';
import * as paypalProvider from './providers/payments/paypal.js';
import * as sendgridProvider from './providers/email/sendgrid.js';
import * as sesProvider from './providers/email/ses.js';
import * as resendProvider from './providers/email/resend.js';
import * as twilioProvider from './providers/sms/twilio.js';
import * as jwtProvider from './providers/auth/jwt.js';
import * as clerkProvider from './providers/auth/clerk.js';
import * as auth0Provider from './providers/auth/auth0.js';
import * as s3Provider from './providers/storage/s3.js';
import * as r2Provider from './providers/storage/r2.js';
import * as gcsProvider from './providers/storage/gcs.js';
import * as pineconeProvider from './providers/vectordb/pinecone.js';
import * as qdrantProvider from './providers/vectordb/qdrant.js';
import * as weaviateProvider from './providers/vectordb/weaviate.js';
import * as pgvectorProvider from './providers/vectordb/pgvector.js';
import * as sentryProvider from './providers/observability/sentry.js';
import { wireOtel, withSpan as otelSpan } from './providers/observability/otel.js';
import * as onesignalProvider from './providers/notifications/onesignal.js';
import * as pusherProvider from './providers/notifications/pusher.js';
import * as fcmProvider from './providers/notifications/fcm.js';
import * as googleMapsProvider from './providers/maps/google.js';
import * as mapboxProvider from './providers/maps/mapbox.js';
import * as algoliaProvider from './providers/search/algolia.js';
import * as meilisearchProvider from './providers/search/meilisearch.js';
import * as googleCalProvider from './providers/calendar/google.js';
import * as calendlyProvider from './providers/calendar/calendly.js';
import * as recaptchaProvider from './providers/captcha/recaptcha.js';
import * as hcaptchaProvider from './providers/captcha/hcaptcha.js';
import * as turnstileProvider from './providers/captcha/turnstile.js';
import * as hibpProvider from './providers/security/hibp.js';
import * as virustotalProvider from './providers/security/virustotal.js';
import * as safebrowsingProvider from './providers/security/safebrowsing.js';
import * as urlscanProvider from './providers/security/urlscan.js';
import * as cfDnsProvider from './providers/cloudflare/dns.js';
import * as cfR2Provider from './providers/cloudflare/r2.js';
import * as cfCacheProvider from './providers/cloudflare/cache.js';
import * as cfWorkersProvider from './providers/cloudflare/workers.js';
import * as anthropicProvider from './providers/ai/anthropic.js';
import * as geminiProvider from './providers/ai/gemini.js';
import * as cohereProvider from './providers/ai/cohere.js';
import * as mistralProvider from './providers/ai/mistral.js';
import * as togetherProvider from './providers/ai/together.js';
import * as perplexityProvider from './providers/ai/perplexity.js';
import { verify as verifyWebhookSig } from './providers/webhooks/verify.js';
import { WebhookRouter } from './core/webhooks.js';
import { recordCost, snapshot as costSnapshot, snapshotForTenant as costSnapshotForTenant } from './core/costs.js';
import { paginate, paginateStream } from './core/paginate.js';
import { gql, gqlTag } from './core/gql.js';
import { upload as uploadUtil } from './core/upload.js';

import { logger } from './core/logger.js';
import * as cache from './core/cache.js';
import { batch } from './core/batch.js';
import { BemoraEvents } from './core/events.js';
import { PluginSystem } from './core/plugins.js';
import { checkAllHealth, checkHealth } from './core/health.js';
import { getAllStatus, getStatus, recordRequest } from './core/ratelimit.js';
import { withRetry } from './core/retry.js';
import { fallbackChain, aggregate } from './core/fallback.js';
import { BemoraMonitor } from './core/monitor.js';
import * as exportUtils from './core/export.js';
import { BemoraError, ConfigurationError, ProviderError, ValidationError, CircuitBreakerError, TimeoutError } from './core/errors.js';
import * as registry from './core/registry.js';
import { Interceptors } from './core/interceptors.js';
import { MiddlewareChain } from './core/middleware.js';
import { validateResponse } from './core/validate.js';
import { generateOpenAPISpec } from './core/openapi.js';
import { getBreaker, resetBreaker, resetAllBreakers, getAllBreakerStates } from './core/circuit.js';
import * as metrics from './core/metrics.js';

export { batch } from './core/batch.js';
export { staleWhileRevalidate } from './core/stale.js';
export { BinanceStream, KrakenStream, getRealtimePrice } from './providers/realtime.js';
export { BemoraMonitor } from './core/monitor.js';
export { fallbackChain, aggregate } from './core/fallback.js';
export { BemoraError, ConfigurationError, ProviderError, ValidationError, CircuitBreakerError, TimeoutError } from './core/errors.js';
export { setAdapter } from './core/cache.js';
export * as registry from './core/registry.js';
export { Interceptors } from './core/interceptors.js';
export { MiddlewareChain } from './core/middleware.js';
export { validateResponse, schemas as validationSchemas } from './core/validate.js';
export { generateOpenAPISpec } from './core/openapi.js';

// ── Enterprise utility exports ────────────────────────────────────────────────
export { WebhookRouter } from './core/webhooks.js';
export { verify as verifyWebhook } from './providers/webhooks/verify.js';
export { recordCost, snapshot as costSnapshot, snapshotForTenant as costSnapshotForTenant, reset as resetCosts } from './core/costs.js';
export { paginate, paginateStream } from './core/paginate.js';
export { gql, gqlTag, introspect as gqlIntrospect } from './core/gql.js';
export { upload as uploadFile, uploadPresignedPost, uploadFromUrl } from './core/upload.js';
export { redact, redactObject, redactMessages, containsPII } from './core/pii.js';
export { createRedisAdapter, createRedisAdapterFromUrl } from './core/cache-redis.js';
export { signAwsRequest, presignUrl as presignAwsUrl } from './core/signing/awsSigV4.js';
export { signRequest as hmacSign, verifyRequest as hmacVerify } from './core/signing/hmac.js';

export class Bemora {
  constructor(keys = {}, options = {}) {
    this._keys = {
      weather:     keys.weatherKey      || process.env.BEMORA_WEATHER_KEY,
      currency:    keys.currencyKey     || process.env.BEMORA_CURRENCY_KEY,
      news:        keys.newsKey         || process.env.BEMORA_NEWS_KEY,
      unsplash:    keys.unsplashKey     || process.env.BEMORA_UNSPLASH_KEY,
      pexels:      keys.pexelsKey       || process.env.BEMORA_PEXELS_KEY,
      football:    keys.footballKey     || process.env.BEMORA_FOOTBALL_KEY,
      gold:        keys.goldKey         || process.env.BEMORA_GOLD_KEY,
      nasa:        keys.nasaKey         || process.env.BEMORA_NASA_KEY,
      movies:      keys.moviesKey       || process.env.BEMORA_MOVIES_KEY,
      stocks:      keys.stocksKey       || process.env.BEMORA_STOCKS_KEY,
      openai:      keys.openaiKey       || process.env.BEMORA_OPENAI_KEY,
      groq:        keys.groqKey         || process.env.BEMORA_GROQ_KEY,
      anthropic:   keys.anthropicKey    || process.env.BEMORA_ANTHROPIC_KEY,
      gemini:      keys.geminiKey       || process.env.BEMORA_GEMINI_KEY,
      spoonacular: keys.spoonacularKey  || process.env.BEMORA_SPOONACULAR_KEY,
      edamamAppId: keys.edamamAppId     || process.env.BEMORA_EDAMAM_APP_ID,
      edamamAppKey:keys.edamamAppKey    || process.env.BEMORA_EDAMAM_APP_KEY,
      spotifyClientId: keys.spotifyClientId || process.env.BEMORA_SPOTIFY_CLIENT_ID,
      spotifyClientSecret: keys.spotifyClientSecret || process.env.BEMORA_SPOTIFY_CLIENT_SECRET,
      steam:          keys.steamKey           || process.env.BEMORA_STEAM_KEY,
      // ── Enterprise keys ──────────────────────────────────────────────────
      stripe:         keys.stripeKey          || process.env.BEMORA_STRIPE_KEY,
      stripeWebhook:  keys.stripeWebhookSecret|| process.env.BEMORA_STRIPE_WEBHOOK_SECRET,
      paypal:         { clientId: keys.paypalClientId || process.env.BEMORA_PAYPAL_CLIENT_ID, clientSecret: keys.paypalClientSecret || process.env.BEMORA_PAYPAL_CLIENT_SECRET, sandbox: keys.paypalSandbox ?? (process.env.BEMORA_PAYPAL_SANDBOX === 'true') },
      sendgrid:       keys.sendgridKey        || process.env.BEMORA_SENDGRID_KEY,
      ses:            { accessKeyId: keys.sesAccessKeyId || process.env.BEMORA_SES_ACCESS_KEY_ID, secretAccessKey: keys.sesSecretAccessKey || process.env.BEMORA_SES_SECRET_ACCESS_KEY, region: keys.sesRegion || process.env.BEMORA_SES_REGION || 'us-east-1' },
      resend:         keys.resendKey          || process.env.BEMORA_RESEND_KEY,
      twilio:         { accountSid: keys.twilioAccountSid || process.env.BEMORA_TWILIO_ACCOUNT_SID, authToken: keys.twilioAuthToken || process.env.BEMORA_TWILIO_AUTH_TOKEN },
      clerk:          keys.clerkSecretKey     || process.env.BEMORA_CLERK_SECRET_KEY,
      auth0:          { domain: keys.auth0Domain || process.env.BEMORA_AUTH0_DOMAIN, clientId: keys.auth0ClientId || process.env.BEMORA_AUTH0_CLIENT_ID, clientSecret: keys.auth0ClientSecret || process.env.BEMORA_AUTH0_CLIENT_SECRET },
      jwtSecret:      keys.jwtSecret          || process.env.BEMORA_JWT_SECRET,
      s3:             { accessKeyId: keys.s3AccessKeyId || process.env.BEMORA_S3_ACCESS_KEY_ID, secretAccessKey: keys.s3SecretAccessKey || process.env.BEMORA_S3_SECRET_ACCESS_KEY, region: keys.s3Region || process.env.BEMORA_S3_REGION || 'us-east-1', bucket: keys.s3Bucket || process.env.BEMORA_S3_BUCKET },
      r2:             { accessKeyId: keys.r2AccessKeyId || process.env.BEMORA_R2_ACCESS_KEY_ID, secretAccessKey: keys.r2SecretAccessKey || process.env.BEMORA_R2_SECRET_ACCESS_KEY, accountId: keys.r2AccountId || process.env.BEMORA_R2_ACCOUNT_ID, bucket: keys.r2Bucket || process.env.BEMORA_R2_BUCKET },
      gcs:            { projectId: keys.gcsProjectId || process.env.BEMORA_GCS_PROJECT_ID, clientEmail: keys.gcsClientEmail || process.env.BEMORA_GCS_CLIENT_EMAIL, privateKey: keys.gcsPrivateKey || process.env.BEMORA_GCS_PRIVATE_KEY, bucket: keys.gcsBucket || process.env.BEMORA_GCS_BUCKET },
      pinecone:       { apiKey: keys.pineconeKey || process.env.BEMORA_PINECONE_KEY, host: keys.pineconeHost || process.env.BEMORA_PINECONE_HOST },
      qdrant:         { url: keys.qdrantUrl || process.env.BEMORA_QDRANT_URL, apiKey: keys.qdrantKey || process.env.BEMORA_QDRANT_KEY },
      weaviate:       { url: keys.weaviateUrl || process.env.BEMORA_WEAVIATE_URL, apiKey: keys.weaviateKey || process.env.BEMORA_WEAVIATE_KEY },
      sentry:         keys.sentryDsn          || process.env.BEMORA_SENTRY_DSN,
      onesignal:      { appId: keys.onesignalAppId || process.env.BEMORA_ONESIGNAL_APP_ID, apiKey: keys.onesignalKey || process.env.BEMORA_ONESIGNAL_KEY },
      pusher:         { appId: keys.pusherAppId || process.env.BEMORA_PUSHER_APP_ID, key: keys.pusherKey || process.env.BEMORA_PUSHER_KEY, secret: keys.pusherSecret || process.env.BEMORA_PUSHER_SECRET, cluster: keys.pusherCluster || process.env.BEMORA_PUSHER_CLUSTER || 'mt1' },
      fcm:            { projectId: keys.fcmProjectId || process.env.BEMORA_FCM_PROJECT_ID },
      googleMaps:     keys.googleMapsKey      || process.env.BEMORA_GOOGLE_MAPS_KEY,
      mapbox:         keys.mapboxKey          || process.env.BEMORA_MAPBOX_KEY,
      algolia:        { appId: keys.algoliaAppId || process.env.BEMORA_ALGOLIA_APP_ID, apiKey: keys.algoliaKey || process.env.BEMORA_ALGOLIA_KEY },
      meilisearch:    { url: keys.meilisearchUrl || process.env.BEMORA_MEILISEARCH_URL, apiKey: keys.meilisearchKey || process.env.BEMORA_MEILISEARCH_KEY },
      googleCal:      keys.googleCalToken     || process.env.BEMORA_GOOGLE_CAL_TOKEN,
      calendly:       keys.calendlyKey        || process.env.BEMORA_CALENDLY_KEY,
      recaptcha:      keys.recaptchaSecret    || process.env.BEMORA_RECAPTCHA_SECRET,
      hcaptcha:       keys.hcaptchaSecret     || process.env.BEMORA_HCAPTCHA_SECRET,
      turnstile:      keys.turnstileSecret    || process.env.BEMORA_TURNSTILE_SECRET,
      hibp:           keys.hibpKey            || process.env.BEMORA_HIBP_KEY,
      virustotal:     keys.virustotalKey      || process.env.BEMORA_VIRUSTOTAL_KEY,
      safebrowsing:   keys.safebrowsingKey    || process.env.BEMORA_SAFEBROWSING_KEY,
      urlscan:        keys.urlscanKey         || process.env.BEMORA_URLSCAN_KEY,
      cloudflare:     { token: keys.cloudflareToken || process.env.BEMORA_CLOUDFLARE_TOKEN, apiKey: keys.cloudflareApiKey || process.env.BEMORA_CLOUDFLARE_API_KEY, email: keys.cloudflareEmail || process.env.BEMORA_CLOUDFLARE_EMAIL, accountId: keys.cloudflareAccountId || process.env.BEMORA_CLOUDFLARE_ACCOUNT_ID },
      cohere:         keys.cohereKey          || process.env.BEMORA_COHERE_KEY,
      mistral:        keys.mistralKey         || process.env.BEMORA_MISTRAL_KEY,
      together:       keys.togetherKey        || process.env.BEMORA_TOGETHER_KEY,
      perplexity:     keys.perplexityKey      || process.env.BEMORA_PERPLEXITY_KEY,
    };

    this._options = { retries: 2, validateResponses: false, fallbacks: {}, ...options };
    if (options.logLevel) logger.setLevel(options.logLevel);
    
    // Apply custom cache adapter if provided
    if (this._options.cacheAdapter) {
      import('./core/cache.js').then(module => {
        module.setAdapter(this._options.cacheAdapter);
      });
    }

    this._events  = new BemoraEvents();
    this._plugins = new PluginSystem();
    this._monitor = new BemoraMonitor();
    this.interceptors = new Interceptors();
    this.middleware   = new MiddlewareChain();
    this._watchers = new Map();

    this.weather   = this._buildWeather();
    this.currency  = this._buildCurrency();
    this.news      = this._buildNews();
    this.images    = this._buildImages();
    this.football  = this._buildFootball();
    this.crypto    = this._buildCrypto();
    this.gold      = this._buildGold();
    this.research  = this._buildResearch();
    this.location  = this._buildLocation();
    this.ip        = this._buildIP();
    this.countries = this._buildCountries();
    this.translate = this._buildTranslate();
    this.movies    = this._buildMovies();
    this.food      = this._buildFood();
    this.space     = this._buildSpace();
    this.search    = this._buildSearch();
    this.stocks    = this._buildStocks();
    this.music     = this._buildMusic();
    this.social    = this._buildSocial();
    this.ai        = this._buildAI();
    this.utils     = this._buildUtils();
    this.fandom    = this._buildFandom();
    this.spotify   = this._buildSpotify();
    this.stackexchange = this._buildStackExchange();
    this.steam     = this._buildSteam();
    this.animals   = this._buildAnimals();
    this.books     = this._buildBooks();
    this.lyrics    = this._buildLyrics();
    this.math      = this._buildMath();
    this.jobs      = this._buildJobs();
    this.science   = this._buildScience();
    this.basketball = this._buildBasketball();
    this.vehicles  = this._buildVehicles();
    this.pets      = this._buildPets();
    this.drinks    = this._buildDrinks();
    this.geography = this._buildGeography();
    this.comics    = this._buildComics();
    this.tv        = this._buildTV();
    this.baseball  = this._buildBaseball();
    this.hockey    = this._buildHockey();
    this.finance   = this._buildFinance();
    this.literature = this._buildLiterature();
    this.wildlife  = this._buildWildlife();
    this.politics  = this._buildPolitics();
    this.language  = this._buildLanguage();
    this.law       = this._buildLaw();
    this.military  = this._buildMilitary();
    this.thesaurus = this._buildThesaurus();
    this.currencyHistory = this._buildCurrencyHistory();
    this.markdown  = this._buildMarkdown();
    this.techdb    = this._buildTechDB();
    this.websites  = this._buildWebsites();
    this.fakedb    = this._buildFakeDB();
    this.religion  = this._buildReligion();
    this.islamic   = this._buildIslamic();
    this.gaming    = this._buildGaming();
    this.spaceExtended = this._buildSpaceExtended();
    this.covid     = this._buildCovid();
    this.earthquake = this._buildEarthquake();
    this.airquality = this._buildAirQuality();
    this.astronomy = this._buildAstronomy();
    this.postal    = this._buildPostal();
    this.predict   = this._buildPredict();
    this.brewery   = this._buildBrewery();
    this.sportsdb  = this._buildSportsDB();
    this.domain    = this._buildDomain();
    this.placeholder = this._buildPlaceholder();
    this.weatheralerts = this._buildWeatherAlerts();
    this.coinWizard = this._buildCoinWizard();

    this.free      = this._buildFree();
    this.rss       = this._buildRSS();
    this.realtime  = this._buildRealtime();
    this.smart     = this._buildSmart();
    this.monitor   = this._monitor;
    this.export    = exportUtils;
    this.prayer    = this._buildPrayer();
    this.anime     = this._buildAnime();
    this.flights   = this._buildFlights();
    this.art       = this._buildArt();
    this.dev       = this._buildDev();
    this.podcasts  = this._buildPodcasts();
    this.medical   = this._buildMedical();
    this.enriched  = this._buildEnriched();
    this.combined  = this._buildCombined();
    this.cache     = cache;
    this.batch     = (calls) => batch(calls);

    // ── Enterprise namespaces ─────────────────────────────────────────────
    this.payments    = this._buildPayments();
    this.email       = this._buildEmail();
    this.sms         = this._buildSMS();
    this.auth        = this._buildAuth();
    this.jwt         = this._buildJWT();
    this.storage     = this._buildStorage();
    this.vectordb    = this._buildVectorDB();
    this.sentry      = this._buildSentry();
    this.otel        = { wireOtel: (opts) => wireOtel(this, opts), withSpan: otelSpan };
    this.notifications = this._buildNotifications();
    this.maps        = this._buildMaps();
    this.searchEnt   = this._buildSearchEnterprise();
    this.calendar    = this._buildCalendar();
    this.captcha     = this._buildCaptcha();
    this.security    = this._buildSecurity();
    this.cloudflare  = this._buildCloudflare();

    // ── Additional AI providers ───────────────────────────────────────────
    Object.assign(this.ai, this._buildAIEnterprise());

    // ── Platform utilities ────────────────────────────────────────────────
    this.webhooks = this._buildWebhooks();
    this.costs    = { snapshot: costSnapshot, snapshotForTenant: costSnapshotForTenant, record: recordCost };
    this.helpers  = { paginate, paginateStream, gql, gqlTag, upload: uploadUtil };
    this.keys     = { rotate: (name, value) => this.setKey(name, value) };

    this.providers = {
      status: () => registry.getAllProviderStatus(),
      statusOf: (name) => registry.getProviderStatus(name),
      reset: (name) => registry.resetProvider(name),
    };

    /** Circuit-breaker management */
    this.circuits = {
      /** State snapshot for every tracked provider. */
      status: () => getAllBreakerStates(),
      /** State for a single provider. */
      statusOf: (name) => getBreaker(name).getState(),
      /** Reset (close) a provider's circuit. */
      reset: (name) => { resetBreaker(name); return this; },
      /** Reset all circuits. */
      resetAll: () => { resetAllBreakers(); return this; },
      /** Manually force a circuit OPEN (e.g. known maintenance window). */
      open: (name) => { getBreaker(name).forceOpen(); return this; },
      /** Manually close a previously forced-open circuit. */
      close: (name) => { getBreaker(name).forceClose(); return this; },
    };
  }

  use(plugin)  { this._plugins.use(plugin, this); return this; }
  plugins()    { return this._plugins.list(); }
  on(ev, fn)   { this._events.on(ev, fn); return this; }
  off(ev, fn)  { this._events.off(ev, fn); return this; }
  async health()       { return checkAllHealth(this._keys); }
  async healthOf(name) { return checkHealth(name, this._keys); }
  rateLimits()         { return getAllStatus(); }
  rateLimit(p)         { return getStatus(p); }

  /**
   * Hot-rotate an API key without restarting the process.
   * @param {string} name  - key name as used in the constructor (e.g. 'openai', 'groq')
   * @param {string} value - the new key value
   */
  setKey(name, value) {
    this._keys[name] = value;
    logger.info(`Key "${name}" rotated.`, { provider: name });
    return this;
  }

  /**
   * Create a scoped Bemora instance that uses per-tenant API keys while
   * inheriting the same options as the parent instance.
   * @param {string} tenantId - used only for logging / tracing
   * @param {object} keys     - same shape as the Bemora constructor `keys` arg
   * @returns {Bemora}
   */
  forTenant(tenantId, keys) {
    logger.debug(`forTenant("${tenantId}") instance created.`);
    return new Bemora(keys, this._options);
  }

  /** Alias for forTenant() */
  withTenant(tenantId, keys) { return this.forTenant(tenantId, keys); }

  /**
   * Get collected metrics for all providers (or a single named one).
   * @param {string} [provider]
   * @returns {Object|Object[]}
   */
  getMetrics(provider) {
    return metrics.getMetrics(provider);
  }

  /**
   * Emit metrics in Prometheus text-exposition format.
   * Suitable for a /metrics HTTP endpoint.
   * @returns {string}
   */
  metricsPrometheus() {
    return metrics.toPrometheusText();
  }

  /**
   * Generate an OpenAPI 3.0 spec describing every namespace/method on this
   * instance. Useful when wrapping bemora behind a REST API.
   * @param {{ basePath?: string, title?: string, version?: string }} opts
   */
  toOpenAPI(opts) { return generateOpenAPISpec(this, opts); }

  /**
   * Dynamically load a `bemora-plugin-*` package and register it via use().
   * Convention: the package must default-export (or named-export `plugin`) a
   * function of the shape (bemoraInstance) => void | Promise<void>.
   * @param {string} name - npm package name, e.g. 'bemora-plugin-redis-cache'
   */
  async loadPlugin(name) {
    if (!/^bemora-plugin-/.test(name)) {
      logger.warn?.(`[bemora] loadPlugin("${name}") — plugin packages should follow the "bemora-plugin-*" naming convention.`);
    }
    const mod = await import(name);
    const plugin = mod.plugin || mod.default;
    if (typeof plugin !== 'function') {
      throw new ConfigurationError(`[bemora] Plugin "${name}" does not export a default or named "plugin" function.`, { provider: name });
    }
    return this.use(plugin);
  }

  /**
   * Watch a resource for changes, polling under the hood (webhook-style
   * abstraction without requiring the caller to run a server).
   * @param {string} resource - e.g. 'crypto.price', dot-namespaced like the api itself
   * @param {Object} params - params passed to the underlying method each poll
   * @param {(data: any) => void} onData - called whenever the fetched value changes
   * @param {{ intervalMs?: number, onError?: (err: Error) => void }} [opts]
   * @returns {string} watchId — pass to unwatch() to stop
   */
  watch(resource, params, onData, { intervalMs = 30000, onError } = {}) {
    const [namespace, method] = resource.split('.');
    const fn = this[namespace]?.[method];
    if (typeof fn !== 'function') {
      throw new ConfigurationError(`[bemora] watch("${resource}") — no such method exists on this instance.`, { provider: resource });
    }

    const watchId = `${resource}:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;
    let lastSnapshot = null;

    const poll = async () => {
      try {
        const result = await fn(params);
        const snapshot = JSON.stringify(result);
        if (snapshot !== lastSnapshot) {
          lastSnapshot = snapshot;
          onData(result);
        }
      } catch (err) {
        if (onError) onError(err);
        else this._events.emit('error', { provider: resource, error: err.message });
      }
    };

    poll();
    const timer = setInterval(poll, intervalMs);
    this._watchers.set(watchId, timer);
    return watchId;
  }

  /**
   * Stop a previously created watch().
   * @param {string} watchId
   */
  unwatch(watchId) {
    const timer = this._watchers.get(watchId);
    if (timer) {
      clearInterval(timer);
      this._watchers.delete(watchId);
      return true;
    }
    return false;
  }

  _require(key, name) {
    if (!this._keys[key]) {
      throw new ConfigurationError(
        `[bemora] Missing API key for "${name}". Set in constructor or BEMORA_${name.toUpperCase().replace(/[^A-Z]/g, '_')}_KEY in .env.`,
        { provider: name }
      );
    }
    return this._keys[key];
  }

  /**
   * Wrap a provider call with the full bemora pipeline:
   *   1. AbortSignal extraction from first arg
   *   2. Circuit-breaker check (CLOSED → allow, OPEN → fail-fast, HALF_OPEN → probe)
   *   3. Rate-limit recording & request event
   *   4. Request interceptors
   *   5. Per-provider timeout (options.timeouts[provider] || options.timeout || 30 000 ms)
   *   6. Retry with exponential backoff
   *   7. Middleware chain
   *   8. Cache-status metadata + optional Cache-Control / ETag headers
   *   9. Optional Zod response validation
   *  10. Response interceptors
   *  11. Metrics + registry bookkeeping on success
   *  12. Circuit-breaker + metrics bookkeeping on failure
   *
   * @param {string}   provider  - provider id for rate-limiting / registry / circuit
   * @param {Function} fn        - (...args) => Promise<any>
   * @param {string}  [schemaKey]- key into core/validate.js schemas for opt-in validation
   */
  _wrap(provider, fn, schemaKey) {
    return async (...args) => {
      // ── 1. Extract AbortSignal from first arg (if caller passes { signal }) ──
      const signal = args[0] && typeof args[0] === 'object' ? args[0].signal : undefined;

      // ── 2. Circuit-breaker check ─────────────────────────────────────────
      const breaker = getBreaker(provider, this._options.circuitBreaker);
      const breakerDecision = breaker.check();

      if (breakerDecision === 'reject') {
        const err = new CircuitBreakerError(
          `[bemora] Provider "${provider}" circuit is OPEN — failing fast until recovery window elapses.`,
          { provider }
        );
        metrics.record(provider, { success: false });
        this._events.emit('error', { provider, error: err.message });
        throw err;
      }
      if (breakerDecision === 'probe') breaker.startProbe();

      // ── 3. Rate-limit + request event ────────────────────────────────────
      recordRequest(provider);
      this._events.emit('request', { provider });

      // ── 4. Request interceptors ──────────────────────────────────────────
      const config = await this.interceptors.request.run({ provider, args });

      const startTime = Date.now();

      // ── 5. Per-provider timeout wrapper ─────────────────────────────────
      const timeoutMs = this._options.timeouts?.[provider] ?? this._options.timeout ?? 30_000;
      const callOnce = () => new Promise((resolve, reject) => {
        let settled = false;
        const timer = setTimeout(() => {
          if (!settled) {
            settled = true;
            reject(new TimeoutError(
              `[bemora] "${provider}" timed out after ${timeoutMs}ms.`,
              { provider }
            ));
          }
        }, timeoutMs);
        fn(...config.args).then(
          (v) => { if (!settled) { settled = true; clearTimeout(timer); resolve(v); } },
          (e) => { if (!settled) { settled = true; clearTimeout(timer); reject(e); } },
        );
      });

      // ── 6 & 7. Retry inside middleware ───────────────────────────────────
      const terminal = () => withRetry(callOnce, { retries: this._options.retries, signal });

      try {
        let result = await this.middleware.run({ provider, args: config.args }, terminal);
        const latencyMs = Date.now() - startTime;

        // ── 8. Cache-status metadata ─────────────────────────────────────
        const cacheHit = result && typeof result === 'object' && result._cached === true;
        if (result && typeof result === 'object' && '_cached' in result) {
          result._cacheStatus = result._cached ? 'HIT' : 'MISS';
          if (this._options.cacheHeaders) {
            const ttl = result._ttl ?? 300;
            result._cacheControl = `max-age=${ttl}, stale-while-revalidate=60`;
            result._xCacheStatus  = result._cached ? 'HIT' : 'MISS';
            result._etag          = `"${provider}-${ttl}"`;
          }
        }

        // ── 9. Optional schema validation ────────────────────────────────
        if (this._options.validateResponses && schemaKey) {
          validateResponse(schemaKey, result);
        }

        // ── 10. Response interceptors ─────────────────────────────────────
        result = await this.interceptors.response.run(result);

        // ── 11. Bookkeeping: success ──────────────────────────────────────
        registry.markSuccess(provider);
        metrics.record(provider, { latencyMs, success: true, cacheHit });
        breaker.recordSuccess();
        if (breakerDecision === 'probe') breaker.endProbe();
        this._events.emit('response', { provider, latencyMs });
        logger.debug(`${provider} OK (${latencyMs}ms)`, { provider, latencyMs, cacheStatus: result?._cacheStatus });

        return result;
      } catch (e) {
        const latencyMs = Date.now() - startTime;

        // ── 12. Bookkeeping: failure ──────────────────────────────────────
        registry.markFailure(provider, e);
        metrics.record(provider, { latencyMs, success: false });
        breaker.recordFailure();
        if (breakerDecision === 'probe') breaker.endProbe();
        this._events.emit('error', { provider, error: e.message });
        logger.warn(`Provider "${provider}" failed: ${e.message}`, { provider, latencyMs });

        if (e instanceof BemoraError) throw e;
        throw new ProviderError(e.message, { provider, cause: e });
      }
    };
  }

  _buildWeather() { return { current: this._wrap('openweathermap', (p) => weather.getCurrentWeather(p, this._require('weather', 'weather')), 'weather.current'), forecast: this._wrap('openweathermap', (p) => weather.getForecast(p, this._require('weather', 'weather'))) }; }
  _buildCurrency() { return { rates: this._wrap('exchangerate', (p) => currency.getRates(p, this._require('currency', 'currency'))), convert: this._wrap('exchangerate', (p) => currency.convert(p, this._require('currency', 'currency'))) }; }
  _buildNews() { return { headlines: this._wrap('newsapi', (p) => news.getHeadlines(p, this._require('news', 'news'))), search: this._wrap('newsapi', (p) => news.searchNews(p, this._require('news', 'news'))) }; }
  _buildImages() { return { search: this._wrap('unsplash', (p) => images.searchPhotos(p, this._require('unsplash', 'unsplash'))), random: this._wrap('unsplash', (p) => images.getRandomPhoto(p, this._require('unsplash', 'unsplash'))), pexels: this._wrap('pexels', (p) => images.searchPexels(p, this._require('pexels', 'pexels'))) }; }
  _buildFootball() { return { fixtures: this._wrap('apifootball', (p) => football.getFixtures(p, this._require('football', 'football'))), standings: this._wrap('apifootball', (p) => football.getStandings(p, this._require('football', 'football'))), teams: this._wrap('apifootball', (p) => football.searchTeams(p, this._require('football', 'football'))) }; }
  _buildCrypto() { return { price: this._wrap('coingecko', (p) => crypto.getPrice(p), 'crypto.price'), trending: this._wrap('coingecko', () => crypto.getTrending()), top: this._wrap('coingecko', (p) => crypto.getTopCoins(p)) }; }
  _buildGold() { return { price: this._wrap('goldapi', (p) => gold.getGoldPrice(p, this._require('gold', 'gold'))), silver: this._wrap('goldapi', (p) => gold.getSilverPrice(p, this._require('gold', 'gold'))) }; }
  _buildResearch() { return { wikipedia: this._wrap('wikipedia', (p) => research.searchWikipedia(p)), article: this._wrap('wikipedia', (p) => research.getWikipediaArticle(p)), books: this._wrap('openlibrary', (p) => research.searchBooks(p)) }; }
  _buildLocation() { return { geocode: this._wrap('nominatim', (p) => location.geocode(p), 'location.geocode'), reverse: this._wrap('nominatim', (p) => location.reverseGeocode(p)), distance: location.distance }; }
  _buildIP() { return { lookup: this._wrap('ip-api', (p) => ip.lookup(p), 'ip.lookup'), batchLookup: this._wrap('ip-api', (p) => ip.batchLookup(p)) }; }
  _buildCountries() { return { byName: this._wrap('restcountries', (p) => countries.byName(p), 'countries.byName'), byCode: this._wrap('restcountries', (p) => countries.byCode(p)), byRegion: this._wrap('restcountries', (p) => countries.byRegion(p)), all: this._wrap('restcountries', () => countries.all()) }; }
  _buildTranslate() { return { text: this._wrap('mymemory', (p) => translate.translate(p), 'translate.text'), many: this._wrap('mymemory', (p) => translate.translateMany(p)), detect: this._wrap('mymemory', (p) => translate.detectLanguage(p)) }; }
  _buildMovies() { return { search: this._wrap('tmdb', (p) => movies.searchMovies(p, this._require('movies', 'movies'))), details: this._wrap('tmdb', (p) => movies.getMovie(p, this._require('movies', 'movies'))), trending: this._wrap('tmdb', (p) => movies.getTrending(p, this._require('movies', 'movies'))), tv: this._wrap('tmdb', (p) => movies.searchTV(p, this._require('movies', 'movies'))) }; }

  _buildFood() { 
    return {
      searchMeals: this._wrap('themealdb', (p) => food.searchMeals(p), 'food.search'),
      getRandomMeal: this._wrap('themealdb', () => food.getRandomMeal(), 'food.random'),
      random: this._wrap('themealdb', () => food.getRandomMeal(), 'food.random'),
      getMeal: this._wrap('themealdb', (p) => food.getMeal(p)),
      byCategory: this._wrap('themealdb', (p) => food.byCategory(p)),
      categories: this._wrap('themealdb', () => food.categories()),
      searchSpoonacular: this._wrap('spoonacular', (p) => food.searchSpoonacular({ ...p, apiKey: this._require('spoonacular', 'spoonacular') })),
      getSpoonacularRecipe: this._wrap('spoonacular', (p) => food.getSpoonacularRecipe({ ...p, apiKey: this._require('spoonacular', 'spoonacular') })),
      searchEdamam: this._wrap('edamam', (p) => food.searchEdamam({ ...p, appId: this._require('edamamAppId', 'edamam app ID'), appKey: this._require('edamamAppKey', 'edamam app key') })),
      analyzeEdamam: this._wrap('edamam', (p) => food.analyzeEdamam({ ...p, appId: this._require('edamamAppId', 'edamam app ID'), appKey: this._require('edamamAppKey', 'edamam app key') })),
    }; 
  }

  _buildSpace() { return { apod: this._wrap('nasa', (p) => space.getAPOD(p, this._require('nasa', 'nasa'))), mars: this._wrap('nasa', (p) => space.getMarsPhotos(p, this._require('nasa', 'nasa'))), asteroids: this._wrap('nasa', (p) => space.getNearEarthObjects(p, this._require('nasa', 'nasa'))), issPosition: this._wrap('iss', () => space.getISSPosition(), 'space.iss') }; }
  _buildSearch() { return { instant: this._wrap('duckduckgo', (p) => search.instantAnswer(p)), web: this._wrap('wikipedia', (p) => search.webSearch(p), 'search.web') }; }
  _buildStocks() { return { quote: this._wrap('alphavantage', (p) => stocks.getQuote(p, this._require('stocks', 'stocks'))), search: this._wrap('alphavantage', (p) => stocks.searchStocks(p, this._require('stocks', 'stocks'))), overview: this._wrap('alphavantage', (p) => stocks.getOverview(p, this._require('stocks', 'stocks'))) }; }
  _buildMusic() { return { artist: this._wrap('musicbrainz', (p) => music.searchArtist(p)), album: this._wrap('musicbrainz', (p) => music.searchAlbum(p)), itunes: this._wrap('itunes', (p) => music.itunesSearch(p)) }; }
  _buildSocial() { return { githubUser: this._wrap('github', (p) => social.githubUser(p)), githubRepo: this._wrap('github', (p) => social.githubRepo(p)), githubTrending: this._wrap('github', (p) => social.githubTrending(p)), hackerNews: this._wrap('hn', (p) => social.hackerNewsTop(p), 'social.hackernews'), productHunt: this._wrap('ph', () => social.productHuntToday()) }; }

  _buildAI() {
    const openaiChat = this._wrap('openai', (p) => ai.openaiChat(p, this._require('openai', 'openai')));
    const groqChat = this._wrap('groq', (p) => ai.groqChat(p, this._require('groq', 'groq')));
    const smartChat = (p) => ai.smartChat(p, {
      groqKey: this._keys.groq,
      openaiKey: this._keys.openai,
      anthropicKey: this._keys.anthropic,
      geminiKey: this._keys.gemini,
    });

    return {
      openaiChat,
      openai: openaiChat,
      groqChat,
      groq: groqChat,
      anthropicChat: this._wrap('anthropic', (p) => ai.anthropicChat(p, this._require('anthropic', 'anthropic'))),
      geminiChat: this._wrap('google', (p) => ai.geminiChat(p, this._require('gemini', 'gemini'))),
      smartChat,
      chat: smartChat,
      generateImage: this._wrap('openai', (p) => ai.generateImage(p, this._require('openai', 'openai'))),
      imagine: this._wrap('openai', (p) => ai.generateImage(p, this._require('openai', 'openai'))),
      embed: this._wrap('openai', (p) => ai.embed(p, this._require('openai', 'openai'))),

      /**
       * Stream Groq responses as async generator chunks.
       * @param {{ messages, model?, temperature?, signal? }} params
       * @returns {AsyncGenerator<{ content: string, done: boolean }>}
       * @example
       * for await (const chunk of api.ai.groqStream({ messages })) {
       *   process.stdout.write(chunk.content);
       * }
       */
      groqStream: (p) => ai.groqStream(p, this._require('groq', 'groq')),

      /**
       * Stream OpenAI responses as async generator chunks.
       * @param {{ messages, model?, temperature?, signal? }} params
       * @returns {AsyncGenerator<{ content: string, done: boolean }>}
       */
      openaiStream: (p) => ai.openaiStream(p, this._require('openai', 'openai')),
    };
  }

  _buildUtils() { 
    return { 
      qr: utils.generateQR, 
      uuid: utils.uuid, 
      passwordStrength: utils.passwordStrength, 
      hash: utils.hash, 
      base64Encode: utils.base64Encode, 
      base64Decode: utils.base64Decode, 
      loremIpsum: utils.loremIpsum, 
      emojiSearch: utils.emojiSearch, 
      randomEmoji: utils.randomEmoji, 
      hexToRgb: utils.hexToRgb, 
      rgbToHex: utils.rgbToHex, 
      httpStatus: utils.httpStatus, 
      shorten: this._wrap('isgd', (p) => utils.shortenURL(p)), 
      time: this._wrap('worldtime', (p) => utils.getTime(p)), 
      timezones: this._wrap('worldtime', () => utils.listTimezones()), 
      holidays: this._wrap('nager', (p) => utils.getHolidays(p), 'utils.holidays'), 
      quote: this._wrap('quotable', (p) => utils.getQuote(p)), 
      quotes: this._wrap('quotable', (p) => utils.getQuotes(p)), 
      define: this._wrap('dictionary', (p) => utils.define(p)), 
      trivia: this._wrap('opentdb', (p) => utils.getTrivia(p)), 
      color: this._wrap('colorapi', (p) => utils.getColor(p)),
      randomNumber: utils.randomNumber,
      formatDate: utils.formatDate,
      validateJSON: utils.validateJSON,
      parseURL: utils.parseURL,
      slugify: utils.slugify,
    }; 
  }

  _buildFandom() { return { search: this._wrap('fandom', (p) => fandom.search(p)), getPage: this._wrap('fandom', (p) => fandom.getPage(p)), recentActivity: this._wrap('fandom', (p) => fandom.recentActivity(p)) }; }

  _buildSpotify() { 
    return { 
      searchTracks: this._wrap('spotify', (p) => spotify.searchTracks({ ...p, clientId: this._require('spotifyClientId', 'spotify client id'), clientSecret: this._require('spotifyClientSecret', 'spotify client secret') })),
      getArtist: this._wrap('spotify', (p) => spotify.getArtist({ ...p, clientId: this._require('spotifyClientId', 'spotify client id'), clientSecret: this._require('spotifyClientSecret', 'spotify client secret') })),
      getArtistTopTracks: this._wrap('spotify', (p) => spotify.getArtistTopTracks({ ...p, clientId: this._require('spotifyClientId', 'spotify client id'), clientSecret: this._require('spotifyClientSecret', 'spotify client secret') })),
    }; 
  }

  _buildStackExchange() { return { searchQuestions: this._wrap('stackexchange', (p) => stackexchange.searchQuestions(p)), getQuestion: this._wrap('stackexchange', (p) => stackexchange.getQuestion(p)), getTopUsers: this._wrap('stackexchange', (p) => stackexchange.getTopUsers(p)) }; }

  _buildSteam() { return { getPlayerSummaries: this._wrap('steam', (p) => steam.getPlayerSummaries({ ...p, apiKey: this._require('steam', 'steam') })), getOwnedGames: this._wrap('steam', (p) => steam.getOwnedGames({ ...p, apiKey: this._require('steam', 'steam') })), searchApps: this._wrap('steam', (p) => steam.searchApps(p)) }; }

  _buildAnimals() { return { randomDog: this._wrap('dogceo', () => animals.getRandomDog()), randomCat: this._wrap('thecatapi', () => animals.getRandomCat()), randomFox: this._wrap('randomfox', () => animals.getRandomFox()), randomDuck: this._wrap('randomduck', () => animals.getRandomDuck()), randomPanda: this._wrap('some-random-api', () => animals.getRandomPanda()), randomBird: this._wrap('some-random-api', () => animals.getRandomBird()) }; }
  _buildBooks() { return { search: this._wrap('googlebooks', (p) => books.searchBooks(p)), getById: this._wrap('googlebooks', (p) => books.getBookById(p)), random: this._wrap('openlibrary', () => books.getRandomBook()) }; }
  _buildLyrics() { return { search: this._wrap('lyricsovh', (p) => lyrics.searchLyrics(p)) }; }
  _buildMath() { return { evaluate: this._wrap('mathjs', (p) => math.evaluateMath(p)), randomFact: this._wrap('numbersapi', (p) => math.getRandomMathFact(p)) }; }
  _buildJobs() { return { search: this._wrap('adzuna', (p) => jobs.searchJobs(p)) }; }
  _buildScience() { return { nasaApod: this._wrap('nasa', (p) => science.getNasaApod(p)), randomFact: this._wrap('uselessfacts', () => science.getRandomScienceFact()) }; }
  _buildBasketball() { return { nbaTeams: this._wrap('balldontlie', () => basketball.getNBATeams()), nbaGames: this._wrap('balldontlie', (p) => basketball.getNBAGames(p)), nbaPlayer: this._wrap('balldontlie', (p) => basketball.getNBAPlayer(p)) }; }
  _buildVehicles() { return { randomCar: this._wrap('nhtsa', () => vehicles.getRandomCar()) }; }
  _buildPets() { return { random: this._wrap('randomdog', () => pets.getRandomPet()) }; }
  _buildDrinks() { return { randomCocktail: this._wrap('thecocktaildb', () => drinks.getRandomCocktail()), searchCocktail: this._wrap('thecocktaildb', (p) => drinks.searchCocktail(p)), searchIngredient: this._wrap('thecocktaildb', (p) => drinks.searchIngredient(p)) }; }
  _buildGeography() { return { countryInfo: this._wrap('restcountries', (p) => geography.getCountryInfo(p)), allCountries: this._wrap('restcountries', () => geography.getAllCountries()), capitalCity: this._wrap('restcountries', (p) => geography.getCapitalCity(p)) }; }
  _buildComics() { return { randomXKCD: this._wrap('xkcd', () => comics.getRandomXKCD(), 'comics.xkcd'), getXKCD: this._wrap('xkcd', (p) => comics.getXKCD(p)) }; }
  _buildTV() { return { search: this._wrap('tmdb', (p) => tv.searchTVShows(p, this._require('movies', 'movies'))), details: this._wrap('tmdb', (p) => tv.getTVShowDetails(p, this._require('movies', 'movies'))), trending: this._wrap('tmdb', (p) => tv.getTrendingTV(p, this._require('movies', 'movies'))) }; }
  _buildBaseball() { return { mlbTeams: this._wrap('mlb', () => baseball.getMLBTeams()), mlbSchedule: this._wrap('mlb', (p) => baseball.getMLBSchedule(p)) }; }
  _buildHockey() { return { nhlTeams: this._wrap('nhl', () => hockey.getNHLTeams()), nhlPlayer: this._wrap('nhl', (p) => hockey.getNHLPlayer(p)) }; }
  _buildFinance() { return { stockQuote: this._wrap('yahoo', (p) => finance.getStockQuote(p)), cryptoPrice: this._wrap('coingecko', (p) => finance.getCryptoPrice(p)) }; }
  _buildLiterature() { return { randomQuote: this._wrap('quotable', () => literature.getRandomQuote()), searchQuotes: this._wrap('quotable', (p) => literature.searchQuotes(p)) }; }
  _buildWildlife() { return { randomFact: this._wrap('some-random-api', () => wildlife.getRandomAnimalFact()) }; }
  _buildPolitics() { return { presidents: this._wrap('usa', () => politics.getPresidents()) }; }
  _buildLanguage() { return { detect: this._wrap('libretranslate', (p) => language.detectLanguage(p)), translate: this._wrap('libretranslate', (p) => language.translateText(p)) }; }
  _buildLaw() { return { search: this._wrap('law', (p) => law.searchLaws(p)) }; }
  _buildMilitary() { return { time: this._wrap('military', (p) => military.getMilitaryTime(p)) }; }
  _buildThesaurus() { return { synonyms: this._wrap('datamuse', (p) => thesaurus.getSynonyms(p)), antonyms: this._wrap('datamuse', (p) => thesaurus.getAntonyms(p)), rhymes: this._wrap('datamuse', (p) => thesaurus.getRhymes(p)), suggest: this._wrap('datamuse', (p) => thesaurus.suggest(p)) }; }
  _buildCurrencyHistory() { return { latest: this._wrap('frankfurter', (p) => currencyhistory.getLatestRates(p)), historical: this._wrap('frankfurter', (p) => currencyhistory.getHistoricalRates(p)), timeSeries: this._wrap('frankfurter', (p) => currencyhistory.getTimeSeries(p)) }; }
  _buildMarkdown() { return { render: this._wrap('github-markdown', (p) => markdown.render(p)), renderGfm: this._wrap('github-markdown', (p) => markdown.renderGfm(p)), analyze: this._wrap('local', (p) => markdown.analyze(p)) }; }
  _buildTechDB() { return { listDevices: this._wrap('restful-api-dev', () => techdb.listDevices()), getDevice: this._wrap('restful-api-dev', (p) => techdb.getDevice(p)), searchDevices: this._wrap('restful-api-dev', (p) => techdb.searchDevices(p)), compareDevices: this._wrap('restful-api-dev', (p) => techdb.compareDevices(p)) }; }
  _buildWebsites() { return { status: this._wrap('website-fetch', (p) => websites.status(p)), detectTechStack: this._wrap('website-fetch', (p) => websites.detectTechStack(p)), getMeta: this._wrap('website-fetch', (p) => websites.getMeta(p)) }; }
  _buildFakeDB() { return { getPosts: this._wrap('jsonplaceholder', (p) => fakedb.getPosts(p)), getComments: this._wrap('jsonplaceholder', (p) => fakedb.getComments(p)), getUser: this._wrap('jsonplaceholder', (p) => fakedb.getUser(p)), getUsers: this._wrap('jsonplaceholder', () => fakedb.getUsers()), getTodos: this._wrap('jsonplaceholder', (p) => fakedb.getTodos(p)), getAlbums: this._wrap('jsonplaceholder', (p) => fakedb.getAlbums(p)), getPhotos: this._wrap('jsonplaceholder', (p) => fakedb.getPhotos(p)), create: this._wrap('jsonplaceholder', (p) => fakedb.create(p)) }; }
  _buildReligion() { return { randomVerse: this._wrap('bibleapi', () => religion.getRandomVerse()), getVerse: this._wrap('bibleapi', (p) => religion.getVerse(p)) }; }
  _buildIslamic() { return { quranChapters: this._wrap('alquran', () => islamic.getQuranChapters()), quranChapter: this._wrap('alquran', (p) => islamic.getQuranChapter(p)), randomVerse: this._wrap('alquran', () => islamic.getRandomVerse()), azkar: this._wrap('hisnmuslim', (p) => islamic.getAzkar(p)), prayerTimes: this._wrap('aladhan', (p) => islamic.getPrayerTimes(p)) }; }
  _buildGaming() { return {
    freeFirePlayer: this._wrap('freefire', (p) => gaming.getFreeFirePlayer(p)),
    pubgPlayer: this._wrap('pubg', (p) => gaming.getPubgPlayer(p)),
    crossfireNews: this._wrap('crossfire', () => gaming.getCrossfireNews()),
    freeFireNews: this._wrap('freefire', () => gaming.getFreeFireNews()),
    pubgPatchNotes: this._wrap('pubg', () => gaming.getPubgPatchNotes()),
    crossfireWeapons: this._wrap('crossfire', (p) => gaming.getCrossfireWeapons(p)),
    crossfireWeapon: this._wrap('crossfire', (p) => gaming.getCrossfireWeapon(p)),
    crossfireMaps: this._wrap('crossfire', (p) => gaming.getCrossfireMaps(p)),
    crossfireCharacters: this._wrap('crossfire', (p) => gaming.getCrossfireCharacters(p)),
    crossfireGameModes: this._wrap('crossfire', (p) => gaming.getCrossfireGameModes(p)),
    crossfireEvents: this._wrap('crossfire', (p) => gaming.getCrossfireEvents(p)),
    crossfireSearch: this._wrap('crossfire', (p) => gaming.searchCrossfireWiki(p)),
    fortniteCosmetic: this._wrap('fortnite', (p) => gaming.searchFortniteCosmetic(p)),
    fortniteShop: this._wrap('fortnite', () => gaming.getFortniteShop()),
    lolChampions: this._wrap('lol', () => gaming.getLolChampions()),
    lolChampion: this._wrap('lol', (p) => gaming.getLolChampion(p)),
    minecraftPlayer: this._wrap('minecraft', (p) => gaming.getMinecraftPlayer(p)),
    minecraftServerStatus: this._wrap('minecraft', (p) => gaming.getMinecraftServerStatus(p)),
    chessPlayer: this._wrap('chess', (p) => gaming.getChessPlayer(p)),
    chessDailyPuzzle: this._wrap('chess', () => gaming.getChessDailyPuzzle()),
    searchGameWiki: this._wrap('gamewiki', (p) => gaming.searchGameWiki(p)),
  }; }
  _buildSpaceExtended() { return { apod: this._wrap('nasa', (p) => spaceExtended.getAPOD(p)), marsPhotos: this._wrap('nasa', (p) => spaceExtended.getMarsPhotos(p)), nearEarthObjects: this._wrap('nasa', (p) => spaceExtended.getNearEarthObjects(p)), issPosition: this._wrap('open-notify', () => spaceExtended.getISSPosition()) }; }

  _buildFree() { return { weather: this._wrap('open-meteo', (p) => pub.openMeteoWeather(p)), wttr: this._wrap('wttr', (p) => pub.wttrWeather(p)), exchangeRates: this._wrap('exchangerate.host', (p) => pub.freeExchangeRates(p)), binanceTicker: this._wrap('binance', (p) => pub.binanceTicker(p)), binanceTickers: this._wrap('binance', (p) => pub.binanceTickers(p)), football: this._wrap('openligadb', (p) => pub.openLigaFixtures(p)) }; }
  _buildRSS() { return { fetch: this._wrap('rss', (p) => rss.fetchFeed(p)), custom: this._wrap('rss', (p) => rss.fetchCustomFeed(p)), aggregate: this._wrap('rss', (p) => rss.aggregateFeeds(p)), sources: () => rss.AVAILABLE_SOURCES }; }
  _buildRealtime() { return { binance: (symbols) => new realtime.BinanceStream(symbols), kraken: (pairs) => new realtime.KrakenStream(pairs), getPrice: (p) => realtime.getRealtimePrice(p) }; }
  _buildSmart() {
    const k = this._keys;
    return {
      weather: async ({ city, units = 'metric' }) => {
        const chain = [];
        if (k.weather) chain.push({ name: 'openweathermap', fn: () => weather.getCurrentWeather({ city, units }, k.weather) });
        chain.push({ name: 'wttr.in', fn: () => pub.wttrWeather({ city, format: 'full' }) }, { name: 'open-meteo', fn: async () => { const geo = await location.geocode({ address: city }); const { lat, lon } = geo.results?.[0] || {}; return pub.openMeteoWeather({ lat, lon, units: units === 'imperial' ? 'fahrenheit' : 'celsius' }); } });
        return fallbackChain(`smart:weather:${city}`, chain, 600);
      },
      news: async ({ topic, limit = 10 } = {}) => {
        const chain = [];
        if (k.news) chain.push({ name: 'newsapi', fn: () => news.searchNews({ q: topic || 'world', pageSize: limit }, k.news) });
        chain.push({ name: 'bbc-world-rss', fn: () => rss.fetchFeed({ source: 'bbc-world', limit }) }, { name: 'aljazeera-rss', fn: () => rss.fetchFeed({ source: 'aljazeera', limit }) }, { name: 'google-news-rss', fn: () => rss.fetchFeed({ source: 'google-news', limit }) });
        return fallbackChain(`smart:news:${topic || 'world'}`, chain, 600);
      },
      crypto: async ({ coin = 'bitcoin' } = {}) => {
        const symbolMap = { bitcoin: 'BTCUSDT', ethereum: 'ETHUSDT', solana: 'SOLUSDT', dogecoin: 'DOGEUSDT' };
        return fallbackChain(`smart:crypto:${coin}`, [ { name: 'coingecko', fn: () => crypto.getPrice({ coins: coin }) }, { name: 'binance', fn: () => pub.binanceTicker({ symbol: symbolMap[coin] || `${coin.toUpperCase()}USDT` }) } ], 30);
      },
      currency: async ({ base = 'USD', symbols = [] } = {}) => {
        const chain = [];
        if (k.currency) chain.push({ name: 'exchangerate-api', fn: () => currency.getRates({ base, symbols }, k.currency) });
        chain.push({ name: 'exchangerate.host', fn: () => pub.freeExchangeRates({ base, symbols }) });
        return fallbackChain(`smart:currency:${base}`, chain, 3600);
      },
      weatherAggregate: async ({ city }) => {
        const geo = await location.geocode({ address: city }).catch(() => null);
        const sources = [ { name: 'wttr.in', fn: () => pub.wttrWeather({ city, format: 'full' }).then((d) => ({ temperature: parseFloat(d.temperature_c) })) } ];
        if (geo?.results?.[0]) { const { lat, lon } = geo.results[0]; sources.push({ name: 'open-meteo', fn: () => pub.openMeteoWeather({ lat, lon }).then((d) => ({ temperature: d.temperature })) }); }
        if (k.weather) sources.push({ name: 'openweathermap', fn: () => weather.getCurrentWeather({ city }, k.weather).then((d) => ({ temperature: d.temperature })) });
        return aggregate(sources, { strategy: 'average', field: 'temperature' });
      },
    };
  }

  _buildPrayer() { return { today: this._wrap('aladhan', (p) => prayer.timingsByCity(p)), byCoords: this._wrap('aladhan', (p) => prayer.timingsByCoords(p)), monthly: this._wrap('aladhan', (p) => prayer.monthlyTimings(p)), methods: () => prayer.CALCULATION_METHODS }; }
  _buildAnime() { return {
    search: this._wrap('jikan', (p) => anime.searchAnime(p)),
    details: this._wrap('jikan', (p) => anime.getAnime(p)),
    top: this._wrap('jikan', (p) => anime.topAnime(p)),
    nowAiring: this._wrap('jikan', () => anime.currentSeason()),
    random: this._wrap('jikan', () => anime.randomAnime()),
    manga: this._wrap('jikan', (p) => anime.searchManga(p)),
    mangaDetails: this._wrap('jikan', (p) => anime.getManga(p)),
    episodes: this._wrap('jikan', (p) => anime.getEpisodes(p)),
    episode: this._wrap('jikan', (p) => anime.getEpisode(p)),
    characters: this._wrap('jikan', (p) => anime.getCharacters(p)),
    character: this._wrap('jikan', (p) => anime.getCharacter(p)),
    videos: this._wrap('jikan', (p) => anime.getVideos(p)),
    pictures: this._wrap('jikan', (p) => anime.getPictures(p)),
    recommendations: this._wrap('jikan', (p) => anime.getRecommendations(p)),
    news: this._wrap('jikan', (p) => anime.getNews(p)),
    quote: this._wrap('animechan', (p) => anime.getQuote(p)),
    quotesByCharacter: this._wrap('yurippe', (p) => anime.getQuotesByCharacter(p)),
  }; }
  _buildFlights() { return { live: this._wrap('aviationstack', (p) => flights.getLiveFlights(p, this._require('flights', 'flights'))), airport: this._wrap('aviationstack', (p) => flights.getAirport(p, this._require('flights', 'flights'))), airline: this._wrap('aviationstack', (p) => flights.getAirline(p, this._require('flights', 'flights'))) }; }
  _buildArt() { return { search: this._wrap('artic', (p) => art.searchArtworks(p)), details: this._wrap('artic', (p) => art.getArtwork(p)), searchMet: this._wrap('metmuseum', (p) => art.searchMet(p)), metDetails: this._wrap('metmuseum', (p) => art.getMetArtwork(p)) }; }
  _buildDev() { return { npmPackage: this._wrap('npmjs', (p) => dev.npmPackage(p)), npmDownloads: this._wrap('npmjs', (p) => dev.npmDownloads(p)), githubRepos: this._wrap('github', (p) => dev.githubRepos(p)), githubReleases: this._wrap('github', (p) => dev.githubReleases(p)), validateEmail: this._wrap('dns', (p) => dev.validateEmail(p)), dnsLookup: this._wrap('dns', (p) => dev.dnsLookup(p)), loremIpsum: this._wrap('loripsum', (p) => dev.loremIpsum(p)), httpStatus: dev.httpStatus }; }
  _buildPodcasts() { return { search: this._wrap('itunes', (p) => podcasts.searchPodcasts(p)), episodes: this._wrap('podcast-rss', (p) => podcasts.getPodcastEpisodes(p)), index: this._wrap('podcastindex', (p) => podcasts.searchPodcastIndex(p)) }; }
  _buildMedical() { return { drug: this._wrap('fda', (p) => medical.searchDrug(p)), disease: this._wrap('wikipedia', (p) => medical.getDiseaseInfo(p)), exercises: this._wrap('wger', (p) => medical.getExercises(p)), nutrition: this._wrap('openfoodfacts', (p) => medical.getNutrition(p)), bmi: medical.calculateBMI }; }
  _buildEnriched() { return { weather: this._wrap('openweathermap', (p) => enriched.getEnrichedWeather(p, this._require('weather', 'weather'))), compareCities: this._wrap('openweathermap', (p) => enriched.compareCities(p, this._require('weather', 'weather'))) }; }
  _buildCombined() { return { marketSnapshot: this._wrap('coingecko', (p) => combined.getMarketSnapshot(p, this._keys.gold, this._keys.currency)), newsDigest: this._wrap('newsapi', (p) => combined.getNewsDigest(p, this._require('news', 'news'))) }; }

  _buildCovid() { return { global: this._wrap('disease.sh', () => covid.getGlobal()), country: this._wrap('disease.sh', (p) => covid.getCountry(p)), historical: this._wrap('disease.sh', (p) => covid.getHistorical(p)), topCountries: this._wrap('disease.sh', (p) => covid.getTopCountries(p)) }; }
  _buildEarthquake() { return { recent: this._wrap('usgs', (p) => earthquake.getRecent(p)), byLocation: this._wrap('usgs', (p) => earthquake.getByLocation(p)), biggestToday: this._wrap('usgs', () => earthquake.getBiggestToday()) }; }
  _buildAirQuality() { return { current: this._wrap('open-meteo-aq', (p) => airquality.getCurrent(p)), forecast: this._wrap('open-meteo-aq', (p) => airquality.getForecast(p)), classify: airquality.classifyAQI }; }
  _buildAstronomy() { return { sunriseSunset: this._wrap('sunrise-sunset.org', (p) => astronomy.getSunriseSunset(p)), moonPhase: this._wrap('farmsense', (p) => astronomy.getMoonPhase(p)) }; }
  _buildPostal() { return { lookup: this._wrap('zippopotam', (p) => postal.lookup(p)) }; }
  _buildPredict() { return { nationality: this._wrap('nationalize', (p) => predict.predictNationality(p)), gender: this._wrap('genderize', (p) => predict.predictGender(p)), age: this._wrap('agify', (p) => predict.predictAge(p)), all: this._wrap('predict-combo', (p) => predict.predictAll(p)) }; }
  _buildBrewery() { return { search: this._wrap('openbrewerydb', (p) => brewery.search(p)), random: this._wrap('openbrewerydb', () => brewery.random()), getById: this._wrap('openbrewerydb', (p) => brewery.getById(p)) }; }
  _buildSportsDB() { return { searchTeam: this._wrap('thesportsdb', (p) => sportsdb.searchTeam(p)), searchPlayer: this._wrap('thesportsdb', (p) => sportsdb.searchPlayer(p)), leagueEvents: this._wrap('thesportsdb', (p) => sportsdb.getLeagueEvents(p)), leagues: this._wrap('thesportsdb', (p) => sportsdb.listLeagues(p)) }; }
  _buildDomain() { return { whois: this._wrap('rdap', (p) => domain.whois(p)), dnsRecords: this._wrap('dns', (p) => domain.dnsRecords(p)), resolveIp: this._wrap('dns', (p) => domain.resolveIp(p)) }; }
  _buildPlaceholder() { return { image: placeholder.placeholderImage, picsum: placeholder.picsumImage, avatar: placeholder.avatarUrl, dicebear: placeholder.dicebearAvatar }; }
  _buildWeatherAlerts() { return { usAlerts: this._wrap('weather.gov', (p) => weatheralerts.getUSAlerts(p)), pointForecast: this._wrap('weather.gov', (p) => weatheralerts.getPointForecast(p)) }; }
  _buildCoinWizard() {
    return {
      info: this._wrap('coingecko', (p) => coinwizard.coinInfo(p)),
      chart: this._wrap('coingecko', (p) => coinwizard.marketChart(p)),
      ohlc: this._wrap('coingecko', (p) => coinwizard.ohlc(p)),
      global: this._wrap('coingecko', () => coinwizard.globalMarket()),
      exchanges: this._wrap('coingecko', (p) => coinwizard.exchanges(p)),
      categories: this._wrap('coingecko', (p) => coinwizard.categories(p)),
      gainersLosers: this._wrap('coingecko', (p) => coinwizard.gainersLosers(p)),
      search: this._wrap('coingecko', (p) => coinwizard.searchCoins(p)),
      convert: this._wrap('coingecko', (p) => coinwizard.convertCoin(p)),
      list: this._wrap('coingecko', () => coinwizard.supportedCoinsList()),
    };
  }
  // ── Enterprise _build methods ─────────────────────────────────────────────

  _buildPayments() {
    return {
      stripe: {
        createCharge:        this._wrap('stripe', (p) => stripeProvider.createCharge(p, this._keys.stripe)),
        createPaymentIntent: this._wrap('stripe', (p) => stripeProvider.createPaymentIntent(p, this._keys.stripe)),
        createCustomer:      this._wrap('stripe', (p) => stripeProvider.createCustomer(p, this._keys.stripe)),
        createSubscription:  this._wrap('stripe', (p) => stripeProvider.createSubscription(p, this._keys.stripe)),
        createRefund:        this._wrap('stripe', (p) => stripeProvider.createRefund(p, this._keys.stripe)),
        verifyWebhook:       (p) => stripeProvider.verifyWebhook({ ...p, secret: p.secret ?? this._keys.stripeWebhook }),
      },
      paypal: {
        createOrder:   this._wrap('paypal', (p) => paypalProvider.createOrder(p, this._keys.paypal)),
        captureOrder:  this._wrap('paypal', (p) => paypalProvider.captureOrder(p, this._keys.paypal)),
        refundCapture: this._wrap('paypal', (p) => paypalProvider.refundCapture(p, this._keys.paypal)),
      },
    };
  }

  _buildEmail() {
    return {
      sendgrid: {
        send:             this._wrap('sendgrid', (p) => sendgridProvider.send(p, this._keys.sendgrid)),
        batch:            this._wrap('sendgrid', (p) => sendgridProvider.batch(p, this._keys.sendgrid)),
        stats:            this._wrap('sendgrid', (p) => sendgridProvider.stats(p, this._keys.sendgrid)),
        getSuppressions:  this._wrap('sendgrid', (p) => sendgridProvider.getSuppressions(p, this._keys.sendgrid)),
        verifyWebhook:    (p) => sendgridProvider.verifyWebhook({ ...p, publicKey: p.publicKey ?? this._keys.sendgrid }),
      },
      ses: {
        send:         this._wrap('ses', (p) => sesProvider.send(p, this._keys.ses)),
        sendTemplated: this._wrap('ses', (p) => sesProvider.sendTemplated(p, this._keys.ses)),
        getStats:     this._wrap('ses', (p) => sesProvider.getStats(p, this._keys.ses)),
      },
      resend: {
        send:         this._wrap('resend', (p) => resendProvider.send(p, this._keys.resend)),
        batch:        this._wrap('resend', (p) => resendProvider.batch(p, this._keys.resend)),
        getEmail:     this._wrap('resend', (p) => resendProvider.getEmail(p, this._keys.resend)),
        cancelEmail:  this._wrap('resend', (p) => resendProvider.cancelEmail(p, this._keys.resend)),
        listDomains:  this._wrap('resend', (p) => resendProvider.listDomains(p, this._keys.resend)),
        verifyWebhook: (p) => resendProvider.verifyWebhook({ ...p, secret: p.secret ?? this._keys.resend }),
      },
    };
  }

  _buildSMS() {
    return {
      twilio: {
        send:         this._wrap('twilio', (p) => twilioProvider.send(p, this._keys.twilio)),
        lookup:       this._wrap('twilio', (p) => twilioProvider.lookup(p, this._keys.twilio)),
        listMessages: this._wrap('twilio', (p) => twilioProvider.listMessages(p, this._keys.twilio)),
        verifyWebhook: (p) => twilioProvider.verifyWebhook({ ...p, authToken: p.authToken ?? this._keys.twilio?.authToken }),
      },
    };
  }

  _buildAuth() {
    return {
      clerk: {
        getUser:        this._wrap('clerk', (p) => clerkProvider.getUser(p, this._keys.clerk)),
        listUsers:      this._wrap('clerk', (p) => clerkProvider.listUsers(p, this._keys.clerk)),
        getUserCount:   this._wrap('clerk', (p) => clerkProvider.getUserCount(p, this._keys.clerk)),
        verifySession:  this._wrap('clerk', (p) => clerkProvider.verifySession(p, this._keys.clerk)),
        revokeSession:  this._wrap('clerk', (p) => clerkProvider.revokeSession(p, this._keys.clerk)),
        createUser:     this._wrap('clerk', (p) => clerkProvider.createUser(p, this._keys.clerk)),
        deleteUser:     this._wrap('clerk', (p) => clerkProvider.deleteUser(p, this._keys.clerk)),
      },
      auth0: {
        getUser:        this._wrap('auth0', (p) => auth0Provider.getUser(p, this._keys.auth0)),
        listUsers:      this._wrap('auth0', (p) => auth0Provider.listUsers(p, this._keys.auth0)),
        getUserInfo:    this._wrap('auth0', (p) => auth0Provider.getUserInfo(p, this._keys.auth0)),
        verifyToken:    this._wrap('auth0', (p) => auth0Provider.verifyToken(p, this._keys.auth0)),
        blockUser:      this._wrap('auth0', (p) => auth0Provider.blockUser(p, this._keys.auth0)),
      },
    };
  }

  _buildJWT() {
    return {
      sign:           jwtProvider.sign,
      verify:         jwtProvider.verify,
      decode:         jwtProvider.decode,
      refresh:        (p) => jwtProvider.refresh(p, this._keys.jwtSecret),
      generateSecret: jwtProvider.generateSecret,
    };
  }

  _buildStorage() {
    return {
      s3: {
        presignedGetUrl: this._wrap('s3', (p) => s3Provider.presignedGetUrl(p, this._keys.s3)),
        presignedPutUrl: this._wrap('s3', (p) => s3Provider.presignedPutUrl(p, this._keys.s3)),
        upload:          this._wrap('s3', (p) => s3Provider.upload(p, this._keys.s3)),
        download:        this._wrap('s3', (p) => s3Provider.download(p, this._keys.s3)),
        deleteObject:    this._wrap('s3', (p) => s3Provider.deleteObject(p, this._keys.s3)),
        list:            this._wrap('s3', (p) => s3Provider.list(p, this._keys.s3)),
      },
      r2: {
        presignedGetUrl: this._wrap('r2', (p) => r2Provider.presignedGetUrl(p, this._keys.r2)),
        presignedPutUrl: this._wrap('r2', (p) => r2Provider.presignedPutUrl(p, this._keys.r2)),
        upload:          this._wrap('r2', (p) => r2Provider.upload(p, this._keys.r2)),
        download:        this._wrap('r2', (p) => r2Provider.download(p, this._keys.r2)),
        deleteObject:    this._wrap('r2', (p) => r2Provider.deleteObject(p, this._keys.r2)),
        list:            this._wrap('r2', (p) => r2Provider.list(p, this._keys.r2)),
      },
      gcs: {
        presignedGetUrl: this._wrap('gcs', (p) => gcsProvider.presignedGetUrl(p, this._keys.gcs)),
        presignedPutUrl: this._wrap('gcs', (p) => gcsProvider.presignedPutUrl(p, this._keys.gcs)),
        upload:          this._wrap('gcs', (p) => gcsProvider.upload(p, this._keys.gcs)),
        download:        this._wrap('gcs', (p) => gcsProvider.download(p, this._keys.gcs)),
        deleteObject:    this._wrap('gcs', (p) => gcsProvider.deleteObject(p, this._keys.gcs)),
        list:            this._wrap('gcs', (p) => gcsProvider.list(p, this._keys.gcs)),
      },
    };
  }

  _buildVectorDB() {
    return {
      pinecone: {
        upsert:       this._wrap('pinecone', (p) => pineconeProvider.upsert(p, this._keys.pinecone)),
        query:        this._wrap('pinecone', (p) => pineconeProvider.query(p, this._keys.pinecone)),
        delete:       this._wrap('pinecone', (p) => pineconeProvider.deleteVectors(p, this._keys.pinecone)),
        fetch:        this._wrap('pinecone', (p) => pineconeProvider.fetch(p, this._keys.pinecone)),
        listIndexes:  this._wrap('pinecone', (p) => pineconeProvider.listIndexes(p, this._keys.pinecone)),
        describeIndex: this._wrap('pinecone', (p) => pineconeProvider.describeIndex(p, this._keys.pinecone)),
      },
      qdrant: {
        upsert:           this._wrap('qdrant', (p) => qdrantProvider.upsert(p, this._keys.qdrant)),
        query:            this._wrap('qdrant', (p) => qdrantProvider.query(p, this._keys.qdrant)),
        delete:           this._wrap('qdrant', (p) => qdrantProvider.deletePoints(p, this._keys.qdrant)),
        getPoints:        this._wrap('qdrant', (p) => qdrantProvider.getPoints(p, this._keys.qdrant)),
        createCollection: this._wrap('qdrant', (p) => qdrantProvider.createCollection(p, this._keys.qdrant)),
        listCollections:  this._wrap('qdrant', (p) => qdrantProvider.listCollections(p, this._keys.qdrant)),
        getCollection:    this._wrap('qdrant', (p) => qdrantProvider.getCollection(p, this._keys.qdrant)),
      },
      weaviate: {
        upsert:       this._wrap('weaviate', (p) => weaviateProvider.upsert(p, this._keys.weaviate)),
        query:        this._wrap('weaviate', (p) => weaviateProvider.query(p, this._keys.weaviate)),
        delete:       this._wrap('weaviate', (p) => weaviateProvider.deleteObjects(p, this._keys.weaviate)),
        getSchema:    this._wrap('weaviate', (p) => weaviateProvider.getSchema(p, this._keys.weaviate)),
        createClass:  this._wrap('weaviate', (p) => weaviateProvider.createClass(p, this._keys.weaviate)),
      },
      pgvector: {
        createTable:  pgvectorProvider.createTable,
        upsert:       pgvectorProvider.upsert,
        query:        pgvectorProvider.query,
        delete:       pgvectorProvider.deleteVectors,
        getById:      pgvectorProvider.getById,
        count:        pgvectorProvider.count,
      },
    };
  }

  _buildSentry() {
    return {
      captureException: (p) => sentryProvider.captureException(p, this._keys.sentry),
      captureMessage:   (p) => sentryProvider.captureMessage(p, this._keys.sentry),
      captureEvent:     (p) => sentryProvider.captureEvent(p, this._keys.sentry),
    };
  }

  _buildNotifications() {
    return {
      onesignal: {
        send:            this._wrap('onesignal', (p) => onesignalProvider.send(p, this._keys.onesignal.apiKey)),
        cancel:          this._wrap('onesignal', (p) => onesignalProvider.cancel(p, this._keys.onesignal.apiKey)),
        getNotification: this._wrap('onesignal', (p) => onesignalProvider.getNotification(p, this._keys.onesignal.apiKey)),
        addDevice:       this._wrap('onesignal', (p) => onesignalProvider.addDevice(p, this._keys.onesignal.apiKey)),
      },
      pusher: {
        trigger:              (p) => pusherProvider.trigger({ ...p, ...this._keys.pusher }),
        authenticateChannel:  (p) => pusherProvider.authenticateChannel({ ...p, ...this._keys.pusher }),
        getChannel:           (p) => pusherProvider.getChannel({ ...p, ...this._keys.pusher }),
      },
      fcm: {
        send:          (p) => fcmProvider.send({ ...p, projectId: this._keys.fcm.projectId }, p.accessToken),
        sendMulticast: (p) => fcmProvider.sendMulticast({ ...p, projectId: this._keys.fcm.projectId }, p.accessToken),
      },
    };
  }

  _buildMaps() {
    return {
      google: {
        geocode:       this._wrap('google-maps', (p) => googleMapsProvider.geocode(p, this._keys.googleMaps)),
        reverseGeocode: this._wrap('google-maps', (p) => googleMapsProvider.reverseGeocode(p, this._keys.googleMaps)),
        directions:    this._wrap('google-maps', (p) => googleMapsProvider.directions(p, this._keys.googleMaps)),
        distanceMatrix: this._wrap('google-maps', (p) => googleMapsProvider.distanceMatrix(p, this._keys.googleMaps)),
        staticMap:     (p) => googleMapsProvider.staticMap(p, this._keys.googleMaps),
        searchPlaces:  this._wrap('google-maps', (p) => googleMapsProvider.searchPlaces(p, this._keys.googleMaps)),
      },
      mapbox: {
        geocode:       this._wrap('mapbox', (p) => mapboxProvider.geocode(p, this._keys.mapbox)),
        reverseGeocode: this._wrap('mapbox', (p) => mapboxProvider.reverseGeocode(p, this._keys.mapbox)),
        directions:    this._wrap('mapbox', (p) => mapboxProvider.directions(p, this._keys.mapbox)),
        staticMap:     (p) => mapboxProvider.staticMap(p, this._keys.mapbox),
        isochrone:     this._wrap('mapbox', (p) => mapboxProvider.isochrone(p, this._keys.mapbox)),
      },
    };
  }

  _buildSearchEnterprise() {
    return {
      algolia: {
        search:      this._wrap('algolia', (p) => algoliaProvider.search(p, this._keys.algolia)),
        addObjects:  this._wrap('algolia', (p) => algoliaProvider.addObjects(p, this._keys.algolia)),
        updateObject: this._wrap('algolia', (p) => algoliaProvider.updateObject(p, this._keys.algolia)),
        deleteObject: this._wrap('algolia', (p) => algoliaProvider.deleteObject(p, this._keys.algolia)),
        saveObjects:  this._wrap('algolia', (p) => algoliaProvider.saveObjects(p, this._keys.algolia)),
        listIndexes:  this._wrap('algolia', (p) => algoliaProvider.listIndexes(p, this._keys.algolia)),
      },
      meilisearch: {
        search:        this._wrap('meilisearch', (p) => meilisearchProvider.search(p, this._keys.meilisearch)),
        addDocuments:  this._wrap('meilisearch', (p) => meilisearchProvider.addDocuments(p, this._keys.meilisearch)),
        updateDocuments: this._wrap('meilisearch', (p) => meilisearchProvider.updateDocuments(p, this._keys.meilisearch)),
        deleteDocuments: this._wrap('meilisearch', (p) => meilisearchProvider.deleteDocuments(p, this._keys.meilisearch)),
        createIndex:   this._wrap('meilisearch', (p) => meilisearchProvider.createIndex(p, this._keys.meilisearch)),
        getIndexStats: this._wrap('meilisearch', (p) => meilisearchProvider.getIndexStats(p, this._keys.meilisearch)),
      },
    };
  }

  _buildCalendar() {
    return {
      google: {
        listCalendars:  this._wrap('google-cal', (p) => googleCalProvider.listCalendars(p, this._keys.googleCal)),
        listEvents:     this._wrap('google-cal', (p) => googleCalProvider.listEvents(p, this._keys.googleCal)),
        createEvent:    this._wrap('google-cal', (p) => googleCalProvider.createEvent(p, this._keys.googleCal)),
        updateEvent:    this._wrap('google-cal', (p) => googleCalProvider.updateEvent(p, this._keys.googleCal)),
        deleteEvent:    this._wrap('google-cal', (p) => googleCalProvider.deleteEvent(p, this._keys.googleCal)),
        getEvent:       this._wrap('google-cal', (p) => googleCalProvider.getEvent(p, this._keys.googleCal)),
        freeBusy:       this._wrap('google-cal', (p) => googleCalProvider.freeBusy(p, this._keys.googleCal)),
      },
      calendly: {
        getUser:        this._wrap('calendly', (p) => calendlyProvider.getUser(p, this._keys.calendly)),
        listEventTypes: this._wrap('calendly', (p) => calendlyProvider.listEventTypes(p, this._keys.calendly)),
        listEvents:     this._wrap('calendly', (p) => calendlyProvider.listEvents(p, this._keys.calendly)),
        getEvent:       this._wrap('calendly', (p) => calendlyProvider.getEvent(p, this._keys.calendly)),
        cancelEvent:    this._wrap('calendly', (p) => calendlyProvider.cancelEvent(p, this._keys.calendly)),
        listInvitees:   this._wrap('calendly', (p) => calendlyProvider.listInvitees(p, this._keys.calendly)),
      },
    };
  }

  _buildCaptcha() {
    return {
      recaptcha:  { verify: (p) => recaptchaProvider.verify(p, this._keys.recaptcha) },
      hcaptcha:   { verify: (p) => hcaptchaProvider.verify(p, this._keys.hcaptcha) },
      turnstile:  { verify: (p) => turnstileProvider.verify(p, this._keys.turnstile) },
    };
  }

  _buildSecurity() {
    return {
      hibp: {
        checkPassword:  (p) => hibpProvider.checkPassword(p),
        checkEmail:     (p) => hibpProvider.checkEmail(p, this._keys.hibp),
        getAllBreaches:  (p) => hibpProvider.getAllBreaches(p),
        getBreach:      (p) => hibpProvider.getBreach(p),
      },
      virustotal: {
        scanUrl:      this._wrap('virustotal', (p) => virustotalProvider.scanUrl(p, this._keys.virustotal)),
        getUrlReport: this._wrap('virustotal', (p) => virustotalProvider.getUrlReport(p, this._keys.virustotal)),
        getAnalysis:  this._wrap('virustotal', (p) => virustotalProvider.getAnalysis(p, this._keys.virustotal)),
        getFileReport: this._wrap('virustotal', (p) => virustotalProvider.getFileReport(p, this._keys.virustotal)),
        getIpReport:  this._wrap('virustotal', (p) => virustotalProvider.getIpReport(p, this._keys.virustotal)),
      },
      safebrowsing: {
        checkUrls: this._wrap('safebrowsing', (p) => safebrowsingProvider.checkUrls(p, this._keys.safebrowsing)),
        checkUrl:  this._wrap('safebrowsing', (p) => safebrowsingProvider.checkUrl(p, this._keys.safebrowsing)),
      },
      urlscan: {
        scan:      this._wrap('urlscan', (p) => urlscanProvider.scan(p, this._keys.urlscan)),
        getResult: this._wrap('urlscan', (p) => urlscanProvider.getResult(p, this._keys.urlscan)),
        search:    this._wrap('urlscan', (p) => urlscanProvider.search(p, this._keys.urlscan)),
      },
    };
  }

  _buildCloudflare() {
    return {
      dns: {
        listZones:    this._wrap('cf-dns', (p) => cfDnsProvider.listZones(p, this._keys.cloudflare)),
        listRecords:  this._wrap('cf-dns', (p) => cfDnsProvider.listRecords(p, this._keys.cloudflare)),
        createRecord: this._wrap('cf-dns', (p) => cfDnsProvider.createRecord(p, this._keys.cloudflare)),
        updateRecord: this._wrap('cf-dns', (p) => cfDnsProvider.updateRecord(p, this._keys.cloudflare)),
        deleteRecord: this._wrap('cf-dns', (p) => cfDnsProvider.deleteRecord(p, this._keys.cloudflare)),
        purgeCache:   this._wrap('cf-dns', (p) => cfDnsProvider.purgeCache(p, this._keys.cloudflare)),
      },
      r2: {
        listBuckets:    this._wrap('cf-r2', (p) => cfR2Provider.listBuckets({ ...p, accountId: this._keys.cloudflare.accountId }, this._keys.cloudflare)),
        createBucket:   this._wrap('cf-r2', (p) => cfR2Provider.createBucket({ ...p, accountId: this._keys.cloudflare.accountId }, this._keys.cloudflare)),
        getBucket:      this._wrap('cf-r2', (p) => cfR2Provider.getBucket({ ...p, accountId: this._keys.cloudflare.accountId }, this._keys.cloudflare)),
        deleteBucket:   this._wrap('cf-r2', (p) => cfR2Provider.deleteBucket({ ...p, accountId: this._keys.cloudflare.accountId }, this._keys.cloudflare)),
        getBucketCors:  this._wrap('cf-r2', (p) => cfR2Provider.getBucketCors({ ...p, accountId: this._keys.cloudflare.accountId }, this._keys.cloudflare)),
        setBucketCors:  this._wrap('cf-r2', (p) => cfR2Provider.setBucketCors({ ...p, accountId: this._keys.cloudflare.accountId }, this._keys.cloudflare)),
      },
      cache: {
        purgeFiles:    this._wrap('cf-cache', (p) => cfCacheProvider.purgeFiles(p, this._keys.cloudflare)),
        purgeTags:     this._wrap('cf-cache', (p) => cfCacheProvider.purgeTags(p, this._keys.cloudflare)),
        purgePrefixes: this._wrap('cf-cache', (p) => cfCacheProvider.purgePrefixes(p, this._keys.cloudflare)),
        purgeAll:      this._wrap('cf-cache', (p) => cfCacheProvider.purgeAll(p, this._keys.cloudflare)),
        getSettings:   this._wrap('cf-cache', (p) => cfCacheProvider.getSettings(p, this._keys.cloudflare)),
        setCacheLevel: this._wrap('cf-cache', (p) => cfCacheProvider.setCacheLevel(p, this._keys.cloudflare)),
      },
      workers: {
        listScripts:     this._wrap('cf-workers', (p) => cfWorkersProvider.listScripts({ ...p, accountId: this._keys.cloudflare.accountId }, this._keys.cloudflare)),
        getScript:       this._wrap('cf-workers', (p) => cfWorkersProvider.getScript({ ...p, accountId: this._keys.cloudflare.accountId }, this._keys.cloudflare)),
        putScript:       this._wrap('cf-workers', (p) => cfWorkersProvider.putScript({ ...p, accountId: this._keys.cloudflare.accountId }, this._keys.cloudflare)),
        deleteScript:    this._wrap('cf-workers', (p) => cfWorkersProvider.deleteScript({ ...p, accountId: this._keys.cloudflare.accountId }, this._keys.cloudflare)),
        listKVNamespaces: this._wrap('cf-workers', (p) => cfWorkersProvider.listKVNamespaces({ ...p, accountId: this._keys.cloudflare.accountId }, this._keys.cloudflare)),
        kvGet:           this._wrap('cf-workers', (p) => cfWorkersProvider.kvGet({ ...p, accountId: this._keys.cloudflare.accountId }, this._keys.cloudflare)),
        kvPut:           this._wrap('cf-workers', (p) => cfWorkersProvider.kvPut({ ...p, accountId: this._keys.cloudflare.accountId }, this._keys.cloudflare)),
        kvDelete:        this._wrap('cf-workers', (p) => cfWorkersProvider.kvDelete({ ...p, accountId: this._keys.cloudflare.accountId }, this._keys.cloudflare)),
      },
    };
  }

  _buildWebhooks() {
    const router = new WebhookRouter();
    return {
      router,
      on:     (provider, eventType, handler) => { router.on(provider, eventType, handler); return this; },
      route:  (provider, opts) => router.route(provider, opts),
      verify: (provider, params) => verifyWebhookSig(provider, params),
      list:   () => router.list(),
    };
  }

  /** Extend this.ai with dedicated provider files (streaming, etc.) */
  _buildAIEnterprise() {
    return {
      anthropic:        this._wrap('anthropic', (p) => anthropicProvider.messages(p, this._keys.anthropic)),
      anthropicStream:  (p) => anthropicProvider.stream(p, this._keys.anthropic),
      gemini:           this._wrap('google', (p) => geminiProvider.generateContent(p, this._keys.gemini)),
      geminiStream:     (p) => geminiProvider.stream(p, this._keys.gemini),
      geminiEmbed:      this._wrap('google', (p) => geminiProvider.embed(p, this._keys.gemini)),
      cohere:           this._wrap('cohere', (p) => cohereProvider.chat(p, this._keys.cohere)),
      cohereStream:     (p) => cohereProvider.stream(p, this._keys.cohere),
      cohereEmbed:      this._wrap('cohere', (p) => cohereProvider.embed(p, this._keys.cohere)),
      cohereRerank:     this._wrap('cohere', (p) => cohereProvider.rerank(p, this._keys.cohere)),
      mistral:          this._wrap('mistral', (p) => mistralProvider.chat(p, this._keys.mistral)),
      mistralStream:    (p) => mistralProvider.stream(p, this._keys.mistral),
      mistralEmbed:     this._wrap('mistral', (p) => mistralProvider.embed(p, this._keys.mistral)),
      together:         this._wrap('together', (p) => togetherProvider.chat(p, this._keys.together)),
      togetherStream:   (p) => togetherProvider.stream(p, this._keys.together),
      togetherEmbed:    this._wrap('together', (p) => togetherProvider.embed(p, this._keys.together)),
      perplexity:       this._wrap('perplexity', (p) => perplexityProvider.chat(p, this._keys.perplexity)),
      perplexityStream: (p) => perplexityProvider.stream(p, this._keys.perplexity),
    };
  }
}

export default Bemora;
