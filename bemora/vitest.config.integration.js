import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    testTimeout: 30000,
    hookTimeout: 15000,
    include: ['tests/integration/**/*.test.js'],
    reporter: ['verbose'],
  },
});
