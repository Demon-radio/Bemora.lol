/**
 * Bemora Enterprise — TypeScript type definitions.
 * Hand-written declarations for the core class, error hierarchy, and
 * primary platform helpers. Provider method signatures are shown for the
 * most commonly used providers; extend as needed for your own usage.
 */

// ── Error hierarchy ───────────────────────────────────────────────────────────

export declare class BemoraError extends Error {
  readonly name: string;
  readonly code: string;
  readonly provider?: string;
  readonly requestId: string;
  readonly cause?: Error;
  readonly timestamp: string;
  toJSON(): Record<string, unknown>;
}

export declare class ConfigurationError extends BemoraError {}
export declare class ValidationError extends BemoraError {
  readonly errors: unknown[];
}
export declare class ProviderError extends BemoraError {
  readonly httpStatus?: number;
  readonly upstreamRequestId?: string;
}
export declare class AuthError extends ProviderError {}
export declare class RateLimitError extends ProviderError {
  readonly retryAfter?: string;
  readonly limit?: string;
  readonly remaining?: string;
}
export declare class TimeoutError extends BemoraError {}
export declare class CircuitBreakerError extends BemoraError {}

// Spec-required aliases
export declare const BemoraProviderError: typeof ProviderError;
export declare const BemoraRateLimitError: typeof RateLimitError;
export declare const BemoraTimeoutError: typeof TimeoutError;
export declare const BemoraAuthError: typeof AuthError;

export declare function wrapProviderError(err: unknown, provider: string): BemoraError;

// ── paginate ──────────────────────────────────────────────────────────────────

export interface PaginateOptions {
  strategy?: 'cursor' | 'offset' | 'page';
  resultPath?: string;
  cursorPath?: string;
  hasMorePath?: string;
  nextCursorPath?: string;
  pageSize?: number;
  startPage?: number;
  limit?: number;
  maxPages?: number;
}

export declare function paginate<T = unknown>(
  fn: (cursorOrOffsetOrPage: unknown) => Promise<unknown>,
  opts?: PaginateOptions
): Promise<T[]>;

export declare function paginateStream<T = unknown>(
  fn: (cursorOrOffsetOrPage: unknown) => Promise<unknown>,
  opts?: PaginateOptions
): AsyncGenerator<T>;

// ── gql ───────────────────────────────────────────────────────────────────────

export interface GqlOptions {
  headers?: Record<string, string>;
  timeout?: number;
  signal?: AbortSignal;
  throwOnErrors?: boolean;
}

export declare function gql<T = unknown>(
  endpoint: string,
  query: string,
  variables?: Record<string, unknown>,
  opts?: GqlOptions
): Promise<T>;

export declare function gqlTag(strings: TemplateStringsArray, ...values: unknown[]): string;

// ── upload ────────────────────────────────────────────────────────────────────

export interface UploadResult {
  success: boolean;
  status: number;
  data: unknown;
}

export interface UploadOptions {
  filename?: string;
  contentType?: string;
  fieldName?: string;
  fields?: Record<string, string>;
  headers?: Record<string, string>;
  timeout?: number;
  signal?: AbortSignal;
}

export declare function upload(url: string, file: Buffer | Uint8Array | string, opts?: UploadOptions): Promise<UploadResult>;
export declare function uploadPresignedPost(params: {
  url: string;
  fields?: Record<string, string>;
  file: Buffer | Uint8Array;
  filename?: string;
  contentType?: string;
  signal?: AbortSignal;
}): Promise<UploadResult>;

// ── batch ─────────────────────────────────────────────────────────────────────

export interface BatchCall {
  id: string;
  fn: () => Promise<unknown>;
}

export interface BatchOptions {
  maxItems?: number;
}

export declare function batch<T extends Record<string, unknown> = Record<string, unknown>>(
  calls: BatchCall[],
  opts?: BatchOptions
): Promise<T>;

// ── audit ─────────────────────────────────────────────────────────────────────

export interface AuditEntry {
  ts: string;
  tenantId: string | null;
  provider: string;
  method: string | null;
  params?: Record<string, unknown>;
  success: boolean;
  errorCode: string | null;
  requestId: string | null;
}

export declare function audit(opts: Partial<AuditEntry> & { provider: string }): AuditEntry;
export declare function setAuditTransport(fn: ((entry: AuditEntry) => void | Promise<void>) | null): void;
export declare function recentEntries(limit?: number): AuditEntry[];
export declare function entriesForTenant(tenantId: string, limit?: number): AuditEntry[];

// ── webhooks/sign ─────────────────────────────────────────────────────────────

export interface SignWebhookResult {
  signature: string;
  timestamp: number;
  headers: { 'X-Bemora-Signature': string; 'X-Bemora-Timestamp': string };
}

export declare function signWebhook(
  payload: string | Buffer,
  secret: string,
  opts?: { timestamp?: number }
): SignWebhookResult;

export declare function verifySignature(
  payload: string | Buffer,
  receivedSig: string,
  secret: string,
  receivedTimestamp: number | string,
  opts?: { toleranceSeconds?: number }
): boolean;

// ── costs ─────────────────────────────────────────────────────────────────────

export interface CostEntry {
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  tenantId?: string;
  requestId?: string;
  ts: string;
}

export interface CostSnapshot {
  totalUsd: number;
  byProvider: Record<string, { inputTokens: number; outputTokens: number; requests: number; costUsd: number }>;
  byModel: Record<string, { inputTokens: number; outputTokens: number; requests: number; costUsd: number }>;
  byTenant: Record<string, Record<string, { inputTokens: number; outputTokens: number; requests: number; costUsd: number }>>;
  eventCount: number;
}

export declare function recordCost(params: {
  provider: string;
  model: string;
  inputTokens?: number;
  outputTokens?: number;
  tenantId?: string;
  requestId?: string;
}): CostEntry;

