# CI/CD Pipeline Setup Guide

## Prerequisites

Before setting up the CI/CD pipeline, ensure you have:

1. **GitHub Repository** with admin access
2. **Node.js Environment** (18.x or 20.x)
3. **pnpm Package Manager** (8.x)
4. **PostgreSQL Database** (15+)
5. **Basic Git Knowledge**

## Quick Setup

### 1. Repository Configuration

```bash
# Clone the repository
git clone https://github.com/your-org/mspr.git
cd mspr

# Verify workflow files exist
ls -la .github/workflows/
```

### 2. Enable GitHub Actions

1. Navigate to your repository on GitHub
2. Go to **Settings** → **Actions** → **General**
3. Set **Actions permissions** to "Allow all actions and reusable workflows"
4. Enable **Workflow permissions** to "Read and write permissions"

### 3. Configure Branch Protection

Navigate to **Settings** → **Branches** → **Add rule**:

```yaml
Branch name pattern: main*
Protection rules:
  ✅ Require a pull request before merging
  ✅ Require status checks to pass before merging
  ✅ Require branches to be up to date before merging
  ✅ Require conversation resolution before merging
  
Required status checks:
  - test (18.x)
  - test (20.x)
  - security-scan
  - integration-test
```

### 4. Set Up Secrets (Optional)

Go to **Settings** → **Secrets and variables** → **Actions**:

```bash
# Optional secrets for enhanced features
CODECOV_TOKEN=your-codecov-token
SLACK_WEBHOOK_URL=your-slack-webhook
SONAR_TOKEN=your-sonarqube-token
```

## Detailed Configuration

### Environment Variables

The pipeline uses these environment variables:

```yaml
# Test Environment
NODE_ENV: test
API_TOKEN: test-github-actions-token
DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
HOST: localhost
PORT: 3001

# Production Environment (if deploying)
PRODUCTION_API_TOKEN: ${{ secrets.PRODUCTION_API_TOKEN }}
PRODUCTION_DATABASE_URL: ${{ secrets.PRODUCTION_DATABASE_URL }}
```

### Database Setup

The pipeline automatically sets up PostgreSQL:

```yaml
services:
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

### Package Manager Configuration

Ensure your `package.json` includes test scripts:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --watchAll=false",
    "build": "tsc",
    "start": "node build/index.js"
  }
}
```

## Testing the Pipeline

### 1. Create a Test Branch

```bash
# Create and switch to test branch
git checkout -b test/pipeline-setup

# Make a small change
echo "# Pipeline Test" >> README.md
git add README.md
git commit -m "test: verify pipeline setup"

# Push to GitHub
git push origin test/pipeline-setup
```

### 2. Create Pull Request

1. Go to your repository on GitHub
2. Click **Compare & pull request**
3. Create the pull request
4. Watch the Actions tab for pipeline execution

### 3. Monitor Pipeline Execution

Navigate to **Actions** tab to see:
- ✅ Unit and integration tests
- ✅ Security scanning
- ✅ Code coverage reports
- ✅ Artifact generation

## Customization Options

### Test Configuration

Modify `jest.config.js` for custom test settings:

```javascript
module.exports = {
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 80,    // Adjust as needed
      functions: 80,   // Adjust as needed
      lines: 80,       // Adjust as needed
      statements: 80   // Adjust as needed
    }
  },
  
  // Test timeout
  testTimeout: 30000,  // 30 seconds
  
  // Custom test patterns
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/*.(test|spec).+(ts|tsx|js)'
  ]
};
```

### Security Scanning

Adjust security audit levels in the workflow:

```yaml
- name: Run security audit
  run: |
    # Change audit level: low, moderate, high, critical
    pnpm audit --audit-level=moderate
```

### Matrix Testing

Customize Node.js versions:

```yaml
strategy:
  matrix:
    node-version: [18.x, 20.x, 22.x]  # Add more versions
    os: [ubuntu-latest, windows-latest]  # Add OS matrix
```

