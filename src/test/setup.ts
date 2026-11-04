/**
 * @file setup.ts
 * @description Test setup for Frameer's own runner (vitest.config.ts): jest-dom matchers, DOM cleanup after each test, and a `matchMedia` that matches nothing (a desktop window), which a test can replace to act as a phone.
 * Apps that run Frameer's tests in their own suite use their own setup instead.
 */
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

afterEach(() => {
  cleanup();
});

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
