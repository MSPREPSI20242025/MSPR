# MSPR - Surveillance des Pandémies

## Aperçu
MSPR (Surveillance des Pandémies) est une plateforme de surveillance internationale pour la surveillance des pandémies développée pour l'OMS. La plateforme supporte trois clusters distincts avec des adaptations locales :

- **🇺🇸 États-Unis** : Solution complète avec gestion de gros volumes
- **🇫🇷 France** : Conformité RGPD avec interface française
- **🇨🇭 Suisse** : Support multilingue (français, allemand, italien)

## 🏗️ Architecture

### Services Principaux
- **Frontend** : Application Next.js 15 avec React 19
- **Backend** : API REST avec Node.js/TypeScript et Express
- **Base de Données** : PostgreSQL 16 avec Prisma ORM
- **ETL** : Pipeline de traitement de données Python

### Technologies Utilisées
- **Frontend** : Next.js, React, Tailwind CSS, Recharts
- **Backend** : Node.js, TypeScript, Express.js, Prisma
- **Base de Données** : PostgreSQL
- **Conteneurisation** : Docker, Docker Compose
- **Orchestration** : Kubernetes
- **CI/CD** : GitHub Actions
- **Monitoring** : Prometheus, Grafana
- **Qualité** : SonarQube, Jest, Playwright

## 🚀 Démarrage Rapide

### Prérequis
- Docker 20.10+
- Docker Compose 2.0+
- Node.js 20+
- Python 3.11+

### Installation

1. **Cloner le dépôt**
   ```bash
   git clone https://github.com/votre-org/mspr.git
   cd mspr
   ```

2. **Configuration de l'environnement**
   ```bash
   # Copier le fichier d'exemple
   cp .env.example .env
   
   # Éditer les variables selon vos besoins
   nano .env
   ```

3. **Démarrer les services**
   ```bash
   # Construire et démarrer tous les services
   docker-compose -f infrastructure/docker/docker-compose.yml up -d
   
   # Vérifier le statut
   docker-compose -f infrastructure/docker/docker-compose.yml ps
   ```

4. **Initialiser la base de données**
   ```bash
   # Exécuter les migrations
   docker-compose exec backend pnpm dlx prisma migrate deploy
   
   # Optionnel : ajouter des données d'exemple
   docker-compose exec backend pnpm dlx prisma db seed
   ```

5. **Accéder à l'application**
   - Frontend : http://localhost:3000
   - API Backend : http://localhost:3001
   - API Documentation : http://localhost:3001/docs

## 🌍 Configurations par Cluster

### 🇺🇸 Cluster États-Unis
```bash
# Déployer le cluster US avec toutes les fonctionnalités
./infrastructure/scripts/deploy.sh --cluster us --environment production

# Fonctionnalités activées :
# ✅ API Technique (accès aux données brutes)
# ✅ Visualisation de données
# ✅ Pipeline ETL
# ✅ Mode haute performance
```

### 🇫🇷 Cluster France
```bash
# Déployer le cluster France avec conformité RGPD
./infrastructure/scripts/deploy.sh --cluster france --environment production

# Fonctionnalités activées :
# ❌ API Technique (sécurité)
# ✅ Visualisation de données
# ✅ Pipeline ETL
# ✅ Conformité RGPD complète
# ✅ Interface en français
```

### 🇨🇭 Cluster Suisse
```bash
# Déployer le cluster Suisse avec support multilingue
./infrastructure/scripts/deploy.sh --cluster switzerland --environment production

# Fonctionnalités activées :
# ❌ API Technique
# ❌ Visualisation de données
# ❌ Pipeline ETL
# ✅ Support multilingue (FR, DE, IT)
# ✅ Configuration minimale
```

## 🔒 Sécurité et Conformité

### Mesures de Sécurité
- **Authentification** : JWT avec rotation automatique
- **Chiffrement** : TLS 1.3 en transit, AES-256 au repos
- **Scan de vulnérabilités** : Automatisé dans la CI/CD
- **Headers de sécurité** : Configuration complète
- **Rate limiting** : Protection contre les abus

### Conformité RGPD (Cluster France)
- **Consentement** : Gestion complète des consentements
- **Droit à l'oubli** : Suppression automatisée
- **Portabilité** : Export des données personnelles
- **Rétention** : Suppression automatique après 90 jours
- **Chiffrement** : Données personnelles chiffrées
- **Audit** : Traçabilité complète des accès

## 🧪 Tests

### Exécuter les Tests
```bash
# Tests unitaires
cd rest && pnpm test
cd site && pnpm test

# Tests d'intégration
npm run test:integration

# Tests end-to-end
npm run test:e2e

# Tests de performance
npm run test:load

# Coverage de code
npm run test:coverage
```

