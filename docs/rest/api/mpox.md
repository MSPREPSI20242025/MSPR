---
label: Points d'Accès MPOX
icon: shield
order: 300
category: API REST
---

# Points d'Accès des Données MPOX

## Points d'Accès Publics

Ces points d'accès peuvent être consultés sans authentification.

### Obtenir le Résumé MPOX par Pays

Retourne les données de résumé MPOX groupées par pays (top 5 des pays par nombre de cas).

```
GET /mpox/public/summary
```

#### Réponse

```json
[
    {
        "country": "United States",
        "latest_cases": 28995
    },
    {
        "country": "Brazil",
        "latest_cases": 10117
    },
    {
        "country": "Spain",
        "latest_cases": 7520
    },
    {
        "country": "France",
        "latest_cases": 4043
    },
    {
        "country": "Colombia",
        "latest_cases": 3859
    }
]
```

## Points d'Accès Protégés

Ces points d'accès nécessitent une authentification.

### Obtenir Toutes les Données MPOX

Retourne les données MPOX avec filtrage optionnel par pays.

```
GET /mpox/data
```

#### Paramètres

| Nom     | Dans  | Type    | Requis | Description                                                     |
| ------- | ----- | ------- | ------ | --------------------------------------------------------------- |
| country | query | string  | Non    | Filtrer par nom de pays                                         |
| limit   | query | integer | Non    | Nombre maximum d'enregistrements à retourner (par défaut : 100) |

#### Exemple

```
GET /mpox/data?country=United%20States&limit=10
```

#### Réponse

```json
[
    {
        "id": 1,
        "date": "2022-05-01",
        "country": "United States",
        "total_cases": 28995,
        "new_cases": 12,
        "total_deaths": 8,
        "new_deaths": 0
    }
    // Autres enregistrements...
]
```

### Ajouter de Nouvelles Données MPOX

Crée une nouvelle entrée de données MPOX.

```
POST /mpox/data
```

#### Corps de la Requête

```json
{
    "date": "2022-05-01",
    "country": "United States",
    "total_cases": 43,
    "new_cases": 12,
    "total_deaths": 2,
    "new_deaths": 0
}
```

#### Réponse

```json
{
    "success": true,
    "message": "Données ajoutées avec succès"
}
```

### Mettre à Jour les Données MPOX

Met à jour une entrée de données MPOX existante par ID.

```
PUT /mpox/data/:id
```

#### Paramètres

| Nom | Dans | Type    | Requis | Description                    |
| --- | ---- | ------- | ------ | ------------------------------ |
| id  | path | integer | Oui    | ID de l'entrée de données MPOX |

#### Corps de la Requête

```json
{
    "date": "2022-05-01",
    "country": "United States",
    "total_cases": 43,
    "new_cases": 12,
    "total_deaths": 2,
    "new_deaths": 0
}
```

#### Réponse

```json
{
    "success": true,
    "message": "Données mises à jour avec succès"
}
```

### Supprimer les Données MPOX

Supprime une entrée de données MPOX par ID.

```
DELETE /mpox/data/:id
```

#### Paramètres

| Nom | Dans | Type    | Requis | Description                    |
| --- | ---- | ------- | ------ | ------------------------------ |
| id  | path | integer | Oui    | ID de l'entrée de données MPOX |

#### Réponse

```json
{
    "success": true,
    "message": "Données supprimées avec succès"
}
```

## Modèle de Données

### Modèle de Données MPOX

```typescript
interface MpoxData {
    id: number; // Identifiant unique (mappé depuis index en base)
    date: string; // Date au format AAAA-MM-JJ
    country: string; // Nom du pays
    total_cases: number; // Total des cas confirmés (BigInt)
    new_cases: number; // Nouveaux cas pour cette date (BigInt)
    total_deaths: number; // Total des décès (BigInt)
    new_deaths: number; // Nouveaux décès pour cette date (BigInt)
}
```

## Notes sur les Données MPOX

### Différences avec COVID-19

Le jeu de données MPOX diffère du jeu de données COVID à plusieurs égards importants :

