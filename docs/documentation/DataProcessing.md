---
label: Data Processing
icon: checklist
order: 100
category: Documentation
---

# Documentation du Processus de Collecte et de Nettoyage des Données

## 1. Introduction

Ce document détaille le processus de collecte, d'extraction et de nettoyage des ensembles de données COVID-19 et MPOX. Les données COVID-19 proviennent directement de l'Organisation Mondiale de la Santé (OMS) et les données MPOX d'un ensemble de données statique, garantissant une source officielle et fiable.

## 2. Collecte des Données

### 2.1. Sources des Données

Les données proviennent de deux sources principales :

-   **WHO COVID-19 Global Data** - Données officielles de l'OMS
-   **MPOX Dataset** - Ensemble de données statique (mpox-22-june.csv)

### 2.2. Architecture Simplifiée

Le système a été simplifié pour utiliser des sources de données plus fiables et officielles :

#### 2.2.1. Configuration des Dossiers

```python
DOWNLOAD_PATH = os.path.expanduser("./downloads")
```

#### 2.2.2. Sources de Données Actuelles

```python
datasets = {
    "WHO-COVID-19-global-data.csv": {
        "url": "https://srhdpeuwpubsa.blob.core.windows.net/whdh/COVID/WHO-COVID-19-global-data.csv",
        "extract_to": "raw_data"
    }
}
```

#### 2.2.3. Téléchargement via curl

Le fichier WHO COVID-19 est téléchargé directement depuis le serveur officiel de l'OMS :

```python
command = f'curl -L -o "{file_path}" "{info["url"]}"'
subprocess.run(command, shell=True, check=True)
```

#### 2.2.4. Déplacement vers le Dossier de Données

Les fichiers sont déplacés vers le dossier `raw_data` après téléchargement :

```python
os.rename(file_path, os.path.join(extract_path, filename))
```

## 3. Nettoyage et Prétraitement des Données

### 3.1. Chargement des Données

Les fichiers CSV sont chargés avec un encodage UTF-8 explicite :

```python
data1 = pd.read_csv('raw_data/WHO-COVID-19-global-data.csv', encoding='utf-8')
data2 = pd.read_csv('raw_data/mpox-22-june.csv', encoding='utf-8')
```

### 3.2. Définition des Colonnes Finales

Les colonnes finales sont standardisées pour les deux ensembles de données :

```python
data1_final_columns = ["date", "country", "total_cases", "new_cases", "total_deaths", "new_deaths"]
data2_final_columns = ["date", "country", "total_cases", "new_cases", "total_deaths", "new_deaths"]
```

### 3.3. Standardisation des Noms de Colonnes

Les noms de colonnes sont convertis en minuscules et les espaces remplacés par des underscores :

```python
data1.columns = data1.columns.str.lower().str.replace(' ', '_')
data2.columns = data2.columns.str.lower().str.replace(' ', '_')
```

### 3.4. Renommage des Colonnes Clés

#### 3.4.1. Données COVID-19 (WHO)

```python
data1.rename(columns={
    "date_reported": "date",
    "country": "country",
    "cumulative_cases": "total_cases",
    "new_cases": "new_cases",
    "cumulative_deaths": "total_deaths",
    "new_deaths": "new_deaths"
}, inplace=True)
```

#### 3.4.2. Données MPOX

```python
data2.rename(columns={
    "date": "date",
    "country": "country",
    "total_conf_cases": "total_cases",
    "new_conf_cases": "new_cases",
    "total_conf_deaths": "total_deaths",
    "new_conf_deaths": "new_deaths"
}, inplace=True)
```

### 3.5. Traitement des Dates

Les dates MPOX sont converties en format datetime :

```python
data2['date'] = pd.to_datetime(data2['date'])
```

### 3.6. Gestion des Valeurs Manquantes

Toutes les valeurs `NaN` sont remplacées par `0` :

```python
data1.fillna(0, inplace=True)
data2.fillna(0, inplace=True)
```

