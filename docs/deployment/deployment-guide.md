# Guide de Déploiement MSPR

## Aperçu
Ce guide fournit des instructions complètes pour déployer l'application MSPR (Surveillance des Pandémies) sur les trois clusters cibles : États-Unis, France et Suisse.

## Table des Matières
- [Prérequis](#prérequis)
- [Démarrage Rapide](#démarrage-rapide)
- [Déploiements Spécifiques par Cluster](#déploiements-spécifiques-par-cluster)
- [Déploiement en Production](#déploiement-en-production)
- [Surveillance et Maintenance](#surveillance-et-maintenance)
- [Dépannage](#dépannage)

## Prérequis

### Exigences Système
- **Docker** : Version 20.10 ou supérieure
- **Docker Compose** : Version 2.0 ou supérieure
- **Node.js** : Version 20 ou supérieure (pour le développement local)
- **Python** : Version 3.11 ou supérieure (pour les processus ETL)
- **PostgreSQL** : Version 16 ou supérieure
- **Git** : Pour la gestion du code source

### Exigences d'Infrastructure
- **CPU** : Minimum 4 cœurs, recommandé 8 cœurs
- **Mémoire** : Minimum 8GB RAM, recommandé 16GB
- **Stockage** : Minimum 100GB SSD, recommandé 500GB
- **Réseau** : Connexion internet stable avec support HTTPS

### Exigences d'Accès
- Accès administrateur aux serveurs cibles
- Identifiants de base de données et chaînes de connexion
- Certificats SSL/TLS pour le déploiement en production
- Accès au pipeline CI/CD (GitHub Actions)

## Démarrage Rapide

### 1. Cloner le Dépôt
```bash
git clone https://github.com/your-org/mspr.git
cd mspr
```

### 2. Configuration de l'Environnement
```bash
# Copier le modèle d'environnement
cp .env.example .env

# Éditer les variables d'environnement
nano .env
```

### 3. Générer les Certificats SSL (Développement)
```bash
# Générer des certificats auto-signés pour le développement
./security/certificates/generate-certs.sh \
  --domain localhost \
  --cluster us \
  --environment development
```

### 4. Construire et Démarrer les Services
```bash
# Construire les images Docker
docker-compose -f infrastructure/docker/docker-compose.yml build

# Démarrer tous les services
docker-compose -f infrastructure/docker/docker-compose.yml up -d

# Vérifier le statut des services
docker-compose -f infrastructure/docker/docker-compose.yml ps
```

### 5. Initialiser la Base de Données
```bash
# Exécuter les migrations de base de données
docker-compose -f infrastructure/docker/docker-compose.yml exec backend pnpm dlx prisma migrate deploy

# Alimenter avec des données d'exemple (optionnel)
docker-compose -f infrastructure/docker/docker-compose.yml exec backend pnpm dlx prisma db seed
```

### 6. Vérifier le Déploiement
```bash
# Vérifier la santé de l'API
curl http://localhost:3001/health

# Vérifier le frontend
curl http://localhost:3000/

# Voir les logs
docker-compose -f infrastructure/docker/docker-compose.yml logs -f
```

## Cluster-Specific Deployments

### United States Cluster

#### Configuration
```bash
# Copy US-specific environment
cp .env.us .env

# Key features enabled:
# - API Technical (full data access)
# - Data visualization
# - ETL processing
# - High-performance optimization
```

#### Deployment
```bash
# Deploy US cluster
./infrastructure/scripts/deploy.sh \
  --cluster us \
  --environment production \
  --verbose

# Verify US-specific features
curl -H "Authorization: Bearer $API_TOKEN" \
  http://localhost:3002/api/technical/raw-data
```

#### Performance Tuning
```yaml
# US cluster performance settings
HIGH_VOLUME_MODE: true
PERFORMANCE_OPTIMIZATION: true
MAX_CONNECTIONS: 200
WORKER_PROCESSES: 4
CACHE_TTL: 3600
```

### France Cluster

#### GDPR Compliance Setup
```bash
# Copy France-specific environment
cp .env.france .env

# Enable GDPR features
export GDPR_COMPLIANCE=true
export DATA_RETENTION_DAYS=90
export ENCRYPT_PERSONAL_DATA=true
```

#### Deployment
```bash
# Deploy France cluster with GDPR compliance
./infrastructure/scripts/deploy.sh \
  --cluster france \
  --environment production \
  --verbose

# Verify GDPR endpoints
curl http://localhost:3001/api/privacy/policy
curl http://localhost:3001/api/privacy/consent
```

#### GDPR Configuration
```yaml
# France cluster GDPR settings
GDPR_COMPLIANCE: true
DATA_RETENTION_DAYS: 90
ENABLE_CONSENT_MANAGEMENT: true
ENABLE_DATA_PORTABILITY: true
ENABLE_RIGHT_TO_DELETION: true
ANONYMIZE_IP: true
COOKIE_CONSENT_REQUIRED: true
```

### Switzerland Cluster

#### Multilingual Setup
```bash
# Copy Switzerland-specific environment
cp .env.switzerland .env

# Configure multilingual support
export CLUSTER_LANGUAGES=fr,de,it
export DEFAULT_LANGUAGE=fr
export AUTO_DETECT_LANGUAGE=true
```

#### Deployment
```bash
# Deploy Switzerland cluster (minimal configuration)
./infrastructure/scripts/deploy.sh \
  --cluster switzerland \
  --environment production \
  --verbose

# Verify multilingual support
curl http://localhost:3000/?lang=fr
curl http://localhost:3000/?lang=de
curl http://localhost:3000/?lang=it
```

#### Minimal Configuration
```yaml
# Switzerland cluster minimal settings
CLUSTER_FEATURES: ""  # No advanced features
ENABLE_API_TECHNICAL: false
ENABLE_DATAVIZ: false
ENABLE_ETL: false
ENABLE_REDIS: false
```

## Production Deployment

### 1. Pre-Deployment Checklist

#### Security Audit
```bash
# Run security scan
npm run security:scan

# Check for vulnerabilities
docker run --rm -v $(pwd):/app aquasec/trivy fs /app

# Validate configurations
./scripts/validate-config.sh
```

#### Environment Validation
```bash
# Validate all required environment variables
./scripts/validate-env.sh

# Test database connectivity
./scripts/test-db-connection.sh

# Verify SSL certificates
./scripts/verify-certificates.sh
```

### 2. Infrastructure Preparation

#### Database Setup
```sql
-- Create production databases
CREATE DATABASE mspr_us;
CREATE DATABASE mspr_france;
CREATE DATABASE mspr_switzerland;

-- Create users with appropriate permissions
CREATE USER mspr_us_user WITH PASSWORD 'secure_password';
CREATE USER mspr_france_user WITH PASSWORD 'secure_password';
CREATE USER mspr_switzerland_user WITH PASSWORD 'secure_password';

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE mspr_us TO mspr_us_user;
GRANT ALL PRIVILEGES ON DATABASE mspr_france TO mspr_france_user;
GRANT ALL PRIVILEGES ON DATABASE mspr_switzerland TO mspr_switzerland_user;
```

#### Load Balancer Configuration
```nginx
# Production load balancer configuration
upstream backend_us {
    least_conn;
    server us-backend-1:3001 max_fails=3 fail_timeout=30s;
    server us-backend-2:3001 max_fails=3 fail_timeout=30s;
}

upstream frontend_us {
    least_conn;
    server us-frontend-1:3000 max_fails=3 fail_timeout=30s;
    server us-frontend-2:3000 max_fails=3 fail_timeout=30s;
}

server {
    listen 443 ssl http2;
    server_name us.mspr.example.com;
    
    ssl_certificate /etc/nginx/ssl/us/cert.crt;
    ssl_certificate_key /etc/nginx/ssl/us/private.key;
    
    location /api {
        proxy_pass http://backend_us;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location / {
        proxy_pass http://frontend_us;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 3. Production Deployment Process

#### Automated Deployment
```bash
# Deploy using CI/CD pipeline
gh workflow run deploy-production.yml \
  -f cluster=us \
  -f skip_backup=false

# Monitor deployment progress
gh run list --workflow=deploy-production.yml

# Check deployment status
gh run view [RUN_ID]
```

#### Manual Deployment
```bash
# Create production backup
./infrastructure/scripts/backup.sh \
  --cluster us \
  --type full \
  --retention 30

# Deploy to production
./infrastructure/scripts/deploy.sh \
  --cluster us \
  --environment production \
  --force-recreate

# Verify deployment
./scripts/post-deployment-tests.sh us production
```

### 4. Post-Deployment Verification

#### Health Checks
```bash
# API health check
curl -f https://us.mspr.example.com/health

# Database connectivity
docker exec -it mspr-backend-us \
  pnpm dlx prisma db ping

# Service status
docker ps --filter "name=mspr"

# Log verification
docker logs mspr-backend-us --tail 100
docker logs mspr-frontend-us --tail 100
```

#### Performance Testing
```bash
# Run load tests
npm run test:load:production

# Monitor resource usage
docker stats

# Check response times
curl -w "@curl-format.txt" -o /dev/null -s https://us.mspr.example.com/
```

## Monitoring and Maintenance

### 1. Monitoring Setup

#### Prometheus Configuration
```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'mspr-backend'
    static_configs:
      - targets: ['backend:3001']
    metrics_path: '/metrics'
    
  - job_name: 'mspr-frontend'
    static_configs:
      - targets: ['frontend:3000']
    metrics_path: '/metrics'
    
  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres:5432']
```

#### Grafana Dashboards
```json
{
  "dashboard": {
    "title": "MSPR Application Metrics",
    "panels": [
      {
        "title": "API Response Time",
        "type": "stat",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          }
        ]
      },
      {
        "title": "Database Connections",
        "type": "graph",
        "targets": [
          {
            "expr": "pg_stat_database_numbackends",
            "legendFormat": "Active connections"
          }
        ]
      }
    ]
  }
}
```

### 2. Log Management

#### Centralized Logging
```yaml
# docker-compose.override.yml for logging
version: '3.8'
services:
  backend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
        labels: "service=backend,cluster=us"
        
  frontend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
        labels: "service=frontend,cluster=us"
```

#### Log Analysis
```bash
# View recent logs
docker-compose logs --tail=100 -f

# Search for errors
docker-compose logs | grep -i error

# Monitor specific service
docker-compose logs -f backend

# Export logs for analysis
docker-compose logs --since 24h > logs_$(date +%Y%m%d).txt
```

### 3. Backup and Recovery

#### Automated Backups
```bash
# Schedule daily backups (crontab)
0 2 * * * /path/to/mspr/infrastructure/scripts/backup.sh --cluster us --type full

# Verify backup integrity
./infrastructure/scripts/verify-backup.sh backup_20240101_020000.tar.gz

# Test restore process
./infrastructure/scripts/restore.sh \
  --cluster us \
  --file backup_20240101_020000 \
  --type db-only
```

#### Disaster Recovery
```bash
# Full system restore
./infrastructure/scripts/restore.sh \
  --cluster us \
  --file latest_backup \
  --type full \
  --force

# Verify restored system
./scripts/verify-system-integrity.sh us
```

### 4. Updates and Maintenance

#### Security Updates
```bash
# Update base images
docker-compose pull

# Rebuild with latest security patches
docker-compose build --no-cache

# Deploy updated images
./infrastructure/scripts/deploy.sh \
  --cluster us \
  --environment production \
  --force-recreate
```

#### Application Updates
```bash
# Deploy new application version
git pull origin main

# Run database migrations
docker-compose exec backend pnpm dlx prisma migrate deploy

# Restart services with zero downtime
docker-compose up -d --no-deps backend
docker-compose up -d --no-deps frontend
```

## Troubleshooting

### Common Issues

#### 1. Service Start Failures
```bash
# Check service logs
docker-compose logs [service_name]

# Verify environment variables
docker-compose config

# Check port conflicts
netstat -tulpn | grep :3000
netstat -tulpn | grep :3001
```

#### 2. Database Connection Issues
```bash
# Test database connectivity
docker-compose exec backend node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.\$connect().then(() => console.log('Connected')).catch(console.error);
"

# Check database logs
docker-compose logs postgres

# Verify database configuration
docker-compose exec postgres psql -U mspr_user -d mspr -c "\\l"
```

#### 3. SSL/TLS Issues
```bash
# Verify certificate validity
openssl x509 -in security/certificates/us/production/cert.crt -text -noout

# Test SSL configuration
openssl s_client -connect localhost:443 -servername localhost

# Check certificate expiration
./scripts/check-cert-expiry.sh
```

#### 4. Performance Issues
```bash
# Monitor resource usage
docker stats

# Check application metrics
curl http://localhost:3001/metrics

# Analyze slow queries
docker-compose exec postgres psql -U mspr_user -d mspr -c "
SELECT query, mean_time, calls, total_time 
FROM pg_stat_statements 
ORDER BY total_time DESC 
LIMIT 10;
"
```

### Emergency Procedures

#### System Outage
```bash
# 1. Assess the situation
./scripts/health-check-all.sh

# 2. Check recent changes
git log --oneline -10

# 3. Rollback if necessary
./infrastructure/scripts/rollback.sh \
  --cluster us \
  --version previous

# 4. Restore from backup if needed
./infrastructure/scripts/restore.sh \
  --cluster us \
  --file latest_good_backup \
  --force
```

#### Security Incident
```bash
# 1. Isolate affected systems
./scripts/isolate-cluster.sh us

# 2. Collect logs for analysis
./scripts/collect-security-logs.sh us

# 3. Reset credentials
./scripts/rotate-secrets.sh us

# 4. Restore from clean backup
./infrastructure/scripts/restore.sh \
  --cluster us \
  --file pre_incident_backup \
  --type full
```

## Support and Resources

### Documentation
- [Architecture Documentation](./architecture/)
- [API Documentation](./api/)
- [Security Policies](../security/policies/)
- [GDPR Compliance](../security/gdpr/)

### Monitoring Dashboards
- **Grafana**: http://localhost:3001/grafana
- **Prometheus**: http://localhost:9090
- **Application Logs**: `docker-compose logs -f`

### Contact Information
- **Technical Support**: tech-support@mspr.example.com
- **Security Issues**: security@mspr.example.com
- **Emergency**: +1-XXX-XXX-XXXX

---

**Document Version**: 1.0
**Last Updated**: 2024-01-01
**Next Review**: 2024-04-01
**Maintained By**: DevOps Team