import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    testTimeout: 30000,
    hookTimeout: 30000,
    include: ['tests/integration/**/*.test.js'],
    reporter: ['verbose'],
    // Live third-party APIs occasionally exceed the 8s default; give real
    // requests more headroom and retry once so CI isn't gated by network jitter.
    retry: 2,
    env: { BEMORA_HTTP_TIMEOUT_MS: '20000' },
  },
});
