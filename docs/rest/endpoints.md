---
order: 100
icon: server
---

# Endpoints de l'API REST

Cette page documente les différents endpoints disponibles dans l'API REST du projet MSPR 6.1.

## Base URL

Toutes les requêtes doivent être préfixées par l'URL de base :

```
http://localhost:3000/api
```

## Authentification

L'API ne nécessite pas d'authentification pour le moment, mais pourrait être sécurisée à l'avenir via des tokens JWT.

## Formats de réponse

Toutes les réponses sont au format JSON et suivent la structure suivante :

```json
{
    "success": true,
    "data": {
        /* Données retournées */
    },
    "error": null
}
```

En cas d'erreur :

```json
{
    "success": false,
    "data": null,
    "error": {
        "code": "ERROR_CODE",
        "message": "Description de l'erreur"
    }
}
```

## Données COVID-19

### Obtenir la liste des pays

```
GET /covid/countries
```

Retourne la liste de tous les pays pour lesquels des données COVID-19 sont disponibles.

**Exemple de réponse :**

```json
{
    "success": true,
    "data": {
        "countries": [
            "Afghanistan",
            "Albania",
            /* ... */
            "Zimbabwe"
        ]
    },
    "error": null
}
```

### Obtenir les statistiques COVID par pays

```
GET /covid/stats
```

**Paramètres :**

| Nom     | Type   | Description                            |
| ------- | ------ | -------------------------------------- |
| country | string | Nom du pays (optionnel)                |
| from    | string | Date de début (YYYY-MM-DD) (optionnel) |
| to      | string | Date de fin (YYYY-MM-DD) (optionnel)   |

**Exemple de requête :**

```
GET /covid/stats?country=France&from=2020-03-01&to=2020-04-01
```

**Exemple de réponse :**

```json
{
    "success": true,
    "data": {
        "stats": [
            {
                "date": "2020-03-01",
                "country": "France",
                "total_cases": 130,
                "new_cases": 30,
                "active_cases": 121,
                "total_deaths": 2,
                "new_deaths": 0,
                "total_recovered": 7,
                "daily_recovered": 3
            }
            /* ... autres jours ... */
        ]
    },
    "error": null
}
```

### Obtenir un résumé COVID global

```
GET /covid/summary
```

Retourne une synthèse des données COVID-19 mondiales à la date la plus récente.

**Exemple de réponse :**

```json
{
    "success": true,
    "data": {
        "lastUpdated": "2022-01-01",
        "globalStats": {
            "total_cases": 325482921,
            "new_cases": 245896,
            "active_cases": 5874213,
            "total_deaths": 5478921,
            "new_deaths": 1258,
            "total_recovered": 314129787,
            "daily_recovered": 124587
        },
        "topCountries": {
            "byCases": [
                /* Top 10 pays par nombre de cas */
            ],
            "byDeaths": [
                /* Top 10 pays par nombre de décès */
            ]
        }
    },
    "error": null
}
```

## Données MPOX

### Obtenir la liste des pays MPOX

```
GET /mpox/countries
```

Retourne la liste de tous les pays pour lesquels des données MPOX sont disponibles.

### Obtenir les statistiques MPOX par pays

```
GET /mpox/stats
```

**Paramètres :**

| Nom     | Type   | Description                            |
| ------- | ------ | -------------------------------------- |
| country | string | Nom du pays (optionnel)                |
| from    | string | Date de début (YYYY-MM-DD) (optionnel) |
| to      | string | Date de fin (YYYY-MM-DD) (optionnel)   |

**Exemple de requête :**

```
GET /mpox/stats?country=USA&from=2022-05-01&to=2022-06-01
```

**Exemple de réponse :**

```json
{
    "success": true,
    "data": {
        "stats": [
            {
                "date": "2022-05-01",
                "country": "USA",
                "total_cases": 42,
                "new_cases": 5,
                "total_deaths": 0,
                "new_deaths": 0
            }
            /* ... autres jours ... */
        ]
    },
    "error": null
}
```

## Utilitaires

### Statut de l'API

```
GET /status
```

Retourne l'état de l'API et de sa connexion à la base de données.

**Exemple de réponse :**

```json
{
    "success": true,
    "data": {
        "status": "healthy",
        "version": "1.0.0",
        "database": "connected",
        "timestamp": "2023-12-01T12:34:56Z"
    },
    "error": null
}
```

## Gestion des erreurs

| Code d'erreur  | Description                     |
| -------------- | ------------------------------- |
| INVALID_PARAMS | Paramètres de requête invalides |
| NOT_FOUND      | Ressource non trouvée           |
| DATABASE_ERROR | Erreur de base de données       |
| RATE_LIMIT     | Limite de requêtes dépassée     |
| INTERNAL_ERROR | Erreur interne du serveur       |

## Limites de requêtes

L'API est soumise à une limite de 100 requêtes par minute par adresse IP. Au-delà, les requêtes recevront une réponse 429 (Too Many Requests).
