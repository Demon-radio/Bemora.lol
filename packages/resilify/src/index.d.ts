export interface ResilientOptions {
  key?: string;
  timeout?: number;
  retries?: number;
  baseDelay?: number;
  maxDelay?: number;
  retryOn?: number[];
  signal?: AbortSignal;
  circuitBreaker?: boolean;
  circuitOptions?: {
    failureThreshold?: number;
    successThreshold?: number;
    openDuration?: number;
  };
}

export function resilient<T>(fn: () => Promise<T>, opts?: ResilientOptions): Promise<T>;
export default resilient;

export interface FailoverSource<T = any> {
  name: string;
  fn: () => Promise<T>;
}

export interface CacheAdapter {
  get(key: string): any;
  set(key: string, value: any): void;
}

export interface FailoverOptions {
  cache?: CacheAdapter;
  cacheKey?: string;
  onProviderError?: (name: string, err: Error) => void;
}

export function failover(chain: FailoverSource[], opts?: FailoverOptions): Promise<any>;
export function resilientFailover(chain: FailoverSource[], opts?: ResilientOptions & FailoverOptions): Promise<any>;

export interface AggregateOptions {
  /**
   * - `'first'`    — return the first successful result.
   * - `'all'`      — return all results and failures.
   * - `'average'`  — numeric average of `field` across all sources.
   * - `'majority'` — most frequently occurring value of `field` (mode).
   * - `'median'`   — median value of `field` across all sources.
   */
  strategy?: 'first' | 'majority' | 'average' | 'all' | 'median';
  field?: string;
}
export function aggregate(sources: FailoverSource[], opts?: AggregateOptions): Promise<any>;

export function withRetry<T>(fn: () => Promise<T>, opts?: Partial<ResilientOptions>): Promise<T>;

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export class CircuitBreaker {
  constructor(key: string, opts?: ResilientOptions['circuitOptions']);
  state: CircuitState;
  check(): 'allow' | 'reject' | 'probe';
  startProbe(): void;
  endProbe(): void;
  recordSuccess(): void;
  recordFailure(): void;
  forceOpen(): void;
  forceClose(): void;
  getState(): Record<string, any>;
}

export class CircuitOpenError extends Error {
  key: string;
}

export function withCircuitBreaker<T>(key: string, fn: () => Promise<T>, opts?: ResilientOptions['circuitOptions']): Promise<T>;
export function getBreaker(key: string, opts?: ResilientOptions['circuitOptions']): CircuitBreaker;
export function resetBreaker(key: string): void;
export function resetAllBreakers(): void;
export function getAllBreakerStates(): Record<string, any>[];

export interface RateLimitStatus {
  key: string;
  used: number;
  /** `null` when the key has no configured budget. */
  limit: number | null;
  window: string;
  configured: boolean;
  warning: boolean;
}

export class RateLimitError extends Error {
  key: string;
  limit: number;
  window: string;
}

export class RateLimiter {
  configure(key: string, opts: { limit: number; window?: 'second' | 'minute' | 'hour' | 'day' | 'month' }): void;
  isLimited(key: string): boolean;
  record(key: string): void;
  getStatus(key: string): RateLimitStatus;
  /** Clear usage. Pass `{ includeConfig: true }` to also wipe configured budgets. */
  reset(opts?: { includeConfig?: boolean }): void;
}

export function configureRateLimit(key: string, opts: { limit: number; window?: string }): void;
export function isLimited(key: string): boolean;
export function recordRateLimit(key: string): void;
export function getRateLimitStatus(key: string): RateLimitStatus;
export function resetRateLimit(opts?: { includeConfig?: boolean }): void;

export class TimeoutError extends Error {}
export function withTimeout<T>(fn: () => Promise<T>, ms?: number): Promise<T>;
