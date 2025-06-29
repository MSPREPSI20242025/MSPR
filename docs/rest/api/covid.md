---
label: Points d'Accès COVID
icon: virus
order: 200
category: API REST
---

# Points d'Accès des Données COVID-19

## Points d'Accès Publics

Ces points d'accès peuvent être consultés sans authentification.

### Obtenir les Dernières Données COVID

Retourne les entrées de données COVID les plus récentes (limité à 10 enregistrements).

```
GET /covid/public/latest
```

#### Réponse

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

### Obtenir les Données COVID par Pays

Retourne les données COVID pour un pays spécifique (limité aux 30 derniers jours).

```
GET /covid/public/country/:country
```

#### Paramètres

| Nom     | Dans | Type   | Requis | Description |
| ------- | ---- | ------ | ------ | ----------- |
| country | path | string | Oui    | Nom du pays |

#### Exemple

```
GET /covid/public/country/United%20States
```

#### Réponse

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

### Obtenir les Totaux Mondiaux COVID

Retourne les totaux mondiaux COVID des données les plus récentes.

```
GET /covid/public/totals
```

#### Réponse

```json
{
    "total_cases": 128963254,
    "total_deaths": 2819892
}
```

## Points d'Accès Protégés

Ces points d'accès nécessitent une authentification.

### Obtenir Toutes les Données COVID

Retourne les données COVID avec filtrage optionnel par pays.

```
GET /covid/data
```

#### Paramètres

| Nom     | Dans  | Type    | Requis | Description                                                     |
| ------- | ----- | ------- | ------ | --------------------------------------------------------------- |
| country | query | string  | Non    | Filtrer par nom de pays                                         |
| limit   | query | integer | Non    | Nombre maximum d'enregistrements à retourner (par défaut : 100) |

#### Exemple

```
GET /covid/data?country=Spain&limit=10
```

#### Réponse

```json
[
    {
        "id": 42,
        "date": "2023-03-15",
        "country": "Spain",
        "total_cases": 3247738,
        "new_cases": 4838.2,
        "total_deaths": 75783,
        "new_deaths": 35.0
    }
    // Enregistrements supplémentaires...
]
```

### Ajouter de Nouvelles Données COVID

Crée une nouvelle entrée de données COVID.

```
POST /covid/data
```

#### Corps de la Requête

```json
{
    "date": "2023-03-16",
    "country": "United States",
    "total_cases": 32638938,
    "new_cases": 58480,
    "total_deaths": 582699,
    "new_deaths": 585
}
```

#### Réponse

```json
{
    "success": true,
    "message": "Données ajoutées avec succès"
}
```

### Mettre à Jour les Données COVID

Met à jour une entrée de données COVID existante par ID.

```
PUT /covid/data/:id
```

#### Paramètres

| Nom | Dans | Type    | Requis | Description                     |
| --- | ---- | ------- | ------ | ------------------------------- |
| id  | path | integer | Oui    | ID de l'entrée de données COVID |

#### Corps de la Requête

```json
{
    "date": "2023-03-16",
    "country": "United States",
    "total_cases": 32638938,
    "new_cases": 58480,
    "total_deaths": 582699,
    "new_deaths": 585
}
```

#### Réponse

```json
{
    "success": true,
    "message": "Données mises à jour avec succès"
}
```

### Supprimer les Données COVID

Supprime une entrée de données COVID par ID.

```
DELETE /covid/data/:id
```

#### Paramètres

| Nom | Dans | Type    | Requis | Description                     |
| --- | ---- | ------- | ------ | ------------------------------- |
| id  | path | integer | Oui    | ID de l'entrée de données COVID |

#### Réponse

```json
{
    "success": true,
    "message": "Données supprimées avec succès"
}
```

## Modèle de Données

### Modèle de Données COVID

```typescript
interface CovidData {
    id: number; // Identifiant unique (mappé depuis index en base)
    date: string; // Date au format AAAA-MM-JJ
    country: string; // Nom du pays
    total_cases: number; // Total des cas confirmés (BigInt)
    new_cases: number; // Nouveaux cas pour cette date (Float)
    total_deaths: number; // Total des décès (BigInt)
    new_deaths: number; // Nouveaux décès pour cette date (Float)
}
```

## Notes sur les Données COVID

### Types de Données

-   **total_cases** et **total_deaths** : Valeurs entières importantes (BigInt en base de données)
-   **new_cases** et **new_deaths** : Valeurs décimales (Float en base de données) pour permettre des moyennes ou des estimations

### Différences avec la Documentation Précédente

Cette API ne contient **pas** les champs suivants qui pourraient exister dans d'autres APIs COVID :

-   `active_cases` - Cas actifs
-   `total_recovered` - Total des guérisons
-   `daily_recovered` - Guérisons journalières

Ces champs ne sont pas disponibles dans le schéma de base de données actuel. Si vous avez besoin de ces données, contactez l'équipe de développement pour discuter d'une extension de l'API.

### Utilisation Recommandée

Pour calculer des métriques dérivées :

-   **Taux de mortalité** : `total_deaths / total_cases * 100`
-   **Tendances** : Comparer `new_cases` et `new_deaths` sur plusieurs dates

Exemple d'usage en JavaScript :

```javascript
// Récupérer les données COVID pour un pays
async function getCovidTrends(country) {
    const response = await fetch(
        `/api/covid/public/country/${encodeURIComponent(country)}`
    );
    const data = await response.json();

    // Calculer la tendance sur 7 jours
    const last7Days = data.slice(0, 7);
    const avgNewCases =
        last7Days.reduce((sum, day) => sum + day.new_cases, 0) / 7;

    return {
        country,
        recent_avg_cases: Math.round(avgNewCases * 100) / 100,
        latest_total: data[0].total_cases,
        mortality_rate: (
            (data[0].total_deaths / data[0].total_cases) *
            100
        ).toFixed(2),
    };
}
```