### Types de Tests
- **Tests unitaires** : Jest (>80% de couverture)
- **Tests d'intégration** : API et base de données
- **Tests E2E** : Playwright pour l'interface utilisateur
- **Tests de performance** : Artillery.js pour la charge
- **Tests de sécurité** : Scan automatisé des vulnérabilités

## 📊 Monitoring

### Services de Monitoring
```bash
# Démarrer la stack de monitoring
docker-compose -f monitoring/docker-compose.monitoring.yml up -d

# Accès aux dashboards :
# Grafana : http://localhost:3001 (admin/admin)
# Prometheus : http://localhost:9090
# Alertmanager : http://localhost:9093
```

### Métriques Surveillées
- **Performance** : Temps de réponse API, throughput
- **Système** : CPU, mémoire, disque, réseau
- **Application** : Erreurs, disponibilité, latence
- **Sécurité** : Tentatives d'intrusion, authentifications
- **RGPD** : Conformité, demandes de sujets de données

## 🔧 Développement

### Structure du Projet
```
mspr/
├── rest/                    # Backend API
├── site/                    # Frontend Next.js
├── infrastructure/          # Configuration Docker/K8s
│   ├── docker/             # Dockerfiles et compose
│   ├── kubernetes/         # Manifests K8s
│   └── scripts/           # Scripts de déploiement
├── monitoring/             # Stack de monitoring
├── security/               # Politiques de sécurité
├── tests/                  # Tests automatisés
└── docs/                   # Documentation
```

### Scripts Disponibles
```bash
# Déploiement
./infrastructure/scripts/deploy.sh --cluster [us|france|switzerland]

# Sauvegarde
./infrastructure/scripts/backup.sh --cluster [cluster] --type [full|db-only]

# Restauration
./infrastructure/scripts/restore.sh --cluster [cluster] --file [backup-file]

# Génération certificats SSL
./security/certificates/generate-certs.sh --domain [domain] --cluster [cluster]
```

## 🔄 CI/CD

### Pipeline GitHub Actions
- **CI** : Tests, qualité, sécurité automatisés
- **Staging** : Déploiement automatique sur les environnements de test
- **Production** : Déploiement avec validation manuelle
- **Monitoring** : Surveillance continue post-déploiement

### Flux de Travail
1. **Push** → Tests automatiques
2. **Pull Request** → Review et validation
3. **Merge main** → Déploiement staging
4. **Tag release** → Déploiement production

## 📚 Documentation

### Guides Disponibles
- [Guide de Déploiement](docs/deployment/deployment-guide.md)
- [Architecture Système](docs/architecture/system-architecture.md)
- [Documentation API](docs/api/)
- [Politiques de Sécurité](security/policies/)
- [Conformité RGPD](security/gdpr/)

### Documentation API
- **Swagger/OpenAPI** : http://localhost:3001/docs
- **Redoc** : http://localhost:3001/redoc
- **Postman Collection** : Disponible dans `/docs/api/`

## 🛠️ Maintenance

### Sauvegardes
```bash
# Sauvegarde complète
./infrastructure/scripts/backup.sh --cluster us --type full

# Sauvegarde base de données uniquement
./infrastructure/scripts/backup.sh --cluster france --type db-only

# Lister les sauvegardes
ls -la backups/
```

### Mises à Jour
```bash
# Mise à jour des dépendances
cd rest && pnpm update
cd site && pnpm update

# Mise à jour des images Docker
docker-compose pull
docker-compose build --no-cache

# Redéploiement
./infrastructure/scripts/deploy.sh --cluster us --force-recreate
```

## 🆘 Support

### Contacts
- **Support Technique** : tech-support@mspr.example.com
- **Sécurité** : security@mspr.example.com
- **RGPD/Privacy** : privacy@mspr.example.com
- **Urgences** : +33-X-XX-XX-XX-XX

### Ressources
- **Issues GitHub** : [Créer un ticket](https://github.com/votre-org/mspr/issues)
- **Wiki** : Documentation détaillée
- **Discussions** : Forum de la communauté

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🤝 Contribution

Les contributions sont les bienvenues ! Veuillez lire notre [Guide de Contribution](CONTRIBUTING.md) avant de commencer.

### Processus de Contribution
1. Fork du projet
2. Créer une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit des changements (`git commit -m 'Ajouter nouvelle fonctionnalité'`)
4. Push vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrir une Pull Request

---

**Version du Document** : 1.0  
**Dernière Mise à Jour** : 2024-01-01  
**Maintenu par** : Équipe DevOps MSPR