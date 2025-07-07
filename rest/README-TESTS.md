# REST API Unit Tests

This document describes the comprehensive unit test suite for the pandemic surveillance REST API.

## Test Structure

```
tests/
├── setup.ts                           # Test configuration and mocks
├── routes/
│   ├── public.test.ts                 # Public endpoint tests
│   └── authenticated.test.ts          # Protected endpoint tests
├── middleware/
│   └── middleware.test.ts             # Authentication middleware tests
├── utils/
│   └── transformBigInts.test.ts       # Utility function tests
└── integration/
    └── api.integration.test.ts        # Full API integration tests
```

## Test Coverage

### Public Routes (`/api/**/public/**`)
- ✅ GET `/api/covid/public/latest` - Latest COVID data
- ✅ GET `/api/mpox/public/summary` - MPOX summary statistics  
- ✅ GET `/api/covid/public/country/:country` - Country-specific COVID data
- ✅ GET `/api/covid/public/totals` - Global COVID totals

### Authenticated Routes (`/api/**` with Bearer token)
- ✅ GET `/api/covid/data` - COVID data with filtering
- ✅ GET `/api/mpox/data` - MPOX data with filtering
- ✅ GET `/api/stats/summary` - Aggregated statistics
- ✅ POST `/api/covid/data` - Create COVID data entry
- ✅ POST `/api/mpox/data` - Create MPOX data entry
- ✅ PUT `/api/covid/data/:id` - Update COVID data
- ✅ PUT `/api/mpox/data/:id` - Update MPOX data
- ✅ DELETE `/api/covid/data/:id` - Delete COVID data
- ✅ DELETE `/api/mpox/data/:id` - Delete MPOX data

### Authentication Middleware
- ✅ Valid Bearer token authentication
- ✅ Missing authorization header handling
- ✅ Invalid token format handling
- ✅ Wrong token value handling
- ✅ Malformed authorization header handling

### Utility Functions
- ✅ BigInt to Number transformation
- ✅ Nested object transformation
- ✅ Array transformation
- ✅ Edge cases (null, undefined, primitives)

### Integration Tests
- ✅ Full API flow testing
- ✅ Error handling across endpoints
- ✅ Data type validation
- ✅ Query parameter validation
- ✅ Authentication edge cases
- ✅ Content-Type handling
- ✅ Concurrent request handling
- ✅ Data consistency checks

## Test Technologies

- **Jest**: Testing framework
- **Supertest**: HTTP assertion library for API testing
- **ts-jest**: TypeScript support for Jest
- **Mocking**: Prisma Client mocked for isolated unit tests

## Test Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests for CI (no watch, with coverage)
npm run test:ci
```

## Test Configuration

### Coverage Thresholds
- **Branches**: 80%
- **Functions**: 80% 
- **Lines**: 80%
- **Statements**: 80%

### Test Environment
- **Environment**: Node.js
- **Timeout**: 10 seconds per test
- **Setup**: Automatic mock reset between tests
- **Coverage**: Includes all source files except index.ts

## Mock Data

The test suite uses comprehensive mock data:

### COVID Data
```typescript
{
  index: 1,
  date: new Date('2024-01-01'),
  country: 'France',
  total_cases: 1000,
  new_cases: 50,
  total_deaths: 100,
  new_deaths: 5,
}
```

### MPOX Data
```typescript
{
  index: 1,
  date: new Date('2024-01-01'),
  country: 'USA',
  total_cases: 500,
  new_cases: 25,
  total_deaths: 50,
  new_deaths: 2,
}
```

### Statistics Data
```typescript
{
  covid: {
    total_cases: BigInt(5000000),
    total_deaths: BigInt(50000),
  },
  mpox: {
    total_cases: BigInt(25000),
    total_deaths: BigInt(250),
  },
}
```

## Test Scenarios

### Authentication Tests
1. **Valid Authentication**: Tests successful authentication with correct Bearer token
2. **Missing Headers**: Tests rejection when no authorization header provided
3. **Invalid Format**: Tests rejection of malformed authorization headers
4. **Wrong Token**: Tests rejection with incorrect token values
5. **Edge Cases**: Tests various malformed header formats

### Route Tests
1. **Success Cases**: Tests normal operation with valid data
2. **Error Handling**: Tests database errors and invalid inputs
3. **Query Parameters**: Tests filtering and pagination
4. **Data Transformation**: Tests BigInt conversion in responses
5. **CRUD Operations**: Tests Create, Read, Update, Delete operations

### Integration Tests
1. **End-to-End Flow**: Tests complete request/response cycles
2. **Error Propagation**: Tests error handling across middleware stack
3. **Data Validation**: Tests input validation and sanitization
4. **Performance**: Tests concurrent requests and large payloads
5. **Content Negotiation**: Tests various content types and headers

## Running Tests

### Prerequisites
```bash
# Install dependencies
npm install

# Ensure environment variables are set for tests
export API_TOKEN=test-api-token
```

### Test Execution
```bash
# Basic test run
npm test

# Verbose output with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch
```

### Coverage Reports
Coverage reports are generated in the `coverage/` directory:
- **HTML Report**: `coverage/lcov-report/index.html`
- **LCOV Report**: `coverage/lcov.info`
- **Text Summary**: Displayed in terminal

## Test Data Flow

1. **Setup**: Mock Prisma client and test data
2. **Execution**: Run HTTP requests against Express app
3. **Assertion**: Verify responses and database calls
4. **Cleanup**: Reset mocks for next test

## Best Practices

### Test Isolation
- Each test is independent
- Mocks are reset between tests
- No shared state between test cases

### Comprehensive Coverage
- All endpoints tested
- Both success and error paths
- Edge cases and boundary conditions
- Authentication and authorization

### Realistic Scenarios
- Mock data represents real API responses
- Error conditions match production scenarios
- Integration tests simulate real usage patterns

### Maintainability
- Clear test descriptions
- Organized test structure
- Reusable test utilities
- Comprehensive documentation

## Debugging Tests

### Common Issues
1. **Mock Reset**: Ensure mocks are properly reset between tests
2. **Async Operations**: Use proper async/await patterns
3. **Environment Variables**: Set required environment variables
4. **Type Issues**: Ensure TypeScript types match test expectations

### Debug Commands
```bash
# Run specific test file
npm test -- tests/routes/public.test.ts

# Run tests with debug output
npm test -- --verbose

# Run single test case
npm test -- --testNamePattern="should return latest COVID data"
```

This comprehensive test suite ensures the API is robust, secure, and functions correctly across all scenarios.