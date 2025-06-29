---
label: API REST
icon: home
order: 100
category: API REST
---

# API de Données COVID & MPOX

Bienvenue dans la documentation officielle de l'API de données COVID-19 et MPOX. Cette API fournit un accès complet aux données épidémiques à des fins de recherche, d'analyse et de visualisation.

<!-- ![API Banner](/static/api-banner.png) -->

## Fonctionnalités de l'API

-   **Points d'accès Publics & Protégés** : Accédez aux données de base sans authentification ou utilisez les points d'accès protégés pour un accès complet
-   **Données Complètes** : Accédez aux statistiques COVID-19 et MPOX de pays du monde entier
-   **Conception RESTful** : Design d'API simple et intuitif avec des modèles cohérents
-   **Réponses JSON** : Toutes les données sont retournées dans un format JSON propre et structuré
-   **Support TypeScript** : Construit avec TypeScript pour la sécurité des types et une meilleure expérience de développement
-   **Documentation Interactive** : Interface Redoc intégrée pour tester l'API en temps réel

## Démarrage Rapide

```bash
# Installer les dépendances
pnpm install

# Configurer les variables d'environnement
# Créer un fichier .env et copier le contenu de .env.example
# Remplir les valeurs des variables d'environnement

# Démarrer le serveur de développement
pnpm run dev

# Ou construire pour la production
pnpm run build
pnpm start
```

## Aperçu de l'API

| Catégorie    | Points d'accès Publics | Points d'accès Protégés | Total  |
| ------------ | ---------------------- | ----------------------- | ------ |
| COVID-19     | 3 endpoints            | 4 endpoints             | 7      |
| MPOX         | 1 endpoint             | 4 endpoints             | 5      |
| Statistiques | —                      | 1 endpoint              | 1      |
| **Total**    | **4 endpoints**        | **9 endpoints**         | **13** |

## Modèles de Données

### Données COVID-19

-   **Champs disponibles** : date, pays, total_cases (BigInt), new_cases (Float), total_deaths (BigInt), new_deaths (Float)
-   **Caractéristique** : Utilise des types Float pour new_cases et new_deaths pour permettre des moyennes
-   **Limitation** : Pas de données de guérison (total_recovered, daily_recovered) ou de cas actifs

### Données MPOX

-   **Champs disponibles** : date, pays, total_cases (BigInt), new_cases (BigInt), total_deaths (BigInt), new_deaths (BigInt)
-   **Caractéristique** : Tous les champs numériques sont des entiers (BigInt)
-   **Couverture** : Moins de pays que COVID, données plus récentes

## Sections de la Documentation

-   **[Pour Commencer](/rest/getting-started/installation.md)** - Installation et configuration de base
-   **[Authentification](/rest/getting-started/authentication.md)** - Comment s'authentifier avec l'API
-   **[Référence API](/rest/api/overview.md)** - Documentation détaillée des points d'accès API
    -   [Points d'accès COVID](/rest/api/covid.md) - Gestion des données COVID-19
    -   [Points d'accès MPOX](/rest/api/mpox.md) - Gestion des données MPOX
    -   [Statistiques](/rest/api/statistics.md) - Agrégations et résumés
-   **[Guides](/rest/guides/using-the-api.md)** - Exemples pratiques d'utilisation

## URLs importantes

-   **API de base** : `https://api.yourdomain.com/api`
-   **Documentation interactive** : `https://api.yourdomain.com/api/docs`
-   **Spécification OpenAPI** : `https://api.yourdomain.com/api/docs/openapi.json`

## Exemple d'Utilisation Rapide

### Données Publiques (sans authentification)

```javascript
// Obtenir les dernières données COVID
const response = await fetch(
    "https://api.yourdomain.com/api/covid/public/latest"
);
const covidData = await response.json();
console.log(`Dernières données: ${covidData.length} entrées`);
```

### Données Protégées (avec token)

```javascript
// Obtenir les statistiques globales
const response = await fetch("https://api.yourdomain.com/api/stats/summary", {
    headers: {
        Authorization: "Bearer your-api-token",
    },
});
const stats = await response.json();
console.log(
    `COVID: ${stats.covid.total_cases} cas, MPOX: ${stats.mpox.total_cases} cas`
);
```

## Mise à Jour de la Documentation

Cette documentation a été mise à jour pour refléter l'implémentation actuelle de l'API (v1.0.0). Les principales corrections incluent :

-   ✅ **Modèles de données corrigés** : Suppression des champs non-implémentés
-   ✅ **Types de données précis** : BigInt vs Float selon l'implémentation réelle
-   ✅ **Exemples actualisés** : Réponses JSON conformes à l'API actuelle
-   ✅ **Documentation en français** : Traduction complète et cohérente
-   ✅ **Spécification OpenAPI** : Swagger mis à jour avec les bons schémas

## Support & Retour d'expérience

-   **[Issues GitHub](https://github.com/yourusername/covid-mpox-api/issues)** - Signaler des bugs ou demander des fonctionnalités
-   **[Support par Email](mailto:api-support@yourdomain.com)** - Assistance technique directe
-   **[Documentation Interactive](https://api.yourdomain.com/api/docs)** - Tester l'API en temps réel
