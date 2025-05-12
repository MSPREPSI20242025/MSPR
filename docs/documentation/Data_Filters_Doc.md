---
label: Documentation des filtres appliqués aux données
icon: checklist
order: 100
category: Documentation
---

# Documentation des filtres appliqués aux données

## Introduction
Cette documentation décrit en détail les étapes de transformation et de filtrage appliquées aux données issues de différentes sources. L'objectif principal est d'assurer l'homogénéité et la cohérence des informations avant leur analyse, en réduisant les incohérences, en harmonisant les formats et en facilitant leur exploitation pour des études ultérieures.

## 1. Chargement des données
Trois fichiers CSV contenant des données sur les infections ont été chargés et utilisés comme sources principales :

- **`data1/worldometer_coronavirus_daily_data.csv`** : Contient des informations détaillées sur l'évolution du coronavirus, incluant le nombre total et journalier de cas, de décès et de récupérations.
- **`data2/full_grouped.csv`** : Une autre source de données COVID-19 nécessitant une mise en correspondance avec `data1`.
- **`data3/owid-monkeypox-data.csv`** : Un fichier spécifique aux infections de la variole du singe, contenant des indicateurs similaires mais distincts.

## 2. Standardisation des noms de colonnes
Afin de garantir l'uniformité et de faciliter la manipulation des données, les noms de colonnes ont été convertis en minuscules et les espaces ont été remplacés par des underscores (`_`). Cette normalisation améliore la compatibilité avec divers outils d'analyse et permet une utilisation plus fluide des datasets.

## 3. Renommage des colonnes
Les colonnes des différents fichiers ont été renommées pour assurer une correspondance entre les différentes sources et permettre des comparaisons directes.

### Détails des renommages appliqués
#### `data1`
- `cumulative_total_cases` → `total_cases`
- `daily_new_cases` → `new_cases`
- `cumulative_total_deaths` → `total_deaths`
- `daily_new_deaths` → `new_deaths`
- `active_cases` → `active_cases`

#### `data2`
- `country/region` → `country`
- `confirmed` → `total_cases`
- `deaths` → `total_deaths`
- `new_cases` → `new_cases`
- `new_deaths` → `new_deaths`
- `active` → `active_cases`
- `recovered` → `total_recovered`
- `new_recovered` → `daily_recovered`

#### `data3`
- `location` → `country`
- `date` → `date`
- `total_cases` → `total_cases`
- `new_cases` → `new_cases`
- `total_deaths` → `total_deaths`
- `new_deaths` → `new_deaths`

## 4. Conversion des dates
Les dates sont essentielles pour analyser l'évolution des infections. La colonne `date` dans `data2` a été convertie au format `datetime`, assurant ainsi une meilleure compatibilité avec les opérations de tri, d'agrégation et d'analyse temporelle.

## 5. Calcul du nombre total de récupérations
Dans `data1`, la colonne `total_recovered` a été recalculée pour éviter toute incohérence avec les autres indicateurs de suivi. La formule utilisée est :

```math
total_recovered = (Previous_Total_Cases + new_cases) - (active_cases + total_deaths)
```

Toutes les valeurs négatives résultant de cette opération ont été forcées à 0 pour garantir l'exactitude des analyses futures.

## 6. Gestion des valeurs manquantes
Les valeurs manquantes (`NaN`) peuvent fausser les analyses. Afin de minimiser ces risques, toutes les valeurs manquantes ont été remplacées par `0`, garantissant ainsi une continuité des données et évitant des erreurs lors des traitements.

## 7. Filtrage des données par pays
Les données de `data1` ont été divisées en plusieurs fichiers CSV, un par pays, afin de faciliter leur traitement et leur analyse individuelle. Ce découpage permet une gestion plus efficace des données et une extraction ciblée selon les besoins spécifiques.

## 8. Calcul des récupérations journalières (`daily_recovered`)
Après filtrage, un nouveau calcul a été appliqué pour obtenir les récupérations journalières :

```math
daily_recovered = total_recovered - Previous_Total_Recovery
```

Cette opération a été effectuée après la réorganisation des fichiers individuels par pays, assurant ainsi un suivi précis des patients guéris.

## 9. Nettoyage des fichiers temporaires
Une fois toutes les opérations de traitement terminées, les fichiers temporaires créés ont été supprimés afin d'éviter une surcharge inutile sur le système. Cette étape optimise l’espace disque et évite des confusions entre fichiers intermédiaires et fichiers finaux.

## 10. Sélection et sauvegarde des colonnes finales
Chaque dataset a été filtré pour ne conserver que les colonnes essentielles à l'analyse :

- **`data1_final_columns`** : `date`, `country`, `total_cases`, `new_cases`, `active_cases`, `total_deaths`, `new_deaths`, `total_recovered`, `daily_recovered`
- **`data2_final_columns`** : `date`, `country`, `total_cases`, `new_cases`, `active_cases`, `total_deaths`, `new_deaths`, `total_recovered`, `daily_recovered`
- **`data3_final_columns`** : `date`, `country`, `total_cases`, `new_cases`, `total_deaths`, `new_deaths`

Les fichiers filtrés finaux ont été sauvegardés dans le dossier `filtered` sous les noms suivants :

- `filtered/data1_filtered.csv` : Données COVID-19 provenant de `data1` après application des transformations.
- `filtered/data2_filtered.csv` : Données harmonisées issues de `data2` avec les mêmes variables que `data1`.
- `filtered/data3_filtered.csv` : Informations sur la variole du singe extraites de `data3`.

## 11. Importance de ces transformations
L’application de ces filtres et modifications a plusieurs objectifs :

- **Uniformisation des données** : Toutes les sources suivent désormais une même structure, facilitant leur fusion et comparaison.
- **Correction des incohérences** : Les erreurs et valeurs aberrantes ont été corrigées ou exclues pour garantir la fiabilité des résultats.
- **Préparation des analyses futures** : Les datasets finaux sont prêts pour des analyses statistiques, des visualisations et des modèles prédictifs.
- **Optimisation des performances** : En réduisant les erreurs et en normalisant les formats, l'exploitation des données devient plus efficace et rapide.

## Conclusion
Grâce à ces transformations, les données issues de sources variées sont désormais normalisées et exploitables. Ces ajustements garantissent une meilleure interprétation et facilitent leur intégration dans des processus analytiques avancés. Ce prétraitement permet ainsi une exploitation optimale des informations pour la prise de décision et la recherche scientifique.
