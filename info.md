To test the MSPR DevOps implementation, here are the comprehensive testing approaches organized by scope:

🚀 Quick Start Testing

1. Local Development Testing

# Clone and setup

git clone <your-repo>
cd mspr

# Copy environment template

cp .env.example .env

# Start the full stack

docker-compose -f infrastructure/docker/docker-compose.yml up -d

# Verify all services are running

docker-compose -f infrastructure/docker/docker-compose.yml ps

# Test API health

curl http://localhost:3001/health

# Test frontend

curl http://localhost:3000/

2. Basic Functionality Testing

# Test database connectivity

docker-compose exec backend pnpm dlx prisma db ping

# Run database migrations

docker-compose exec backend pnpm dlx prisma migrate deploy

# Test API endpoints

curl -H "Authorization: Bearer test-token" http://localhost:3001/api/covid
curl -H "Authorization: Bearer test-token" http://localhost:3001/api/mpox

🧪 Automated Testing Suite

3. Unit Tests

# Install dependencies

cd rest && pnpm install
cd ../site && pnpm install

# Run backend unit tests

cd rest && pnpm test

# Run frontend unit tests

cd site && pnpm test

# Run with coverage

pnpm test:coverage

4. Integration Tests

# Start test database

docker run -d --name test-postgres \
 -e POSTGRES_USER=test_user \
 -e POSTGRES_PASSWORD=test_password \
 -e POSTGRES_DB=test_db \
 -p 5432:5432 postgres:16-alpine

# Run integration tests

npm run test:integration

# Clean up

docker stop test-postgres && docker rm test-postgres

5. End-to-End Testing

# Install Playwright

npx playwright install

# Run e2e tests

npm run test:e2e

# Run with UI mode

npx playwright test --ui

# Generate test report

npx playwright show-report

🌍 Cluster-Specific Testing

6. US Cluster Testing

# Deploy US cluster

./infrastructure/scripts/deploy.sh --cluster us --environment development

# Test high-performance features

curl -H "Authorization: Bearer $API_TOKEN" \
 http://localhost:3002/api/technical/raw-data

# Test performance optimization

ab -n 1000 -c 10 http://localhost:3001/api/covid

7. France Cluster Testing (GDPR)

# Deploy France cluster

./infrastructure/scripts/deploy.sh --cluster france --environment development

# Test GDPR endpoints

curl http://localhost:3001/api/privacy/policy
curl http://localhost:3001/api/privacy/consent

# Test data retention compliance

curl -X POST http://localhost:3001/api/privacy/erasure \
 -H "Content-Type: application/json" \
 -d '{"userId": "test-user", "reason": "withdrawal"}'

# Verify French localization

curl http://localhost:3000/?lang=fr

8. Switzerland Cluster Testing (Multilingual)

# Deploy Switzerland cluster

./infrastructure/scripts/deploy.sh --cluster switzerland --environment development

# Test multilingual support

curl http://localhost:3000/?lang=fr
curl http://localhost:3000/?lang=de
curl http://localhost:3000/?lang=it

# Verify minimal feature set (no ETL, no DataViz)

curl http://localhost:3001/api/features # Should show limited features

🔒 Security Testing

9. Security Scanning

# Run vulnerability scan

docker run --rm -v $(pwd):/app aquasec/trivy fs /app

# Security linting

npm run lint:security

# Dependency audit

cd rest && pnpm audit
cd site && pnpm audit

10. Authentication Testing

# Test without token (should fail)

curl http://localhost:3001/api/covid

# Test with invalid token (should fail)

curl -H "Authorization: Bearer invalid-token" \
 http://localhost:3001/api/covid

# Test with valid token (should succeed)

curl -H "Authorization: Bearer $API_TOKEN" \
 http://localhost:3001/api/covid

📊 Performance Testing

11. Load Testing

# Install Artillery

npm install -g artillery

# Run load tests

artillery run tests/performance/load-test.js

# Monitor during load test

docker stats

12. Database Performance

# Test database performance

docker-compose exec postgres psql -U mspr_user -d mspr -c "
SELECT query, mean_time, calls, total_time
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;"

🔄 CI/CD Pipeline Testing

13. GitHub Actions Testing

# Trigger CI manually

gh workflow run ci.yml

# Check workflow status

gh run list --workflow=ci.yml

# View specific run

gh run view [RUN_ID]

# Test staging deployment

gh workflow run deploy-staging.yml -f cluster=us

14. Docker Build Testing

# Build all images

docker-compose -f infrastructure/docker/docker-compose.yml build

