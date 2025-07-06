/** @type {import('jest').Config} */
module.exports = {
  // Test environment
  testEnvironment: 'node',
  
  // Roots for test discovery
  roots: ['<rootDir>/tests', '<rootDir>/rest', '<rootDir>/site'],
  
  // Test file patterns
  testMatch: [
    '**/__tests__/**/*.(js|ts)',
    '**/*.(test|spec).(js|ts)'
  ],
  
  // Module file extensions
  moduleFileExtensions: ['js', 'ts', 'json'],
  
  // Transform files with TypeScript
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  
  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  collectCoverageFrom: [
    'rest/src/**/*.{js,ts}',
    'site/src/**/*.{js,ts,jsx,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/build/**',
    '!**/coverage/**',
    '!**/*.config.js'
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  
  // Test timeout
  testTimeout: 30000,
  
  // Module name mapping for path aliases
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/rest/src/$1',
    '^@frontend/(.*)$': '<rootDir>/site/src/$1'
  },
  
  // Global test setup
  globalSetup: '<rootDir>/tests/global-setup.js',
  globalTeardown: '<rootDir>/tests/global-teardown.js',
  
  // Test projects for different environments
  projects: [
    {
      displayName: 'backend',
      testMatch: ['<rootDir>/rest/**/*.(test|spec).(js|ts)'],
      testEnvironment: 'node',
      setupFilesAfterEnv: ['<rootDir>/tests/backend-setup.js']
    },
    {
      displayName: 'frontend',
      testMatch: ['<rootDir>/site/**/*.(test|spec).(js|ts|jsx|tsx)'],
      testEnvironment: 'jsdom',
      setupFilesAfterEnv: ['<rootDir>/tests/frontend-setup.js']
    },
    {
      displayName: 'integration',
      testMatch: ['<rootDir>/tests/integration/**/*.(test|spec).(js|ts)'],
      testEnvironment: 'node',
      setupFilesAfterEnv: ['<rootDir>/tests/integration-setup.js']
    }
  ],
  
  // Verbose output
  verbose: true,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Restore mocks after each test
  restoreMocks: true
};