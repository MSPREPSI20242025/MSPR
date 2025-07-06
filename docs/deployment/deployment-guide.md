# Guide de Déploiement MSPR

## Aperçu

Ce guide fournit des instructions complètes pour déployer l'application MSPR (Surveillance des Pandémies) sur les trois clusters cibles : États-Unis, France et Suisse.

## Table des Matières

-   [Prérequis](#prérequis)
-   [Démarrage Rapide](#démarrage-rapide)
-   [Déploiements Spécifiques par Cluster](#déploiements-spécifiques-par-cluster)
-   [Déploiement en Production](#déploiement-en-production)
-   [Surveillance et Maintenance](#surveillance-et-maintenance)
-   [Dépannage](#dépannage)

## Prérequis

### Exigences Système

-   **Docker** : Version 20.10 ou supérieure
-   **Docker Compose** : Version 2.0 ou supérieure
-   **Node.js** : Version 20 ou supérieure (pour le développement local)
-   **Python** : Version 3.11 ou supérieure (pour les processus ETL)
-   **PostgreSQL** : Version 16 ou supérieure
-   **Git** : Pour la gestion du code source

### Exigences d'Infrastructure

-   **CPU** : Minimum 4 cœurs, recommandé 8 cœurs
-   **Mémoire** : Minimum 8GB RAM, recommandé 16GB
-   **Stockage** : Minimum 100GB SSD, recommandé 500GB
-   **Réseau** : Connexion internet stable avec support HTTPS

### Exigences d'Accès

-   Accès administrateur aux serveurs cibles
-   Identifiants de base de données et chaînes de connexion
-   Certificats SSL/TLS pour le déploiement en production
-   Accès au pipeline CI/CD (GitHub Actions)

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

### 4. Chargement Automatique des Données

**Note importante** : Le système utilise maintenant un processus ETL externe simplifié pour une meilleure fiabilité et facilité de maintenance.

```bash
# Option 1: Déploiement complet automatique avec données (RECOMMANDÉ)
./deploy-with-data.sh

# Option 2: Déploiement manuel étape par étape
# Démarrer PostgreSQL d'abord
docker-compose -f infrastructure/docker/docker-compose.yml up -d postgres

# Attendre que PostgreSQL soit prêt
sleep 10

# Exécuter l'ETL externe pour charger les données
./run-etl.sh

# Démarrer tous les autres services
docker-compose -f infrastructure/docker/docker-compose.yml up -d
```

#### Processus ETL Externe

L'ETL utilise maintenant un script externe avec `uv` pour la gestion des environnements Python :

```bash
# Le script run-etl.sh effectue automatiquement :
# 1. Création d'un environnement virtuel Python avec uv
# 2. Installation des dépendances depuis requirements.txt
# 3. Exécution séquentielle des scripts Python :
#    - etl/fetch.py : Téléchargement des données
#    - etl/main.py : Traitement et nettoyage
#    - etl/postgres.py : Insertion en base de données
```

### 5. Vérification du Chargement des Données

```bash
# Vérifier que les données ont été chargées
docker exec mspr-postgres psql -U mspr -d mspr -c "
    SELECT 'COVID-19' as dataset, COUNT(*) as records FROM covid_data
    UNION ALL
    SELECT 'MPOX' as dataset, COUNT(*) as records FROM mpox_data;
"

# Résultat attendu:
#  dataset  | records
# ----------+---------
#  COVID-19 |   68400
#  MPOX     |   15822
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
export CLUSTER_LANGUAGES=fr
```

#### Deployment

```bash
# Deploy France cluster with GDPR compliance
./infrastructure/scripts/deploy.sh \
  --cluster france \
  --environment production \
  --verbose

# Verify GDPR endpoints and pages
curl http://localhost:3000/mentions-legales
curl http://localhost:3000/politique-confidentialite
curl http://localhost:3000/politique-cookies
```

#### GDPR Configuration et Fonctionnalités

```yaml
# France cluster GDPR settings
GDPR_COMPLIANCE: true
DATA_RETENTION_DAYS: 90
ENABLE_CONSENT_MANAGEMENT: true
ENABLE_DATA_PORTABILITY: true
ENABLE_RIGHT_TO_DELETION: true
ANONYMIZE_IP: true
COOKIE_CONSENT_REQUIRED: true
CLUSTER_LANGUAGES: fr
```

#### Pages RGPD Implémentées

-   **Mentions Légales** (`/mentions-legales`) : Informations légales complètes
-   **Politique de Confidentialité** (`/politique-confidentialite`) : Traitement des données personnelles
-   **Politique des Cookies** (`/politique-cookies`) : Gestion des cookies et traceurs
-   **Bannière de Cookies** : Consentement utilisateur avec persistance
-   **Composant de Conformité RGPD** : Badges et liens de conformité

#### Fonctionnalités RGPD

-   Gestion du consentement cookies avec localStorage
-   Liens vers DPO (Délégué à la Protection des Données)
-   Informations sur les droits des utilisateurs
-   Politique de rétention des données (90 jours)
-   Anonymisation des adresses IP

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

# Test language switching
curl -H "Accept-Language: de" http://localhost:3000/
curl -H "Accept-Language: it" http://localhost:3000/
```

#### Configuration Multilingue

```yaml
# Switzerland cluster multilingual settings
CLUSTER_FEATURES: "" # No advanced features
CLUSTER_LANGUAGES: fr,de,it
DEFAULT_LANGUAGE: fr
AUTO_DETECT_LANGUAGE: true
ENABLE_API_TECHNICAL: false
ENABLE_DATAVIZ: false
ENABLE_ETL: false
ENABLE_REDIS: false
```

#### Système de Traduction

-   **Langues supportées** : Français, Allemand, Italien
-   **Détection automatique** : Basée sur les paramètres du cluster et du navigateur
-   **Sélecteur de langue** : Interface utilisateur adaptative
-   **Traductions complètes** : Navigation, données, interface utilisateur
-   **Persistance** : Choix de langue sauvegardé en localStorage

#### Fonctionnalités Multilingues

-   Middleware Next.js pour la gestion des locales
-   Provider de traduction React Context
-   Composants de sélection de langue (dropdown, boutons, compact)
-   Configuration cluster-spécifique des langues disponibles
-   Fallback automatique vers la langue par défaut

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
    - job_name: "mspr-backend"
      static_configs:
          - targets: ["backend:3001"]
      metrics_path: "/metrics"

    - job_name: "mspr-frontend"
      static_configs:
          - targets: ["frontend:3000"]
      metrics_path: "/metrics"

    - job_name: "postgres"
      static_configs:
          - targets: ["postgres:5432"]
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
version: "3.8"
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

#### 5. ETL et Chargement des Données

```bash
# Vérifier le statut du processus ETL
./run-etl.sh --check-status

# Nettoyer et relancer l'ETL
./run-etl.sh --clean-reload

# Vérifier la connectivité à la base de données
docker exec mspr-postgres psql -U mspr -d mspr -c "SELECT version();"

# Compter les enregistrements chargés
docker exec mspr-postgres psql -U mspr -d mspr -c "
SELECT 'covid_data' as table_name, COUNT(*) as records FROM covid_data
UNION ALL
SELECT 'mpox_data' as table_name, COUNT(*) as records FROM mpox_data;
"

# Vérifier les logs ETL
tail -f etl/logs/etl-$(date +%Y%m%d).log
```

#### 6. Problèmes de Traduction

```bash
# Vérifier la configuration des langues
curl http://localhost:3000/api/config/languages

# Tester la détection automatique
curl -H "Accept-Language: de,en;q=0.9" http://localhost:3000/

# Vérifier les traductions manquantes
npm run validate:translations

# Redémarrer avec langue spécifique
CLUSTER_LANGUAGES=fr,de,it docker-compose up -d frontend
```

#### 7. Problèmes RGPD (Cluster France)

```bash
# Vérifier les pages légales
curl http://localhost:3000/mentions-legales
curl http://localhost:3000/politique-confidentialite
curl http://localhost:3000/politique-cookies

# Tester la bannière de cookies
curl -c cookies.txt http://localhost:3000/
cat cookies.txt

# Vérifier la configuration RGPD
docker-compose exec frontend env | grep GDPR
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

## Système de Traduction Multilingue

### Architecture du Système i18n

Le système de traduction utilise une architecture modulaire avec React Context pour la gestion des langues :

```typescript
// Configuration des langues supportées
export const locales = ["fr", "de", "it", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "fr";
```

### Composants Principaux

#### 1. TranslationProvider

```typescript
// Provider principal pour la gestion des traductions
<TranslationProvider>
    <ClusterLanguageManager />
    <div>
        <Navigation />
        <main>{children}</main>
        <Footer />
    </div>
</TranslationProvider>
```

#### 2. ClusterLanguageManager

Gère la détection et configuration automatique des langues selon le cluster :

```typescript
// Logique de détection des langues
const availableLanguages = clusterLanguages.filter((lang) =>
    locales.includes(lang as Locale)
);

// Configuration automatique selon le cluster
switch (clusterName) {
    case "switzerland": // fr, de, it
    case "france": // fr uniquement
    case "us": // en uniquement
}
```

#### 3. LanguageSelector

Composant de sélection de langue avec trois modes :

-   **Dropdown** : Menu déroulant complet
-   **Buttons** : Boutons de sélection directe
-   **Compact** : Version compacte pour espaces restreints

### Configuration par Cluster

#### Variables d'Environnement

```bash
# Cluster États-Unis
CLUSTER_LANGUAGES=en
NEXT_PUBLIC_CLUSTER_LANGUAGES=en

# Cluster France
CLUSTER_LANGUAGES=fr
NEXT_PUBLIC_CLUSTER_LANGUAGES=fr

# Cluster Suisse
CLUSTER_LANGUAGES=fr,de,it
NEXT_PUBLIC_CLUSTER_LANGUAGES=fr,de,it
```

#### Next.js Configuration

```typescript
// next.config.ts - Configuration pour App Router
export default {
  output: "standalone",
  env: {
    NEXT_PUBLIC_CLUSTER_LANGUAGES: process.env.CLUSTER_LANGUAGES || "en",
  },
  // Note: i18n is handled by middleware in App Router
};
```

### Dictionnaires de Traduction

#### Structure des Traductions

```typescript
// site/src/lib/translations/
├── fr.ts    // Français (défaut)
├── de.ts    // Allemand
├── it.ts    // Italien
└── en.ts    // Anglais
```

#### Exemple de Dictionnaire

```typescript
export const translations = {
    nav: {
        home: "Accueil",
        covid: "COVID-19",
        mpox: "MPOX",
        compare: "Comparer",
        allData: "Toutes les Données",
    },
    data: {
        totalCases: "Cas Total",
        newCases: "Nouveaux Cas",
        totalDeaths: "Décès Total",
        country: "Pays",
    },
    legal: {
        privacyPolicy: "Politique de Confidentialité",
        cookiePolicy: "Politique des Cookies",
        gdprCompliant: "Conforme RGPD",
    },
};
```

### Utilisation dans les Composants

#### Hook useTranslation

```typescript
import { useTranslation } from "@/components/TranslationProvider";

function MyComponent() {
    const { t, locale, setLocale } = useTranslation();

    return (
        <div>
            <h1>{t("nav.home")}</h1>
            <p>Langue actuelle: {locale}</p>
            <button onClick={() => setLocale("de")}>Deutsch</button>
        </div>
    );
}
```

#### Traductions Imbriquées

```typescript
// Accès aux traductions imbriquées
t("data.metrics.totalCases", "Cas Total"); // avec fallback
t("legal.gdpr.userRights"); // traduction complexe
```

### Middleware de Langue

Le middleware Next.js gère automatiquement les locales :

```typescript
// site/src/middleware.ts
export function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    // Détection automatique des locales dans l'URL
    const pathnameIsMissingLocale = locales.every(
        (locale) => !pathname.startsWith(`/${locale}/`)
    );

    // Pas de redirection forcée, gestion côté client
    return NextResponse.next();
}
```

### Tests et Validation

#### Tests de Traduction

```bash
# Vérifier les traductions manquantes
npm run test:i18n

# Valider la cohérence des dictionnaires
npm run validate:translations

# Tester le switching de langues
npm run test:language-switching
```

## Conformité RGPD

### Vue d'Ensemble

Le système RGPD est spécifiquement conçu pour le cluster France avec une conformité complète au Règlement Général sur la Protection des Données.

### Pages Légales Implémentées

#### 1. Mentions Légales (`/mentions-legales`)

```typescript
// Structure complète des mentions légales
- Informations sur l'éditeur (OMS)
- Responsable de publication
- Hébergement et infrastructure
- Droits de propriété intellectuelle
- Responsabilité et garanties
- Droit applicable et juridiction
```

#### 2. Politique de Confidentialité (`/politique-confidentialite`)

```typescript
// Traitement des données personnelles
- Types de données collectées
- Finalités du traitement
- Bases légales (Art. 6 RGPD)
- Durée de conservation (90 jours)
- Droits des utilisateurs
- Mesures de sécurité
- Transferts de données
```

#### 3. Politique des Cookies (`/politique-cookies`)

```typescript
// Gestion des cookies et traceurs
- Types de cookies utilisés
- Finalités des cookies
- Durée de vie
- Paramétrage et refus
- Cookies tiers
- Mise à jour de la politique
```

### Composants RGPD

#### 1. CookieBanner

```typescript
// Bannière de consentement cookies
export default function CookieBanner() {
    const [showBanner, setShowBanner] = useState(false);

    // Gestion du consentement
    const handleAccept = () => {
        localStorage.setItem("cookieConsent", "accepted");
        setShowBanner(false);
    };

    const handleDecline = () => {
        localStorage.setItem("cookieConsent", "declined");
        setShowBanner(false);
    };
}
```

#### 2. GDPRCompliance

```typescript
// Composant de conformité RGPD
export default function GDPRCompliance() {
    return (
        <div className="gdpr-compliance">
            <div className="gdpr-badges">
                <span className="badge">🔒 Conforme RGPD</span>
                <span className="badge">🇪🇺 Conforme UE</span>
            </div>
            <div className="gdpr-links">
                <Link href="/mentions-legales">Mentions Légales</Link>
                <Link href="/politique-confidentialite">Confidentialité</Link>
                <Link href="/politique-cookies">Cookies</Link>
            </div>
        </div>
    );
}
```

### Configuration RGPD

#### Variables d'Environnement

```bash
# Cluster France - Configuration RGPD
GDPR_COMPLIANCE=true
DATA_RETENTION_DAYS=90
ENCRYPT_PERSONAL_DATA=true
ENABLE_CONSENT_MANAGEMENT=true
ENABLE_DATA_PORTABILITY=true
ENABLE_RIGHT_TO_DELETION=true
ANONYMIZE_IP=true
COOKIE_CONSENT_REQUIRED=true
```

#### Paramètres de Sécurité

```typescript
// Configuration de sécurité RGPD
const gdprConfig = {
    dataRetention: 90, // jours
    encryptPersonalData: true,
    anonymizeIp: true,
    cookieConsentRequired: true,
    auditLogging: true,
    dataPortability: true,
    rightToErasure: true,
};
```

### Droits des Utilisateurs

#### Droits Implémentés

1. **Droit d'accès** (Art. 15 RGPD)
2. **Droit de rectification** (Art. 16 RGPD)
3. **Droit à l'effacement** (Art. 17 RGPD)
4. **Droit à la portabilité** (Art. 20 RGPD)
5. **Droit d'opposition** (Art. 21 RGPD)
6. **Droit de limitation** (Art. 18 RGPD)

#### Contact DPO

```typescript
// Informations Délégué à la Protection des Données
const dpoContact = {
    name: "Délégué à la Protection des Données",
    email: "dpo@who.int",
    address:
        "Organisation Mondiale de la Santé, Avenue Appia 20, 1211 Genève 27",
    phone: "+41 22 791 21 11",
};
```

### Audit et Conformité

#### Journalisation RGPD

```typescript
// Log des actions RGPD
const gdprLogger = {
    logDataAccess: (userId: string, dataType: string) => {},
    logConsentChange: (userId: string, consent: boolean) => {},
    logDataDeletion: (userId: string, reason: string) => {},
    logDataExport: (userId: string, format: string) => {},
};
```

#### Rapports de Conformité

```bash
# Génération de rapports RGPD
npm run gdpr:audit-report
npm run gdpr:consent-report
npm run gdpr:data-retention-report
```

### Mise à Jour et Maintenance

#### Revue Périodique

-   **Fréquence** : Trimestrielle
-   **Éléments** : Politique de confidentialité, mentions légales, cookies
-   **Responsable** : Équipe juridique + DPO

#### Veille Réglementaire

-   Suivi des évolutions RGPD
-   Mise à jour des pratiques
-   Formation des équipes

## Support and Resources

### Documentation

-   [Architecture Documentation](./architecture/)
-   [API Documentation](./api/)

### Monitoring Dashboards

-   **Grafana**: http://localhost:3001/grafana
-   **Prometheus**: http://localhost:9090
-   **Application Logs**: `docker-compose logs -f`

### Contact Information

-   **Technical Support**: tech-support@mspr.example.com
-   **Security Issues**: security@mspr.example.com
-   **Emergency**: +1-XXX-XXX-XXXX

---