# Test image vulnerabilities

docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
 aquasec/trivy image mspr-backend:latest

# Test container startup

docker run --rm mspr-backend:latest --version

📈 Monitoring Testing

15. Start Monitoring Stack

# Start monitoring services

docker-compose -f monitoring/docker-compose.monitoring.yml up -d

# Access Grafana

open http://localhost:3001 # admin/admin

# Access Prometheus

open http://localhost:9090

# Test alerts

curl -X POST http://localhost:9093/api/v1/alerts

16. Metrics Validation

# Check Prometheus targets

curl http://localhost:9090/api/v1/targets

# Test custom metrics

curl http://localhost:3001/metrics
curl http://localhost:3000/api/metrics

# Verify alerting rules

curl http://localhost:9090/api/v1/rules

🏗️ Infrastructure Testing

17. Kubernetes Testing (if using K8s)

# Apply Kubernetes manifests

kubectl apply -f infrastructure/kubernetes/

# Check pod status

kubectl get pods -n mspr-us
kubectl get pods -n mspr-france
kubectl get pods -n mspr-switzerland

# Test service connectivity

kubectl port-forward svc/mspr-backend-us 3001:3001 -n mspr-us
curl http://localhost:3001/health

18. Backup and Restore Testing

# Create backup

./infrastructure/scripts/backup.sh --cluster us --type full

# List backups

ls -la backups/

# Test restore (use a test environment!)

./infrastructure/scripts/restore.sh \
 --cluster us \
 --file mspr_us_full_20240101_120000 \
 --type full

🔧 Quality Testing

19. Code Quality with SonarQube

# Start SonarQube

docker-compose -f monitoring/docker-compose.monitoring.yml up -d sonarqube

# Run analysis

npm run sonar:scan

# View results

open http://localhost:9000

20. SSL/TLS Testing

# Generate test certificates

./security/certificates/generate-certs.sh \
 --domain localhost \
 --cluster us \
 --environment development

# Test SSL configuration

openssl s_client -connect localhost:443 -servername localhost

# Check certificate expiry

openssl x509 -in security/certificates/us/development/cert.crt \
 -text -noout | grep "Not After"

🎯 Complete Test Suite

21. Run All Tests

# Create a comprehensive test script

cat > run-all-tests.sh << 'EOF'
#!/bin/bash
set -e

echo "🚀 Starting comprehensive MSPR testing..."

# 1. Unit tests

echo "📝 Running unit tests..."
cd rest && pnpm test && cd ..
cd site && pnpm test && cd ..

# 2. Integration tests

echo "🔗 Running integration tests..."
npm run test:integration

# 3. Security tests

echo "🔒 Running security tests..."
npm run security:scan

# 4. Performance tests

echo "⚡ Running performance tests..."
npm run test:load

# 5. E2E tests

echo "🎭 Running e2e tests..."
npm run test:e2e

echo "✅ All tests completed successfully!"
EOF

chmod +x run-all-tests.sh
./run-all-tests.sh

📋 Test Checklist

Use this checklist to verify your testing:

✅ Basic Functionality

-   All services start successfully
-   Database connections work
-   API endpoints respond correctly
-   Frontend loads and displays data
-   Authentication works properly

✅ Cluster-Specific Features

-   US: Technical API accessible
-   US: High performance mode active
-   France: GDPR endpoints functional
-   France: Data retention working
-   Switzerland: Multilingual support
-   Switzerland: Minimal features only

✅ Security & Compliance

-   No critical vulnerabilities
-   Authentication required for protected endpoints
-   GDPR compliance verified (France)
-   SSL/TLS certificates valid
-   Security headers present

✅ Performance & Reliability

-   Load tests pass
-   Response times within limits
-   No memory leaks
-   Backup/restore works
-   Monitoring active

✅ CI/CD Pipeline

-   All GitHub Actions pass
-   Docker builds successful
-   Deployments work
-   Rollbacks functional

🆘 Troubleshooting Testing Issues

If tests fail, check:

1. Service Dependencies: Ensure all required services are running
2. Environment Variables: Verify all required env vars are set
3. Network Connectivity: Check if services can communicate
4. Resource Limits: Ensure sufficient CPU/memory available
5. Log Files: Check container logs for errors

# Debug commands

docker-compose logs -f [service_name]
docker ps -a
docker system df
kubectl describe pod [pod-name] -n [namespace]

This comprehensive testing approach ensures your MSPR implementation is production-ready across all three
clusters with proper security, compliance, and performance characteristics.
