# Prédiction des Cas et Décès COVID-19 avec Random Forest

## 1. Chargement des Données

Les données sont chargées à partir de `filtered/covid_filtered.csv`, avec conversion de la colonne `date` en format datetime.

```python
df = pd.read_csv("filtered/covid_filtered.csv")
df['date'] = pd.to_datetime(df['date'])
```

---

## 2. Enrichissement des Données

Ajout de variables dérivées de la date :

-   Année (`year`)
-   Mois (`month`)
-   Semaine ISO (`week`)
-   Jour de la semaine (`day_of_week`)

```python
df['year'] = df['date'].dt.year
df['month'] = df['date'].dt.month
df['week'] = df['date'].dt.isocalendar().week
df['day_of_week'] = df['date'].dt.dayofweek
```

---

## 3. Encodage des Pays

Les pays sont transformés en variables numériques avec `LabelEncoder`.

```python
encoder = LabelEncoder()
df['country_encoded'] = encoder.fit_transform(df['country'])
```

---

## 4. Séparation Entraînement/Test

Les données avant `2025-01-01` sont utilisées pour l'entraînement, et les données après cette date pour le test.

---

## 5. Définition des Variables

-   **Features :**

    -   `country_encoded`
    -   `year`
    -   `month`
    -   `week`
    -   `day_of_week`

-   **Cibles :**
    -   `new_cases`
    -   `new_deaths`

---

## 6. Évaluation par Validation Croisée

Utilisation de `TimeSeriesSplit` pour effectuer une validation croisée temporelle (10 splits).

```python
tscv = TimeSeriesSplit(n_splits=10)
```

**Modèle utilisé :**  
`MultiOutputRegressor(RandomForestRegressor(n_estimators=100, random_state=42))`

**Résultats de la validation croisée :**

-   MAE `new_cases` : 22160.67
-   MAE `new_deaths` : 215.73
-   MAE globale : 11188.20

---

## 7. Entraînement du Modèle Final

Entraînement sur l'ensemble des données d'entraînement.

---

## 8. Évaluation sur le Jeu de Test

**Résultats sur les données de test :**

-   MAE `new_cases` : 707.99
-   MAE `new_deaths` : 5.80
-   MAE globale : 356.89

---

## 9. Comparaison CV vs Test

|              | MAE CV   | MAE Test |
| ------------ | -------- | -------- |
| `new_cases`  | 22160.67 | 707.99   |
| `new_deaths` | 215.73   | 5.80     |
| **Global**   | 11188.20 | 356.89   |

---

## 10. Analyse de l'Importance des Variables

### Pour `new_cases` :

```text
- country_encoded : 0.4891
- year            : 0.1938
- month           : 0.1756
- week            : 0.1414
```

### Pour `new_deaths` :

```text
- country_encoded : 0.5782
- year            : 0.2340
- month           : 0.1022
- week            : 0.1414
```

---

## 11. Génération de Données Futures

Dates futures générées tous les 7 jours de `2025-06-22` à `2026-06-22` pour chaque pays encodé.

---

## 12. Prédiction des Valeurs Futures

Prédiction des `new_cases` et `new_deaths` pour chaque date future.

---

## 13. Calcul des Totaux Cumulés

-   Basé sur les dernières valeurs connues avant `2023-01-01`
-   Calcul cumulé pour chaque pays et chaque semaine future

---

## 14. Sauvegarde des Prédictions

Fichier CSV généré :

```
predictions/future_predictions_covid.csv
```

Colonnes :

-   `country`
-   `date`
-   `predicted_new_cases`
-   `predicted_total_cases`
-   `predicted_new_deaths`
-   `predicted_total_deaths`

---

## 15. Sauvegarde des Métriques du Modèle

Fichier CSV :

```
predictions/model_metrics.csv
```

Contenu :

-   Moyennes et écarts-types des MAE (validation croisée)
-   MAE sur données de test

---

## Conclusion

Ce projet implémente un pipeline de prévision temporelle multi-sortie pour la pandémie COVID-19. Le modèle Random Forest MultiOutputRegressor a été évalué avec validation croisée temporelle et testé sur des données de 2025. Il est ensuite utilisé pour prédire les cas et décès hebdomadaires futurs, jusqu'en 2026.
