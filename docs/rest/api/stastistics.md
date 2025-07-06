---
label: Points d'Accès Statistiques
icon: graph
order: 400
category: API REST
---

# Points d'Accès Statistiques

## Points d'Accès Protégés

Ces points d'accès nécessitent une authentification.

### Obtenir le Résumé des Statistiques

Retourne les statistiques récapitulatives pour COVID et MPOX.

```
GET /stats/summary
```

#### Réponse

```json
{
    "covid": {
        "total_cases": 128963254,
        "total_deaths": 2819892
    },
    "mpox": {
        "total_cases": 86243,
        "total_deaths": 89
    }
}
```

Ce point d'accès fournit une vue d'ensemble de la situation mondiale pour les deux maladies. Il est particulièrement utile pour les tableaux de bord et les visualisations récapitulatives.

## Comprendre les Statistiques

Le point d'accès statistiques agrège les données de la date la plus récente disponible pour tous les pays. Cela signifie que :

1. **Agrégation par date** : Les totaux représentent la somme des données de tous les pays à la date la plus récente dans la base de données
2. **Données asynchrones** : Certains pays peuvent avoir des données plus récentes que d'autres
3. **Instantané de la base** : Les chiffres reflètent l'état de la base de données, pas nécessairement les chiffres mondiaux en temps réel

Pour les statistiques les plus précises au niveau des pays, utilisez les points d'accès spécifiques COVID et MPOX.

## Structure des Données Retournées

### Format de Réponse

```typescript
interface StatsSummary {
    covid: {
        total_cases: number; // Total mondial des cas COVID (BigInt)
        total_deaths: number; // Total mondial des décès COVID (BigInt)
    };
    mpox: {
        total_cases: number; // Total mondial des cas MPOX (BigInt)
        total_deaths: number; // Total mondial des décès MPOX (BigInt)
    };
}
```

### Points Importants

-   **Pas de données de guérison** : L'API ne suit pas les données de guérison pour COVID ou MPOX
-   **Types numériques** : Tous les totaux sont des entiers (BigInt en base de données)
-   **Authentification requise** : Cet endpoint nécessite un token bearer valide

## Utilisation des Données Statistiques

Le point d'accès statistiques est idéal pour :

-   **Tableaux de bord** : Créer des visualisations de haut niveau
-   **Comparaisons** : Comparer l'impact relatif de COVID-19 vs MPOX
-   **Surveillance** : Surveiller les tendances mondiales dans le temps
-   **Alertes** : Mettre en place des notifications basées sur les seuils

### Exemple d'Intégration

Voici un exemple complet d'utilisation des données statistiques :

```javascript
// Configuration de l'API
const API_BASE = "https://api.yourdomain.com/api";
const API_TOKEN = "your-api-token";

// Fonction pour récupérer les statistiques
async function fetchGlobalStats() {
    try {
        const response = await fetch(`${API_BASE}/stats/summary`, {
            headers: {
                Authorization: `Bearer ${API_TOKEN}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(
            "Erreur lors de la récupération des statistiques:",
            error
        );
        throw error;
    }
}

// Créer un graphique de comparaison
async function createComparisonChart() {
    const data = await fetchGlobalStats();

    const ctx = document.getElementById("comparison-chart").getContext("2d");
    const chart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["COVID-19", "MPOX"],
            datasets: [
                {
                    label: "Total des Cas",
                    data: [data.covid.total_cases, data.mpox.total_cases],
                    backgroundColor: [
                        "rgba(54, 162, 235, 0.8)",
                        "rgba(255, 159, 64, 0.8)",
                    ],
                    borderColor: [
                        "rgba(54, 162, 235, 1)",
                        "rgba(255, 159, 64, 1)",
                    ],
                    borderWidth: 1,
                },
                {
                    label: "Total des Décès",
                    data: [data.covid.total_deaths, data.mpox.total_deaths],
                    backgroundColor: [
                        "rgba(255, 99, 132, 0.8)",
                        "rgba(255, 205, 86, 0.8)",
                    ],
                    borderColor: [
                        "rgba(255, 99, 132, 1)",
                        "rgba(255, 205, 86, 1)",
                    ],
                    borderWidth: 1,
                },
            ],
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: "Comparaison Mondiale COVID-19 vs MPOX",
                },
                legend: {
                    display: true,
                    position: "top",
                },
            },
            scales: {
                y: {
                    type: "logarithmic",
                    title: {
                        display: true,
                        text: "Nombre (échelle logarithmique)",
                    },
                },
            },
        },
    });

    return chart;
}

// Mettre à jour les métriques sur la page
async function updateDashboardMetrics() {
    const stats = await fetchGlobalStats();

    // Calculer le ratio de mortalité
    const covidMortalityRate = (
        (stats.covid.total_deaths / stats.covid.total_cases) *
        100
    ).toFixed(3);
    const mpoxMortalityRate = (
        (stats.mpox.total_deaths / stats.mpox.total_cases) *
        100
    ).toFixed(3);

    // Mettre à jour les éléments DOM
    document.getElementById("covid-cases").textContent =
        stats.covid.total_cases.toLocaleString();
    document.getElementById("covid-deaths").textContent =
        stats.covid.total_deaths.toLocaleString();
    document.getElementById(
        "covid-mortality"
    ).textContent = `${covidMortalityRate}%`;

    document.getElementById("mpox-cases").textContent =
        stats.mpox.total_cases.toLocaleString();
    document.getElementById("mpox-deaths").textContent =
        stats.mpox.total_deaths.toLocaleString();
    document.getElementById(
        "mpox-mortality"
    ).textContent = `${mpoxMortalityRate}%`;
}

// Initialiser le tableau de bord
document.addEventListener("DOMContentLoaded", async () => {
    try {
        await updateDashboardMetrics();
        await createComparisonChart();
        console.log("Tableau de bord initialisé avec succès");
    } catch (error) {
        console.error("Erreur lors de l'initialisation:", error);
        // Afficher un message d'erreur à l'utilisateur
        document.getElementById("error-message").style.display = "block";
    }
});
```

## Limitations et Considérations

### Limitation du Taux

Le point d'accès statistiques a des limites de taux généreuses :

-   **300 requêtes par heure** par jeton API
-   **Recommandation** : Mettre en cache les résultats pendant au moins 15 minutes

### Performance

-   **Temps de réponse** : Généralement < 200ms
-   **Taille de réponse** : ~100 bytes (très compact)
-   **Disponibilité** : 99.9% de disponibilité garantie

### Considérations pour la Production

1. **Gestion d'erreur** : Toujours implémenter une gestion d'erreur robuste
2. **Cache** : Mettre en cache les réponses pour éviter les appels redondants
3. **Surveillance** : Surveiller les codes de réponse et temps de latence
4. **Fallback** : Prévoir des données de secours en cas d'indisponibilité
