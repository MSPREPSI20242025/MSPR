# Guide de Tests MSPR

## Aperçu
Ce guide fournit des instructions complètes pour tester l'implémentation DevOps MSPR sur les trois clusters : États-Unis, France et Suisse.

## 🚀 **Tests de Démarrage Rapide**

### 1. **Tests de Développement Local**
```bash
# Cloner et configurer
git clone <votre-depot>
cd mspr

# Copier le modèle d'environnement
cp .env.example .env

# Démarrer la stack complète
docker-compose -f infrastructure/docker/docker-compose.yml up -d

# Vérifier que tous les services fonctionnent
docker-compose -f infrastructure/docker/docker-compose.yml ps

# Tester la santé de l'API
curl http://localhost:3001/health

# Tester le frontend
curl http://localhost:3000/
```

### 2. **Tests de Fonctionnalité de Base**
```bash
# Tester la connectivité base de données
docker-compose exec backend pnpm dlx prisma db ping

# Exécuter les migrations de base de données
docker-compose exec backend pnpm dlx prisma migrate deploy

# Tester les endpoints API
curl -H "Authorization: Bearer test-token" http://localhost:3001/api/covid
curl -H "Authorization: Bearer test-token" http://localhost:3001/api/mpox
```

## 🧪 **Suite de Tests Automatisés**

### 3. **Tests Unitaires**
```bash
# Installer les dépendances
cd rest && pnpm install
cd ../site && pnpm install

# Exécuter les tests backend
cd rest && pnpm test

# Exécuter les tests frontend
cd site && pnpm test

# Exécuter avec couverture
pnpm test:coverage
```

### 4. **Tests d'Intégration**
```bash
# Démarrer la base de données de test
docker run -d --name test-postgres \
  -e POSTGRES_USER=test_user \
  -e POSTGRES_PASSWORD=test_password \
  -e POSTGRES_DB=test_db \
  -p 5432:5432 postgres:16-alpine

# Exécuter les tests d'intégration
npm run test:integration

# Nettoyer
docker stop test-postgres && docker rm test-postgres
```

### 5. **Tests End-to-End**
```bash
# Installer Playwright
npx playwright install

# Exécuter les tests e2e
npm run test:e2e

# Exécuter avec interface utilisateur
npx playwright test --ui

# Générer le rapport de test
npx playwright show-report
```

## 🌍 **Tests Spécifiques par Cluster**

### 6. **Tests du Cluster États-Unis**
```bash
# Déployer le cluster US
./infrastructure/scripts/deploy.sh --cluster us --environment development

# Tester les fonctionnalités haute performance
curl -H "Authorization: Bearer $API_TOKEN" \
  http://localhost:3002/api/technical/raw-data

# Tester l'optimisation des performances
ab -n 1000 -c 10 http://localhost:3001/api/covid
```

### 7. **Tests du Cluster France (RGPD)**
```bash
# Déployer le cluster France
./infrastructure/scripts/deploy.sh --cluster france --environment development

# Tester les endpoints RGPD
curl http://localhost:3001/api/privacy/policy
curl http://localhost:3001/api/privacy/consent

# Tester la conformité de rétention des données
curl -X POST http://localhost:3001/api/privacy/erasure \
  -H "Content-Type: application/json" \
  -d '{"userId": "test-user", "reason": "withdrawal"}'

# Vérifier la localisation française
curl http://localhost:3000/?lang=fr
```

### 8. **Tests du Cluster Suisse (Multilingue)**
```bash
# Déployer le cluster Suisse
./infrastructure/scripts/deploy.sh --cluster switzerland --environment development

# Tester le support multilingue
curl http://localhost:3000/?lang=fr
curl http://localhost:3000/?lang=de  
curl http://localhost:3000/?lang=it

# Vérifier l'ensemble de fonctionnalités minimal (pas d'ETL, pas de DataViz)
curl http://localhost:3001/api/features  # Devrait montrer des fonctionnalités limitées
```

