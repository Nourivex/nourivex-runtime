/**
 * Global test setup for Nourivex Runtime tests
 * 
 * This file runs before all tests and provides:
 * - Custom matchers
 * - Global test utilities
 * - Environment cleanup
 */

import { afterEach, vi, expect } from 'vitest';

// Cleanup after each test
afterEach(() => {
  // Clear all mocks
  vi.clearAllMocks();
});

// Custom matchers
declare module 'vitest' {
  interface Assertion<T = any> {
    toContainString(expected: string): T;
    toBeWithinRange(min: number, max: number): T;
  }
}

// Helper to check if string contains substring
expect.extend({
  toContainString(received: string, expected: string) {
    const pass = received.includes(expected);
    return {
      pass,
      message: () => 
        pass 
          ? `Expected string not to contain "${expected}"`
          : `Expected string to contain "${expected}"`,
    };
  },
  
  toBeWithinRange(received: number, min: number, max: number) {
    const pass = received >= min && received <= max;
    return {
      pass,
      message: () =>
        pass
          ? `Expected ${received} not to be within range ${min}-${max}`
          : `Expected ${received} to be within range ${min}-${max}`,
    };
  },
});

// Suppress console output during tests (optional - uncomment if needed)
// global.console = {
//   ...console,
//   log: vi.fn(),
//   error: vi.fn(),
//   warn: vi.fn(),
// };
