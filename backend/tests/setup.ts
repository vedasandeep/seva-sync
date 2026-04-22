/**
 * Jest Setup File
 * Runs before each test suite
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-do-not-use-in-production';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key';
process.env.ACCESS_TOKEN_SECRET = 'test-access-secret-key-for-testing-purposes-only';
process.env.REFRESH_TOKEN_SECRET = 'test-refresh-secret-key-for-testing-purposes-only';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/sevasync_test';
process.env.REDIS_URL = 'redis://localhost:6379/1';
process.env.ENCRYPTION_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

// Extend Jest matchers
expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});

// Global test timeout
jest.setTimeout(10000);

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
  // Keep log, info for debugging
  log: console.log,
  info: console.info,
  debug: console.debug,
};

// Clean up after all tests
afterAll(async () => {
  // Close database connections, Redis, etc.
  await new Promise((resolve) => setTimeout(resolve, 500));
});