### 3.7. Traitement par Pays (COVID-19)

Pour assurer la cohérence des données COVID-19, un traitement par pays est effectué :

#### 3.7.1. Séparation par Pays

```python
for country, group in data1.groupby("country"):
    os.makedirs('tempfilter', exist_ok=True)
    group.to_csv(f'tempfilter/{country}_data1_filtered.csv', index=False, encoding='utf-8')
```

#### 3.7.2. Rechargement et Concaténation

```python
all_datas = []
for file_name in os.listdir('tempfilter'):
    file_path = os.path.join('tempfilter', file_name)
    try:
        dataf = pd.read_csv(file_path, delimiter=',', encoding='utf-8')
        all_datas.append(dataf)
    except Exception as e:
        print(e)

data1 = pd.concat(all_datas)
```

#### 3.7.3. Nettoyage des Fichiers Temporaires

```python
for file_name in os.listdir('tempfilter'):
    file_path = os.path.join('tempfilter', file_name)
    os.remove(file_path)
os.rmdir('tempfilter')
```

### 3.8. Sélection des Colonnes Finales

Chaque dataset est réduit aux colonnes standardisées :

```python
data1 = data1[data1_final_columns]
data2 = data2[data2_final_columns]
```

### 3.9. Nettoyage des Noms de Pays

Correction des caractères spéciaux et des noms de pays problématiques :

```python
data1.replace("Côte d'Ivoire", "Cote d'Ivoire", inplace=True)
data1.replace("Türkiye", "Turkey", inplace=True)
data1.replace("Curaçao", "Curacao", inplace=True)
data1.replace("Réunion", "Reunion", inplace=True)
data1.replace("Saint Barthélemy", "Saint Barthélemy", inplace=True)
```

## 4. Exportation des Données Nettoyées

Les datasets nettoyés sont sauvegardés dans le dossier `filtered/` avec encodage UTF-8 :

```python
os.makedirs('filtered', exist_ok=True)
data2.to_csv('filtered/mpox_filtered.csv', index=False, encoding='utf-8')
data1.to_csv('filtered/covid_filtered.csv', index=False, encoding='utf-8')
```

## 5. Avantages de la Nouvelle Approche

### 5.1. Sources Officielles

-   **Données COVID-19** : Directement de l'OMS, garantissant l'authenticité
-   **Données MPOX** : Ensemble de données contrôlé et vérifié

### 5.2. Simplicité et Fiabilité

-   Moins de dépendances externes (plus de Kaggle API)
-   Processus de téléchargement plus direct
-   Meilleur contrôle de la qualité des données

### 5.3. Performance Améliorée

-   Moins de fichiers à traiter
-   Processus ETL plus rapide
-   Encodage UTF-8 cohérent

### 5.4. Maintenance Simplifiée

-   Code plus simple et lisible
-   Moins de points de défaillance
-   Sources de données stables

## 6. Structure des Données Finales

### 6.1. COVID-19 (`covid_filtered.csv`)

-   **date** : Date de rapport (AAAA-MM-JJ)
-   **country** : Nom du pays
-   **total_cases** : Cas cumulés confirmés
-   **new_cases** : Nouveaux cas du jour
-   **total_deaths** : Décès cumulés
-   **new_deaths** : Nouveaux décès du jour

### 6.2. MPOX (`mpox_filtered.csv`)

-   **date** : Date de rapport (AAAA-MM-JJ)
-   **country** : Nom du pays
-   **total_cases** : Cas cumulés confirmés
-   **new_cases** : Nouveaux cas du jour
-   **total_deaths** : Décès cumulés
-   **new_deaths** : Nouveaux décès du jour

## 7. Conclusion

Cette approche simplifiée assure une collecte de données plus fiable et un traitement plus efficace. L'utilisation de sources officielles comme l'OMS garantit la qualité et l'authenticité des données, tandis que la simplification du processus améliore la maintenance et les performances du système ETL.
