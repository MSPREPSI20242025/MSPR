# CI/CD Pipeline Documentation - GitHub Actions

## Overview

This document describes the comprehensive CI/CD pipeline implemented using GitHub Actions for the MSPR 3 pandemic surveillance platform. The pipeline ensures code quality, security, and automated testing across all components of the system.

## Pipeline Architecture

```mermaid
graph TD
    A[Push/PR] --> B[Test Job]
    B --> C[Security Scan]
    B --> D[Integration Test]
    C --> E[Deploy to Staging]
    D --> E
    E --> F[Deploy to Production]
```

## Workflow Files

### 1. REST API Tests (`rest-api-tests.yml`)

**Trigger Events:**
- Push to branches: `main*`, `dev*`
- Pull requests to `main*` branches
- Changes to `rest/**` or workflow files

**Matrix Strategy:**
- Node.js versions: 18.x, 20.x
- Operating System: Ubuntu Latest

## Jobs Breakdown

### Job 1: Unit & Integration Tests

**Environment Variables:**
```yaml
NODE_ENV: test
API_TOKEN: test-github-actions-token
DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
HOST: localhost
PORT: 3001
```

**Services:**
- PostgreSQL 15 with health checks
- Custom test database setup

**Steps:**

1. **Checkout Code**
   - Uses: `actions/checkout@v4`
   - Fetches latest repository code

2. **Setup pnpm**
   - Uses: `pnpm/action-setup@v2`
   - Version: 8.x
   - Package manager for faster installs

3. **Setup Node.js**
   - Uses: `actions/setup-node@v4`
   - Matrix versions: 18.x, 20.x
   - Caches pnpm dependencies

4. **Install Dependencies**
   - Handles lockfile configuration mismatches
   - Fallback strategy for installation failures
   ```bash
   if ! pnpm install --frozen-lockfile; then
     pnpm install --no-frozen-lockfile
   fi
   ```

5. **Build TypeScript**
   - Compiles TypeScript to JavaScript
   - Validates code syntax and types

6. **Database Setup**
   - Generates Prisma client
   - Pushes schema to test database
   - Force resets for clean test environment

7. **Run Tests**
   - Executes comprehensive test suite
   - Generates coverage reports
   - Command: `pnpm run test:ci`

8. **Upload Coverage**
   - Uses: `codecov/codecov-action@v3`
   - Uploads LCOV coverage reports
   - Flags: `rest-api`

9. **Archive Test Results**
   - Uses: `actions/upload-artifact@v4`
   - Retention: 30 days
   - Includes coverage and test results

10. **PR Comments**
    - Posts test results on pull requests
    - Includes coverage metrics
    - Provides quick feedback to developers

### Job 2: Security Scan

**Dependencies:** Requires successful test job

**Steps:**

1. **Environment Setup**
   - Same Node.js and pnpm setup as test job

2. **Security Audit**
   ```bash
   pnpm audit --audit-level=moderate
   ```
   - Scans for known vulnerabilities
   - Moderate severity threshold

3. **Dependency Check**
   ```bash
   npx audit-ci --moderate
   ```
   - Additional vulnerability scanning
   - Fails CI on moderate+ vulnerabilities

### Job 3: Integration Test

**Dependencies:** Requires successful test job

**Environment:**
- Dedicated PostgreSQL instance
- Integration-specific environment variables

**Steps:**

1. **Full Application Build**
   - Complete TypeScript compilation
   - Database schema deployment

2. **API Server Startup**
   ```bash
   pnpm start &
   sleep 10
   ```
   - Starts API in background
   - Waits for server initialization

3. **Health Checks**
   ```bash
   curl -f http://localhost:3001/ || exit 1
   ```
   - Validates server accessibility
   - Ensures API endpoints respond

4. **Integration Tests**
   - End-to-end API testing
   - Real database interactions
   - Pattern: `--testPathPattern=integration`

5. **Cleanup**
   - Graceful server shutdown
   - Resource cleanup

## Test Coverage Requirements

### Quality Gates

- **Statements:** > 50%
- **Branches:** > 50%
- **Functions:** > 50%
- **Lines:** > 50%

### Test Types

1. **Unit Tests**
   - Route handlers
   - Middleware functions
   - Utility functions
   - Authentication logic

2. **Integration Tests**
   - Full API workflows
   - Database interactions
   - Error handling
   - Performance scenarios

3. **Security Tests**
   - Authentication edge cases
   - Input validation
   - SQL injection prevention
   - Rate limiting

## Environment Configuration

### Test Environment Variables