export declare function estimateCost(params: { provider: string; model: string; inputTokens?: number; outputTokens?: number }): number | null;
export declare function snapshot(): CostSnapshot;
export declare function snapshotForTenant(tenantId: string): { tenantId: string; totalUsd: number; byProvider: Record<string, unknown> };
export declare function reset(): void;
export declare function events(limit?: number): CostEntry[];
export declare function setBudget(tenantId: string, limitUsd: number): void;
export declare function clearBudget(tenantId: string): void;
export declare function onOverBudget(fn: (event: { tenantId: string; limitUsd: number; totalUsd: number; entry: CostEntry }) => void): void;

// ── Plugin system ─────────────────────────────────────────────────────────────

export interface BemoraPlugin {
  name: string;
  install(api: Bemora): void;
  beforeRequest?(context: { provider: string; args: unknown[] }): void | Promise<void>;
  afterResponse?(context: { provider: string; args: unknown[]; result: unknown }): void | Promise<void>;
  onError?(context: { provider: string; args: unknown[]; error: Error }): void | Promise<void>;
}

// ── Bemora main class ─────────────────────────────────────────────────────────

export interface BemoraOptions {
  timeout?: number;
  retries?: number;
  circuitBreaker?: { threshold?: number; timeout?: number };
  cacheHeaders?: boolean;
  timeouts?: Record<string, number>;
}

export declare class Bemora {
  constructor(keys?: Record<string, unknown>, options?: BemoraOptions);

  // Multi-tenant
  withTenant(tenantId: string, keys: Record<string, unknown>): Bemora;
  forTenant(tenantId: string): Bemora;
  currentTenantId(): string | null;

  // Plugin
  use(plugin: BemoraPlugin): this;

  // Event bus
  on(event: string, listener: (data: unknown) => void): this;
  off(event: string, listener: (data: unknown) => void): this;
  emit(event: string, data?: unknown): void;

  // Key rotation
  rotateKey(name: string, value: string): void;

  // Provider namespaces (abbreviated — full signatures follow each provider's JSDoc)
  weather: { current(params: unknown): Promise<unknown>; forecast(params: unknown): Promise<unknown> };
  crypto: { price(params: unknown): Promise<unknown>; trending(): Promise<unknown>; top(params: unknown): Promise<unknown> };
  payments: {
    stripe: {
      createCharge(params: { amount: number; currency: string; source?: string; idempotencyKey?: string } & Record<string, unknown>): Promise<unknown>;
      createPaymentIntent(params: { amount: number; currency: string; idempotencyKey?: string } & Record<string, unknown>): Promise<unknown>;
      createCustomer(params: Record<string, unknown>): Promise<unknown>;
      getCustomer(params: { id: string }): Promise<unknown>;
      createSubscription(params: Record<string, unknown>): Promise<unknown>;
      createRefund(params: Record<string, unknown>): Promise<unknown>;
      verifyWebhook(params: { payload: string | Buffer; signature: string; secret: string }): { valid: boolean; event?: unknown };
    };
    paypal: Record<string, (...args: unknown[]) => Promise<unknown>>;
  };
  email: {
    sendgrid: Record<string, (...args: unknown[]) => Promise<unknown>>;
    ses: Record<string, (...args: unknown[]) => Promise<unknown>>;
    resend: Record<string, (...args: unknown[]) => Promise<unknown>>;
  };
  ai: {
    chat(params: unknown): Promise<unknown>;
    anthropicChat(params: unknown): Promise<unknown>;
    geminiChat(params: unknown): Promise<unknown>;
    embed(params: unknown): Promise<unknown>;
    generateImage(params: unknown): Promise<unknown>;
    [key: string]: (...args: unknown[]) => Promise<unknown>;
  };
  vectordb: {
    pinecone: Record<string, (...args: unknown[]) => Promise<unknown>>;
    qdrant: Record<string, (...args: unknown[]) => Promise<unknown>>;
    weaviate: Record<string, (...args: unknown[]) => Promise<unknown>>;
  };
  auth: {
    jwt: Record<string, (...args: unknown[]) => unknown>;
    clerk: Record<string, (...args: unknown[]) => Promise<unknown>>;
    auth0: Record<string, (...args: unknown[]) => Promise<unknown>>;
  };
  storage: {
    s3: Record<string, (...args: unknown[]) => Promise<unknown>>;
    r2: Record<string, (...args: unknown[]) => Promise<unknown>>;
    gcs: Record<string, (...args: unknown[]) => Promise<unknown>>;
  };
  notifications: {
    onesignal: Record<string, (...args: unknown[]) => Promise<unknown>>;
    fcm: Record<string, (...args: unknown[]) => Promise<unknown>>;
    pusher: Record<string, (...args: unknown[]) => Promise<unknown>>;
  };
  search: { instant(params: unknown): Promise<unknown>; web(params: unknown): Promise<unknown> };
  maps: {
    google: Record<string, (...args: unknown[]) => Promise<unknown>>;
    mapbox: Record<string, (...args: unknown[]) => Promise<unknown>>;
  };
  captcha: {
    recaptcha: { verify(params: unknown): Promise<unknown> };
    hcaptcha: { verify(params: unknown): Promise<unknown> };
    turnstile: { verify(params: unknown): Promise<unknown> };
  };
  security: {
    hibp: Record<string, (...args: unknown[]) => Promise<unknown>>;
    virustotal: Record<string, (...args: unknown[]) => Promise<unknown>>;
    safebrowsing: Record<string, (...args: unknown[]) => Promise<unknown>>;
    urlscan: Record<string, (...args: unknown[]) => Promise<unknown>>;
  };
  [namespace: string]: unknown;
}

export default Bemora;
