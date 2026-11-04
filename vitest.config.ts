/**
 * @file vitest.config.ts
 * @description Frameer's component tests (`src/**\/*.test.{ts,tsx}`) in jsdom.
 * Frameer lives inside each app as `frontend/frameer`, and its tests run on the app's own dev tools (vitest, jsdom,
 * Testing Library, axe-core), found in the app's `node_modules` one level up; Frameer adds no dev dependencies for them.
 * Run `npm test` here, or `npx vitest run --config frameer/vitest.config.ts` from the app's `frontend`.
 */
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  root: import.meta.dirname,
  esbuild: { jsx: 'automatic' },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['./src/test/setup.ts'],
  },
  resolve: {
    alias: { '@frameer': path.resolve(import.meta.dirname, './src') },
  },
});
