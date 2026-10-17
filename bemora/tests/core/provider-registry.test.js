import { describe, it, expect, beforeEach } from 'vitest';
import { ProviderRegistry } from '../../src/core/provider-registry.js';

describe('Provider Registry', () => {
  let registry;

  beforeEach(() => {
    registry = new ProviderRegistry({ maxFailures: 2, recoveryInterval: 1000 });
  });

  it('should initialize providers as unknown', () => {
    const status = registry.getStatus('test-provider');
    expect(status.status).toBe('unknown');
    expect(status.failures).toBe(0);
  });

  it('should record success', () => {
    registry.recordSuccess('test-provider');
    const status = registry.getStatus('test-provider');
    expect(status.status).toBe('healthy');
    expect(status.failures).toBe(0);
  });

  it('should mark provider as degraded after some failures', () => {
    registry.recordFailure('test-provider');
    const status = registry.getStatus('test-provider');
    expect(status.status).toBe('degraded');
    expect(status.failures).toBe(1);
  });

  it('should mark provider as dead after max failures', () => {
    registry.recordFailure('test-provider');
    registry.recordFailure('test-provider');
    const status = registry.getStatus('test-provider');
    expect(status.status).toBe('dead');
    expect(registry.isAvailable('test-provider')).toBe(false);
  });
});
