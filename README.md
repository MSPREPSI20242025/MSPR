# MSPR 6.1

API de données sur les épidémies de COVID-19 et MPOX.

## Documentation

La documentation complète du projet est disponible à l'adresse suivante :
**[msprepsi20242025.github.io/MSPR/](https://msprepsi20242025.github.io/MSPR/)**

## Installation rapide

Pour installer les dépendances :

```bash
pip install -r requirements.txt
```

Pour télécharger les données :

```bash
python fetch.py
```

Pour traiter et standardiser les données :

```bash
python main.py
```

Pour importer les données dans PostgreSQL :

```bash
python postgress.py
```

## API REST

L'API REST se trouve dans le dossier `rest/`. Pour l'installer et la démarrer :

```bash
cd rest/
pnpm install
pnpm dev
```

Pour plus de détails sur l'installation et l'utilisation, consultez la [documentation complète](https://msprepsi20242025.github.io/MSPR/).