## 🔒 **Tests de Sécurité**

### 9. **Scan de Sécurité**
```bash
# Exécuter le scan de vulnérabilités
docker run --rm -v $(pwd):/app aquasec/trivy fs /app

# Linting de sécurité
npm run lint:security

# Audit des dépendances
cd rest && pnpm audit
cd site && pnpm audit
```

### 10. **Tests d'Authentification**
```bash
# Tester sans token (devrait échouer)
curl http://localhost:3001/api/covid

# Tester avec token invalide (devrait échouer)
curl -H "Authorization: Bearer invalid-token" \
  http://localhost:3001/api/covid

# Tester avec token valide (devrait réussir)
curl -H "Authorization: Bearer $API_TOKEN" \
  http://localhost:3001/api/covid
```

## 📊 **Tests de Performance**

### 11. **Tests de Charge**
```bash
# Installer Artillery
npm install -g artillery

# Exécuter les tests de charge
artillery run tests/performance/load-test.js

# Surveiller pendant le test de charge
docker stats
```

### 12. **Performance Base de Données**
```bash
# Tester les performances de la base de données
docker-compose exec postgres psql -U mspr_user -d mspr -c "
SELECT query, mean_time, calls, total_time 
FROM pg_stat_statements 
ORDER BY total_time DESC 
LIMIT 10;"
```

## 🔄 **Tests du Pipeline CI/CD**

### 13. **Tests GitHub Actions**
```bash
# Déclencher CI manuellement
gh workflow run ci.yml

# Vérifier le statut du workflow
gh run list --workflow=ci.yml

# Voir une exécution spécifique
gh run view [RUN_ID]

# Tester le déploiement staging
gh workflow run deploy-staging.yml -f cluster=us
```

### 14. **Tests de Construction Docker**
```bash
# Construire toutes les images
docker-compose -f infrastructure/docker/docker-compose.yml build

# Tester les vulnérabilités des images
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image mspr-backend:latest

# Tester le démarrage du conteneur
docker run --rm mspr-backend:latest --version
```

## 📈 **Tests de Monitoring**

### 15. **Démarrer la Stack de Monitoring**
```bash
# Démarrer les services de monitoring
docker-compose -f monitoring/docker-compose.monitoring.yml up -d

# Accéder à Grafana
open http://localhost:3001  # admin/admin

# Accéder à Prometheus
open http://localhost:9090

# Tester les alertes
curl -X POST http://localhost:9093/api/v1/alerts
```

### 16. **Validation des Métriques**
```bash
# Vérifier les cibles Prometheus
curl http://localhost:9090/api/v1/targets

# Tester les métriques personnalisées
curl http://localhost:3001/metrics
curl http://localhost:3000/api/metrics

# Vérifier les règles d'alerte
curl http://localhost:9090/api/v1/rules
```

## 🏗️ **Tests d'Infrastructure**

### 17. **Tests Kubernetes** (si utilisation de K8s)
```bash
# Appliquer les manifests Kubernetes
kubectl apply -f infrastructure/kubernetes/

# Vérifier le statut des pods
kubectl get pods -n mspr-us
kubectl get pods -n mspr-france  
kubectl get pods -n mspr-switzerland

# Tester la connectivité des services
kubectl port-forward svc/mspr-backend-us 3001:3001 -n mspr-us
curl http://localhost:3001/health
```

### 18. **Tests de Sauvegarde et Restauration**
```bash
# Créer une sauvegarde
./infrastructure/scripts/backup.sh --cluster us --type full

# Lister les sauvegardes
ls -la backups/

# Tester la restauration (utiliser un environnement de test !)
./infrastructure/scripts/restore.sh \
  --cluster us \
  --file mspr_us_full_20240101_120000 \
  --type full
```

## 🔧 **Tests de Qualité**

### 19. **Qualité du Code avec SonarQube**
```bash
# Démarrer SonarQube
docker-compose -f monitoring/docker-compose.monitoring.yml up -d sonarqube

# Exécuter l'analyse
npm run sonar:scan

# Voir les résultats
open http://localhost:9000
```

