---
order: 200
icon: database
---

# Jeux de données

Cette page détaille les jeux de données utilisés dans le projet MSPR 6.1, leurs sources, et comment ils sont transformés pour une utilisation dans l'API.

## Vue d'ensemble

Le projet exploite trois jeux de données principaux, tous issus de Kaggle, pour fournir des informations sur la COVID-19 et MPOX (variole du singe).

## COVID-19 Global Dataset

![COVID-19 Global Dataset](/docs/img/covid-dataset.png)

**Source** : [COVID-19 Global Dataset](https://www.kaggle.com/datasets/josephassaker/covid19-global-dataset)

**Description** : Ce jeu de données fournit des informations quotidiennes sur la COVID-19 pour chaque pays du monde.

**Champs originaux** :

-   Date
-   Country/Region
-   Cumulative Total Cases
-   Daily New Cases
-   Active Cases
-   Cumulative Total Deaths
-   Daily New Deaths

**Traitement appliqué** :

-   Standardisation des noms de colonnes
-   Calcul des récupérations totales en fonction des cas actifs, des cas totaux et des décès
-   Calcul des récupérations quotidiennes

## Corona Virus Report

**Source** : [Corona Virus Report](https://www.kaggle.com/datasets/imdevskp/corona-virus-report)

**Description** : Un dataset complet sur le coronavirus comprenant des données sur les cas confirmés, les décès, les récupérations, et les cas actifs.

**Champs originaux** :

-   Date
-   Country/Region
-   Confirmed (Total Cases)
-   Deaths (Total Deaths)
-   Recovered (Total Recovered)
-   Active
-   New Cases
-   New Deaths
-   New Recovered

**Traitement appliqué** :

-   Standardisation des noms de colonnes
-   Normalisation des formats de dates

## MPOX (Monkeypox) Data

**Source** : [MPOX Data](https://www.kaggle.com/datasets/utkarshx27/mpox-monkeypox-data)

**Description** : Ce jeu de données contient des informations sur les cas de monkeypox (MPOX) dans différents pays depuis le début de l'épidémie en 2022.

**Champs originaux** :

-   Date
-   Location
-   Total Cases
-   New Cases
-   Total Deaths
-   New Deaths

**Traitement appliqué** :

-   Standardisation des noms de colonnes
-   Normalisation du format des pays pour correspondre aux autres datasets

## Structure standardisée

Après traitement, les données sont standardisées selon la structure suivante :

### COVID-19 Data

| Champ           | Type    | Description                            |
| --------------- | ------- | -------------------------------------- |
| date            | Date    | Date de l'enregistrement (YYYY-MM-DD)  |
| country         | String  | Nom du pays                            |
| total_cases     | Integer | Nombre total de cas confirmés          |
| new_cases       | Integer | Nouveaux cas pour la journée           |
| active_cases    | Integer | Cas actifs (total - guérisons - décès) |
| total_deaths    | Integer | Nombre total de décès                  |
| new_deaths      | Integer | Nouveaux décès pour la journée         |
| total_recovered | Integer | Nombre total de personnes guéries      |
| daily_recovered | Integer | Nouvelles guérisons pour la journée    |

### MPOX Data

| Champ        | Type    | Description                           |
| ------------ | ------- | ------------------------------------- |
| date         | Date    | Date de l'enregistrement (YYYY-MM-DD) |
| country      | String  | Nom du pays                           |
| total_cases  | Integer | Nombre total de cas confirmés         |
| new_cases    | Integer | Nouveaux cas pour la journée          |
| total_deaths | Integer | Nombre total de décès                 |
| new_deaths   | Integer | Nouveaux décès pour la journée        |

## Processus d'import

1. Les datasets sont téléchargés depuis Kaggle via le script `fetch.py`
2. Les données sont normalisées et standardisées via le script `main.py`
3. Les données traitées sont stockées dans des fichiers CSV dans le dossier `/filtered`
4. Les données sont importées dans PostgreSQL via le script `postgress.py`

## Limitations connues

-   Certains pays peuvent avoir des données manquantes pour certaines dates
-   Les noms de pays peuvent varier légèrement entre les datasets
-   Les données MPOX sont moins complètes que les données COVID-19 en raison de la nouveauté de l'épidémie
-   Certaines métriques (comme les guérisons quotidiennes) sont calculées et peuvent contenir des approximations

## Mises à jour des données

Les données peuvent être mises à jour en réexécutant les scripts d'import. La fréquence de mise à jour dépend de la fréquence de mise à jour des datasets source sur Kaggle.