```bash
# Core Configuration
NODE_ENV=test
API_TOKEN=test-github-actions-token
HOST=localhost
PORT=3001

# Database Configuration
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/test_db

# Test-Specific Settings
DISABLE_RATE_LIMITING=true
LOG_LEVEL=error
```

### Database Configuration

**PostgreSQL Service:**
```yaml
postgres:
  image: postgres:15
  env:
    POSTGRES_USER: postgres
    POSTGRES_PASSWORD: postgres
    POSTGRES_DB: test_db
  options: >-
    --health-cmd pg_isready
    --health-interval 10s
    --health-timeout 5s
    --health-retries 5
  ports:
    - 5432:5432
```

## Artifacts and Reports

### Coverage Reports

**Generated Files:**
- `coverage/lcov-report/index.html` - HTML coverage report
- `coverage/lcov.info` - LCOV format for external tools
- `coverage/clover.xml` - Clover format for integrations

**Upload Destinations:**
- Codecov for public visibility
- GitHub Actions artifacts for team access

### Test Results

**Retention Policy:**
- 30 days for all test artifacts
- Permanent storage for coverage trends

**Artifact Contents:**
- Test execution logs
- Coverage reports
- Performance metrics
- Error details

## Monitoring and Notifications

### PR Comments

Automated comments include:
- Test execution status
- Coverage metrics comparison
- Performance impact analysis
- Security scan results

### Failure Notifications

**On Test Failures:**
- Immediate PR status update
- Detailed error logs in artifacts
- Slack notifications (if configured)

**On Security Issues:**
- Blocks merge until resolved
- Detailed vulnerability reports
- Remediation suggestions

## Best Practices

### Branch Protection

Recommended branch protection rules:
```yaml
required_status_checks:
  strict: true
  contexts:
    - "test (18.x)"
    - "test (20.x)" 
    - "security-scan"
    - "integration-test"
enforce_admins: true
required_pull_request_reviews:
  required_approving_reviews: 1
  dismiss_stale_reviews: true
```

### Caching Strategy

**pnpm Cache:**
- Enabled for faster dependency installation
- Cache key based on `pnpm-lock.yaml`
- Automatic cache invalidation on lockfile changes

**Build Cache:**
- TypeScript compilation results
- Prisma client generation
- Node modules optimization

### Error Handling

**Graceful Degradation:**
- Fallback installation methods
- Retry mechanisms for flaky tests
- Resource cleanup on failures

**Debug Information:**
- Verbose logging on failures
- Environment variable dumps (sanitized)
- Timing information for performance analysis

## Maintenance Guidelines

### Regular Updates

**Monthly Tasks:**
- Update GitHub Actions versions
- Review security audit results
- Optimize cache strategies
- Update Node.js matrix versions

**Quarterly Tasks:**
- Performance benchmark reviews
- Test coverage target adjustments
- Security policy updates

### Troubleshooting

**Common Issues:**

1. **Lockfile Mismatches**
   ```bash
   # Solution: Update pnpm-lock.yaml
   pnpm install --no-frozen-lockfile
   pnpm install --lockfile-only
   ```

2. **Database Connection Failures**
   ```bash
   # Check service health
   pg_isready -h localhost -p 5432
   ```

3. **Test Timeouts**
   ```bash
   # Increase Jest timeout
   jest --testTimeout=30000
   ```

### Performance Optimization

**Pipeline Speed:**
- Parallel job execution
- Optimized dependency caching
- Minimal Docker image layers

**Resource Usage:**
- Memory limits for tests
- CPU allocation for matrix jobs
- Storage optimization for artifacts

## Security Considerations

### Secret Management

**Required Secrets:**
- `CODECOV_TOKEN` - Coverage reporting
- `SLACK_WEBHOOK` - Notifications (optional)
- Database credentials (auto-generated)

**Security Practices:**
- No secrets in logs
- Encrypted artifact storage
- Limited secret scope

### Vulnerability Management

**Automated Scanning:**
- Dependency vulnerabilities
- Container image scanning
- Code quality analysis

**Response Procedures:**
- Critical: Immediate fix required
- High: Fix within 7 days
- Medium: Fix within 30 days

## Metrics and Analytics

### Performance Metrics

**Tracked Metrics:**
- Build duration trends
- Test execution time
- Cache hit rates
- Artifact sizes

**Reporting:**
- Weekly performance summaries
- Monthly trend analysis
- Quarterly optimization reviews

### Quality Metrics

**Code Quality:**
- Test coverage trends
- Cyclomatic complexity
- Technical debt indicators

**Process Quality:**
- Deployment frequency
- Lead time for changes
- Mean time to recovery

This comprehensive CI/CD pipeline ensures robust, secure, and efficient development workflows for the pandemic surveillance platform.