## Troubleshooting

### Common Issues

#### 1. Tests Failing in CI but Passing Locally

**Cause:** Environment differences
**Solution:**
```bash
# Run tests with CI environment locally
NODE_ENV=test npm run test:ci

# Check for timezone issues
TZ=UTC npm test

# Verify database connection
DATABASE_URL=postgresql://localhost:5432/test npm test
```

#### 2. pnpm Installation Failures

**Cause:** Lockfile version mismatch
**Solution:**
```bash
# Update lockfile
pnpm install --no-frozen-lockfile
git add pnpm-lock.yaml
git commit -m "fix: update pnpm lockfile"
```

#### 3. Database Connection Issues

**Cause:** Service startup timing
**Solution:** Add health checks and retries:
```yaml
- name: Wait for PostgreSQL
  run: |
    until pg_isready -h localhost -p 5432; do
      echo "Waiting for PostgreSQL..."
      sleep 2
    done
```

#### 4. Coverage Reports Not Generated

**Cause:** Missing coverage configuration
**Solution:**
```javascript
// jest.config.js
module.exports = {
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html']
};
```

### Debug Mode

Enable debug logging in workflows:

```yaml
env:
  ACTIONS_STEP_DEBUG: true
  ACTIONS_RUNNER_DEBUG: true
```

### Local Testing

Test the pipeline components locally:

```bash
# Install dependencies
pnpm install

# Run tests locally
npm run test:coverage

# Start local database
docker run -d \
  --name test-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=test_db \
  -p 5432:5432 \
  postgres:15

# Run integration tests
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/test_db \
npm run test
```

## Performance Optimization

### Cache Configuration

Optimize dependency caching:

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: ${{ matrix.node-version }}
    cache: 'pnpm'
    cache-dependency-path: |
      rest/pnpm-lock.yaml
      site/pnpm-lock.yaml
```

### Parallel Execution

Run independent jobs in parallel:

```yaml
jobs:
  test:
    # Main test job
  
  lint:
    runs-on: ubuntu-latest
    steps:
      # Linting steps
  
  type-check:
    runs-on: ubuntu-latest
    steps:
      # Type checking steps
```

### Resource Limits

Configure resource usage:

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    env:
      NODE_OPTIONS: --max-old-space-size=4096
```

## Monitoring and Alerts

### GitHub Notifications

Configure notification settings:
1. Go to **Settings** → **Notifications**
2. Enable **Actions** notifications
3. Choose delivery method (email, mobile)

### Status Badges

Add status badges to README:

```markdown
[![CI](https://github.com/your-org/mspr/workflows/REST%20API%20Tests/badge.svg)](https://github.com/your-org/mspr/actions)
```

### Integration with External Tools

#### Codecov Integration

1. Sign up at [codecov.io](https://codecov.io)
2. Connect your GitHub repository
3. Add `CODECOV_TOKEN` to repository secrets

#### Slack Integration

```yaml
- name: Notify Slack
  if: failure()
  uses: 8398a7/action-slack@v3
  with:
    status: failure
    webhook_url: ${{ secrets.SLACK_WEBHOOK_URL }}
```

## Maintenance Schedule

### Weekly Tasks
- [ ] Review failed builds
- [ ] Check security audit results
- [ ] Monitor pipeline performance

### Monthly Tasks
- [ ] Update GitHub Actions versions
- [ ] Review test coverage trends
- [ ] Optimize cache strategies

### Quarterly Tasks
- [ ] Update Node.js matrix versions
- [ ] Review and update dependencies
- [ ] Performance benchmark analysis

## Getting Help

### Resources
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Jest Testing Framework](https://jestjs.io/docs/getting-started)
- [pnpm Package Manager](https://pnpm.io/motivation)

### Support Channels
- GitHub Issues for pipeline-specific problems
- Team Slack channel for quick questions
- Weekly team sync for complex issues

This setup guide ensures a smooth CI/CD pipeline implementation for the MSPR 3 project.