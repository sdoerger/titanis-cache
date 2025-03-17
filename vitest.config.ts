import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // setupFiles: ['vitest-localstorage-mock'],
    environment: 'jsdom',
    mockReset: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});
