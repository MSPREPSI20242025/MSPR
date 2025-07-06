// Global test setup
require('dotenv').config({ path: '.env.test' });

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://test_user:test_password@localhost:5432/test_db';
process.env.API_TOKEN = 'test-token';
process.env.JWT_SECRET = 'test-jwt-secret';

// Global test utilities
global.testUtils = {
  // Helper to wait for async operations
  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Helper to generate test data
  generateTestData: (type, overrides = {}) => {
    const baseData = {
      covid: {
        country: 'Test Country',
        date: '2024-01-01',
        cases: 100,
        deaths: 10,
        recovered: 80
      },
      mpox: {
        country: 'Test Country',
        date: '2024-01-01',
        cases: 50,
        deaths: 5
      }
    };
    
    return { ...baseData[type], ...overrides };
  },
  
  // Helper to clean up test data
  cleanupTestData: async () => {
    // Implement cleanup logic here
    console.log('Cleaning up test data...');
  }
};

// Console override to reduce noise in tests
if (process.env.SUPPRESS_TEST_LOGS === 'true') {
  console.log = jest.fn();
  console.info = jest.fn();
  console.warn = jest.fn();
}