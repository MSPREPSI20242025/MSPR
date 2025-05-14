---
order: 1000
icon: home
---

# MSPR 6.1 - API de données COVID-19 et MPOX

Bienvenue dans la documentation du projet MSPR 6.1, une API fournissant des données sur les épidémies de COVID-19 et MPOX (Monkeypox).

## À propos du projet

Ce projet fournit une API REST permettant d'accéder à des données épidémiologiques structurées concernant la COVID-19 et MPOX. Les données sont extraites de sources fiables, traitées et standardisées pour faciliter leur utilisation.

## Fonctionnalités principales

-   **Collecte automatisée de données** : Téléchargement et extraction des jeux de données depuis Kaggle
-   **Traitement et standardisation** : Normalisation des formats de données pour une utilisation cohérente
-   **API REST** : Points d'accès pour consulter les données via une API moderne
-   **Base de données PostgreSQL** : Stockage structuré des informations traitées

## Architecture technique

Le projet est divisé en deux parties principales :

1. **Traitement des données (Python)**

    - Téléchargement des données (`fetch.py`)
    - Traitement et standardisation (`main.py`)
    - Import dans PostgreSQL (`postgress.py`)

2. **API REST (Node.js/TypeScript)**
    - Framework Express.js
    - ORM Prisma pour les interactions avec la base de données
    - Documentation automatique des endpoints

## Installation et déploiement

### Prérequis

-   Python 3.x
-   Node.js et pnpm
-   PostgreSQL

### Installation du traitement de données

```bash
# Installation des dépendances Python
pip install -r requirements.txt

# Téléchargement des données
python fetch.py

# Traitement des données
python main.py

# Import dans PostgreSQL (nécessite une configuration .env)
python postgress.py
```

### Installation de l'API REST

```bash
# Dans le dossier rest/
pnpm install

# Démarrage en développement
pnpm dev

# Compilation et démarrage en production
pnpm build
pnpm start
```

## Jeux de données

Ce projet utilise trois jeux de données principaux :

-   **COVID-19 Global Dataset** : Données quotidiennes mondiales sur la COVID-19
-   **Corona Virus Report** : Rapports détaillés sur le coronavirus
-   **MPOX (Monkeypox) Data** : Données sur l'épidémie de variole du singe

Toutes les données sont standardisées selon un format commun incluant : date, pays, cas totaux, nouveaux cas, cas actifs, décès totaux, nouveaux décès, etc.

## Documentation de l'API

Pour plus d'informations sur les endpoints disponibles et leur utilisation, consultez la [documentation de l'API REST](/rest/api-docs).
