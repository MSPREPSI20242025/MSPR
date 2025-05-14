---
order: 200
icon: download
---

# Guide d'installation

Ce guide vous aidera à installer et configurer l'ensemble du projet MSPR 6.1, incluant à la fois le traitement des données et l'API REST.

## Configuration requise

Avant de commencer, assurez-vous que votre environnement dispose des éléments suivants :

-   Python 3.8 ou supérieur
-   Node.js 18 ou supérieur
-   pnpm (gestionnaire de paquets JavaScript)
-   PostgreSQL 13 ou supérieur
-   Compte Kaggle et API key (pour le téléchargement des datasets)

## Installation du backend Python

### 1. Cloner le dépôt

```bash
git clone https://github.com/ghoostyy/mspr61
cd mspr61
```

### 2. Configurer l'environnement Python

```bash
# Installer les dépendances
pip install -r requirements.txt
```

### 3. Configurer les identifiants Kaggle

Pour télécharger les datasets de Kaggle, vous devez configurer votre API key Kaggle.
Créez un fichier `.env` à la racine du projet avec les informations suivantes :

```
KAGGLE_USERNAME=votre_nom_utilisateur
KAGGLE_KEY=votre_api_key
```

### 4. Configurer la connexion PostgreSQL

Dans le même fichier `.env`, ajoutez les informations de connexion à votre base de données :

```
DB_NAME=nom_de_votre_bdd
DB_USER=utilisateur_postgres
DB_PASSWORD=mot_de_passe
DB_HOST=localhost
DB_PORT=5432
```

## Installation de l'API REST

### 1. Naviguer vers le dossier REST

```bash
cd rest
```

### 2. Installer les dépendances

```bash
pnpm install
```

### 3. Configurer Prisma

Assurez-vous que le fichier `.env` dans le dossier `rest` contient la chaîne de connexion à votre base de données :

```
DATABASE_URL="postgresql://utilisateur:mot_de_passe@localhost:5432/nom_de_votre_bdd"
```

### 4. Générer les clients Prisma

```bash
npx prisma generate
```

## Exécution du projet

### 1. Téléchargement et traitement des données

```bash
# À la racine du projet
python fetch.py  # Télécharge les datasets depuis Kaggle
python main.py   # Traite et standardise les données
python postgress.py  # Importe les données dans PostgreSQL
```

### 2. Démarrage de l'API REST

```bash
# Dans le dossier rest/
pnpm dev  # Mode développement
# ou
pnpm build && pnpm start  # Mode production
```

L'API sera disponible à l'adresse `http://localhost:4455` (port par défaut).

## Vérification de l'installation

Pour vérifier que tout fonctionne correctement, vous pouvez accéder à :

-   Documentation de l'API : `http://localhost:4455/api/docs`
-   Endpoint de statut : `http://localhost:4455/`

## Dépannage

### Problèmes courants

1. **Erreur de connexion à PostgreSQL**

    - Vérifiez que votre serveur PostgreSQL est en cours d'exécution
    - Confirmez les identifiants dans le fichier `.env`

2. **Erreur lors du téléchargement des données Kaggle**

    - Vérifiez vos identifiants Kaggle
    - Assurez-vous d'avoir accepté les règles des datasets sur le site Kaggle

3. **Erreurs Prisma**
    - Exécutez `npx prisma db push` pour synchroniser votre schéma
    - Vérifiez la chaîne de connexion dans le fichier `.env`
