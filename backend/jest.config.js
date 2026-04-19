/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  
  // Test file patterns
  roots: ['<rootDir>/tests', '<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  
  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/server.ts', // Entry point - covered by E2E
    '!src/types/**',  // Type definitions
    '!src/**/*.interface.ts'
  ],
  
  // Note: coverageThreshold (singular) is the correct property name
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50
    }
  },
  
  // Coverage output
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text', 'text-summary', 'html', 'lcov', 'json'],
  
  // Transform files
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: {
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        baseUrl: '.',
        paths: {
          '@/*': ['src/*'],
          '@tests/*': ['tests/*']
        }
      }
    }]
  },
  
  // Module paths
  moduleFileExtensions: ['ts', 'js', 'json'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1'
  },
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  
  // Test environment
  testTimeout: 10000,
  verbose: true,
  
  // Clear mocks between tests
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  
  // Error handling
  bail: false,
  maxWorkers: '50%',
  
  // Watch mode
  watchPathIgnorePatterns: [
    'node_modules',
    'dist',
    'coverage'
  ]
};
