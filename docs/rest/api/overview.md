---
label: Vue d'ensemble
icon: checklist
order: 100
category: API REST
---

# Vue d'ensemble de l'API

L'API de données COVID et MPOX fournit un ensemble de points d'accès pour accéder et gérer les données épidémiques. L'API est divisée en points d'accès publics accessibles sans authentification et en points d'accès protégés nécessitant un jeton bearer.

## URL de Base

Tous les points d'accès de l'API sont relatifs à l'URL de base :

```
https://api.yourdomain.com/api
```

## Authentification

Les points d'accès protégés nécessitent une authentification à l'aide d'un jeton bearer dans l'en-tête Authorization :

```http
Authorization: Bearer your-api-token
```

Consultez le [Guide d'Authentification](/rest/getting-started/authentication.md) pour plus de détails.

## Format des Réponses

Toutes les réponses de l'API sont retournées au format JSON. La structure de base dépend du type de requête :

### Réponses de Succès

Les opérations réussies de récupération de données retournent soit un objet unique, soit un tableau d'objets :

```json
[
    {
        "id": 1,
        "date": "2023-03-15",
        "country": "United States",
        "total_cases": 32580458,
        "new_cases": 58480.5,
        "total_deaths": 582114,
        "new_deaths": 585.0
    }
    // Enregistrements supplémentaires...
]
```

Les opérations d'écriture réussies retournent un message de succès :

```json
{
    "success": true,
    "message": "Données ajoutées avec succès"
}
```

### Réponses d'Erreur

Les réponses d'erreur incluent un message d'erreur :

```json
{
    "error": "Accès refusé. Aucun jeton fourni."
}
```

## Codes d'État HTTP

L'API utilise les codes d'état HTTP standards :

| Code | Description               |
| ---- | ------------------------- |
| 200  | Succès (GET, PUT, DELETE) |
| 201  | Créé (POST)               |
| 400  | Requête Incorrecte        |
| 401  | Non Autorisé              |
| 404  | Non Trouvé                |
| 500  | Erreur Serveur            |

## Catégories de l'API

### Points d'Accès Publics

Les points d'accès publics sont accessibles sans authentification :

| Point d'Accès                                                                  | Méthode | Description                         |
| ------------------------------------------------------------------------------ | ------- | ----------------------------------- |
| [/covid/public/latest](/rest/api/covid.md#get-latest-covid-data)               | GET     | Obtenir les dernières données COVID |
| [/covid/public/country/:country](/rest/api/covid.md#get-covid-data-by-country) | GET     | Obtenir les données COVID par pays  |
| [/covid/public/totals](/rest/api/covid.md#get-covid-global-totals)             | GET     | Obtenir les totaux mondiaux COVID   |
| [/mpox/public/summary](/rest/api/mpox.md#get-mpox-summary-by-country)          | GET     | Obtenir le résumé MPOX par pays     |

### Points d'Accès Protégés

Les points d'accès protégés nécessitent une authentification :

| Point d'Accès                                                    | Méthode | Description                        |
| ---------------------------------------------------------------- | ------- | ---------------------------------- |
| [/covid/data](/rest/api/covid.md#get-all-covid-data)             | GET     | Obtenir toutes les données COVID   |
| [/covid/data](/rest/api/covid.md#add-new-covid-data)             | POST    | Ajouter de nouvelles données COVID |
| [/covid/data/:id](/rest/api/covid.md#update-covid-data)          | PUT     | Mettre à jour les données COVID    |
| [/covid/data/:id](/rest/api/covid.md#delete-covid-data)          | DELETE  | Supprimer les données COVID        |
| [/mpox/data](/rest/api/mpox.md#get-all-mpox-data)                | GET     | Obtenir toutes les données MPOX    |
| [/mpox/data](/rest/api/mpox.md#add-new-mpox-data)                | POST    | Ajouter de nouvelles données MPOX  |
| [/mpox/data/:id](/rest/api/mpox.md#update-mpox-data)             | PUT     | Mettre à jour les données MPOX     |
| [/mpox/data/:id](/rest/api/mpox.md#delete-mpox-data)             | DELETE  | Supprimer les données MPOX         |
| [/stats/summary](/rest/api/statistics.md#get-statistics-summary) | GET     | Obtenir le résumé des statistiques |

## Modèles de Données

### Modèle CovidData

```typescript
interface CovidData {
    id: number; // Identifiant unique (mappé depuis index en base)
    date: string; // Date de l'enregistrement
    country: string; // Nom du pays
    total_cases: number; // Total des cas confirmés (BigInt)
    new_cases: number; // Nouveaux cas (Float)
    total_deaths: number; // Total des décès (BigInt)
    new_deaths: number; // Nouveaux décès (Float)
}
```

### Modèle MpoxData

```typescript
interface MpoxData {
    id: number; // Identifiant unique (mappé depuis index en base)
    date: string; // Date de l'enregistrement
    country: string; // Nom du pays
    total_cases: number; // Total des cas confirmés (BigInt)
    new_cases: number; // Nouveaux cas (BigInt)
    total_deaths: number; // Total des décès (BigInt)
    new_deaths: number; // Nouveaux décès (BigInt)
}
```

## Documentation Interactive

Pour une référence API entièrement interactive, utilisez notre [API Playground](https://api.yourdomain.com/api/docs) propulsé par Redoc.