1. **Couverture géographique** : Les données MPOX sont disponibles pour moins de pays que les données COVID
2. **Champs de données** : Les données MPOX n'incluent pas de statistiques de guérison ou de cas actifs
3. **Types de données** : Tous les champs numériques MPOX sont des entiers (BigInt), contrairement à COVID qui utilise des Float pour les nouveaux cas/décès
4. **Fréquence de mise à jour** : Les données MPOX peuvent être rapportées avec moins de fréquence que les données COVID
5. **Disponibilité historique** : L'épidémie MPOX étant plus récente, les données historiques sont limitées

### Considérations Techniques

#### Types de Données

-   **Tous les champs numériques** : BigInt en base de données (contrairement à COVID qui mixe BigInt et Float)
-   **Dates** : Format string AAAA-MM-JJ
-   **ID** : Mappé depuis le champ `index` de la base de données

#### Utilisation Recommandée

```javascript
// Exemple : Analyser la progression MPOX par pays
async function analyzeMpoxProgression(country, days = 30) {
    const response = await fetch(
        `/api/mpox/data?country=${encodeURIComponent(country)}&limit=${days}`,
        {
            headers: {
                Authorization: "Bearer your-api-token",
            },
        }
    );

    const data = await response.json();

    // Calculer la progression sur la période
    const totalNewCases = data.reduce((sum, entry) => sum + entry.new_cases, 0);
    const averageDailyCases = totalNewCases / Math.min(days, data.length);

    // Calculer le taux de mortalité
    const latestData = data[0];
    const mortalityRate =
        (latestData.total_deaths / latestData.total_cases) * 100;

    return {
        country,
        period_days: Math.min(days, data.length),
        total_new_cases_period: totalNewCases,
        average_daily_cases: Math.round(averageDailyCases * 100) / 100,
        current_total_cases: latestData.total_cases,
        current_total_deaths: latestData.total_deaths,
        mortality_rate: mortalityRate.toFixed(3) + "%",
        data_points: data.length,
    };
}

// Utilisation
analyzeMpoxProgression("United States", 60)
    .then((analysis) => {
        console.log("Analyse MPOX:", analysis);
    })
    .catch((error) => {
        console.error("Erreur lors de l'analyse:", error);
    });
```

### Limitations et Bonnes Pratiques

#### Limitations connues

1. **Données manquantes** : Certains pays peuvent avoir des lacunes dans leurs données
2. **Délais de reporting** : Les données peuvent avoir plusieurs jours de retard par rapport à la réalité
3. **Standardisation** : Les méthodes de comptage peuvent varier entre pays

#### Bonnes pratiques

1. **Gestion des erreurs** : Toujours vérifier la disponibilité des données avant traitement
2. **Cache** : Mettre en cache les données pour éviter les appels API redondants
3. **Validation** : Valider les données reçues avant utilisation
4. **Agrégation prudente** : Faire attention lors des agrégations de données de pays différents

### Intégration avec d'autres APIs

Pour une analyse complète, vous pouvez combiner les données MPOX avec les données COVID :

```javascript
// Comparaison COVID vs MPOX pour un pays
async function compareDiseasesForCountry(country) {
    const [covidData, mpoxData] = await Promise.all([
        fetch(`/api/covid/public/country/${encodeURIComponent(country)}`).then(
            (r) => r.json()
        ),
        fetch(
            `/api/mpox/data?country=${encodeURIComponent(country)}&limit=30`,
            {
                headers: { Authorization: "Bearer your-api-token" },
            }
        ).then((r) => r.json()),
    ]);

    return {
        country,
        covid: {
            latest_total: covidData[0]?.total_cases || 0,
            latest_deaths: covidData[0]?.total_deaths || 0,
        },
        mpox: {
            latest_total: mpoxData[0]?.total_cases || 0,
            latest_deaths: mpoxData[0]?.total_deaths || 0,
        },
    };
}
```

Lors de l'intégration des données MPOX dans vos applications, tenez compte de ces différences et assurez-vous que votre code les gère de manière appropriée.
