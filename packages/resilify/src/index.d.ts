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
  strategy?: 'first' | 'majority' | 'average' | 'all';
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

export class RateLimiter {
  configure(key: string, opts: { limit: number; window?: 'second' | 'minute' | 'hour' | 'day' | 'month' }): void;
  isLimited(key: string): boolean;
  record(key: string): void;
  getStatus(key: string): { used: number; limit: number; window: string; warning: boolean };
  reset(): void;
}

export function configureRateLimit(key: string, opts: { limit: number; window?: string }): void;
export function isLimited(key: string): boolean;
export function recordRateLimit(key: string): void;
export function getRateLimitStatus(key: string): { used: number; limit: number; window: string; warning: boolean };
export function resetRateLimit(): void;

export class TimeoutError extends Error {}
export function withTimeout<T>(fn: () => Promise<T>, ms?: number): Promise<T>;
