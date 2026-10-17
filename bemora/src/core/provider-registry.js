const DEFAULT_CONFIG = {
  maxFailures: 3,
  recoveryInterval: 300000, // 5 minutes
};

export class ProviderRegistry {
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.providers = new Map(); // { providerName: { status, failures, lastFailure, lastChecked } }
  }

  getProvider(name) {
    if (!this.providers.has(name)) {
      this.providers.set(name, {
        status: 'unknown',
        failures: 0,
        lastFailure: null,
        lastChecked: null,
      });
    }
    return this.providers.get(name);
  }

  recordSuccess(name) {
    const provider = this.getProvider(name);
    provider.status = 'healthy';
    provider.failures = 0;
    provider.lastChecked = Date.now();
  }

  recordFailure(name) {
    const provider = this.getProvider(name);
    provider.failures += 1;
    provider.lastFailure = Date.now();
    provider.lastChecked = Date.now();
    if (provider.failures >= this.config.maxFailures) {
      provider.status = 'dead';
    } else {
      provider.status = 'degraded';
    }
  }

  isAvailable(name) {
    const provider = this.getProvider(name);
    
    // Auto-recover if enough time has passed
    if (provider.status === 'dead' && 
        Date.now() - provider.lastFailure >= this.config.recoveryInterval) {
      provider.status = 'unknown';
      provider.failures = 0;
    }
    
    return provider.status !== 'dead';
  }

  getStatus(name) {
    const provider = this.getProvider(name);
    
    // Auto-recover check
    if (provider.status === 'dead' && 
        Date.now() - provider.lastFailure >= this.config.recoveryInterval) {
      provider.status = 'unknown';
      provider.failures = 0;
    }
    
    return { name, ...provider };
  }

  getAllStatuses() {
    return Array.from(this.providers.keys()).map(name => this.getStatus(name));
  }
}

// Singleton instance
export const providerRegistry = new ProviderRegistry();