### 20. **Tests SSL/TLS**
```bash
# Générer les certificats de test
./security/certificates/generate-certs.sh \
  --domain localhost \
  --cluster us \
  --environment development

# Tester la configuration SSL
openssl s_client -connect localhost:443 -servername localhost

# Vérifier l'expiration du certificat
openssl x509 -in security/certificates/us/development/cert.crt \
  -text -noout | grep "Not After"
```

## 🎯 **Suite de Tests Complète**

### 21. **Exécuter Tous les Tests**
```bash
# Créer un script de test complet
cat > executer-tous-tests.sh << 'EOF'
#!/bin/bash
set -e

echo "🚀 Démarrage des tests complets MSPR..."

# 1. Tests unitaires
echo "📝 Exécution des tests unitaires..."
cd rest && pnpm test && cd ..
cd site && pnpm test && cd ..

# 2. Tests d'intégration
echo "🔗 Exécution des tests d'intégration..."
npm run test:integration

# 3. Tests de sécurité
echo "🔒 Exécution des tests de sécurité..."
npm run security:scan

# 4. Tests de performance
echo "⚡ Exécution des tests de performance..."
npm run test:load

# 5. Tests E2E
echo "🎭 Exécution des tests e2e..."
npm run test:e2e

echo "✅ Tous les tests terminés avec succès !"
EOF

chmod +x executer-tous-tests.sh
./executer-tous-tests.sh
```

## 📋 **Liste de Vérification des Tests**

Utilisez cette liste pour vérifier vos tests :

### **✅ Fonctionnalité de Base**
- [ ] Tous les services démarrent avec succès
- [ ] Les connexions base de données fonctionnent
- [ ] Les endpoints API répondent correctement
- [ ] Le frontend se charge et affiche les données
- [ ] L'authentification fonctionne correctement

### **✅ Fonctionnalités Spécifiques par Cluster**
- [ ] US : API Technique accessible
- [ ] US : Mode haute performance actif
- [ ] France : Endpoints RGPD fonctionnels
- [ ] France : Rétention des données fonctionnelle
- [ ] Suisse : Support multilingue
- [ ] Suisse : Fonctionnalités minimales uniquement

### **✅ Sécurité et Conformité**
- [ ] Aucune vulnérabilité critique
- [ ] Authentification requise pour les endpoints protégés
- [ ] Conformité RGPD vérifiée (France)
- [ ] Certificats SSL/TLS valides
- [ ] Headers de sécurité présents

### **✅ Performance et Fiabilité**
- [ ] Tests de charge réussis
- [ ] Temps de réponse dans les limites
- [ ] Aucune fuite mémoire
- [ ] Sauvegarde/restauration fonctionne
- [ ] Monitoring actif

### **✅ Pipeline CI/CD**
- [ ] Toutes les GitHub Actions réussissent
- [ ] Constructions Docker réussies
- [ ] Déploiements fonctionnent
- [ ] Rollbacks fonctionnels

## 🆘 **Dépannage des Problèmes de Tests**

Si les tests échouent, vérifiez :

1. **Dépendances des Services** : Assurez-vous que tous les services requis fonctionnent
2. **Variables d'Environnement** : Vérifiez que toutes les variables env requises sont définies
3. **Connectivité Réseau** : Vérifiez si les services peuvent communiquer
4. **Limites de Ressources** : Assurez-vous d'avoir suffisamment de CPU/mémoire disponible
5. **Fichiers de Log** : Vérifiez les logs des conteneurs pour les erreurs

```bash
# Commandes de débogage
docker-compose logs -f [nom_service]
docker ps -a
docker system df
kubectl describe pod [nom-pod] -n [namespace]
```

Cette approche de test complète garantit que votre implémentation MSPR est prête pour la production sur les trois clusters avec des caractéristiques appropriées de sécurité, conformité et performance.