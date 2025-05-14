---
label: Installation
icon: download
order: 100
category: API REST
---

# Guide d'Installation

Ce guide vous guidera à travers le processus de configuration de l'API de données COVID et MPOX sur votre environnement local.

## Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- Node.js (v14 ou supérieur)
- npm (v6 ou supérieur)
- PostgreSQL (v12 ou supérieur)
- Git

## Étapes d'Installation

### 1. Cloner le Dépôt

```bash
git clone https://github.com/yourusername/covid-mpox-api.git
cd covid-mpox-api
```

### 2. Installer les Dépendances

```bash
npm install
```

### 3. Configurer les Variables d'Environnement

Créez un fichier `.env` à la racine du projet avec les variables suivantes :

```
DATABASE_URL="postgresql://username:password@localhost:5432/your_database"
API_TOKEN="your-super-secure-api-token"
PORT=3000
```

Remplacez `username`, `password`, `your_database`, et `your-super-secure-api-token` par vos valeurs spécifiques.

### 4. Configurer la Base de Données

Créez une base de données PostgreSQL avec le nom que vous avez spécifié dans DATABASE_URL :

```bash
createdb your_database
```

Puis exécutez les migrations Prisma pour configurer le schéma :

```bash
npx prisma migrate dev --name init
```

### 5. Compiler le Projet

```bash
npm run build
```

### 6. Démarrer le Serveur

Pour le développement :

```bash
npm run dev
```

Pour la production :

```bash
npm start
```

Le serveur API démarrera sur `http://localhost:3000` (ou le port que vous avez spécifié dans le fichier .env).

## Vérifier l'Installation

Pour vérifier que l'API fonctionne correctement, faites une requête vers un point d'accès public :

```bash
curl http://localhost:3000/api/covid/public/latest
```

Vous devriez recevoir une réponse JSON avec les données COVID.

<!-- ## Installation Docker (Alternative)

Si vous préférez utiliser Docker, vous pouvez utiliser les commandes suivantes :

```bash
# Construire l'image Docker
docker build -t covid-mpox-api .

# Exécuter le conteneur
docker run -p 3000:3000 --env-file .env covid-mpox-api
``` -->

## Dépannage

### Problèmes de Connexion à la Base de Données

Si vous rencontrez des problèmes de connexion à la base de données :

1. Vérifiez que votre serveur PostgreSQL est en cours d'exécution
2. Vérifiez l'URL de la base de données dans votre fichier .env
3. Assurez-vous que votre utilisateur PostgreSQL a les permissions nécessaires

### Port Déjà Utilisé

Si le port est déjà utilisé :

1. Changez la valeur du PORT dans votre fichier .env
2. Arrêtez tout autre service utilisant le même port

## Prochaines Étapes

- [En savoir plus sur l'authentification](/rest/getting-started/authentication.md)
- [Explorer la référence API](/rest/api/overview.md)