import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    // ESM-first configuration
    environment: 'node',
    
    // Include both unit and integration tests
    include: [
      'tests/**/*.test.ts',
      'tests/**/*.test.mjs',
      'tests/**/*.test.js',
    ],
    
    // Exclude non-test files
    exclude: [
      'node_modules',
      'dist',
      'cli/node_modules',
      'cli/dist',
      '.opencode/node_modules',
      'tests/__pycache__',
    ],
    
    // Setup files for global test configuration
    setupFiles: ['./tests/setup.ts'],
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'json', 'html'],
      reportsDirectory: './coverage',
      include: [
        'cli/src/**/*.ts',
        'opencode-plugin.mjs',
      ],
      exclude: [
        'cli/src/index.ts', // Entry point, hard to test
        '**/*.d.ts',
        '**/*.test.ts',
        '**/*.spec.ts',
      ],
      thresholds: {
        statements: 70,
        branches: 60,
        functions: 70,
        lines: 70,
      },
    },
    
    // Global test timeout
    testTimeout: 10000,
    
    reporter: ['verbose'],
  },
  
  resolve: {
    alias: {
      // Resolve TypeScript imports for tests
      '@cli/commands': path.resolve(__dirname, './cli/src/commands'),
      '@cli/utils': path.resolve(__dirname, './cli/src/utils'),
    },
  },
});
