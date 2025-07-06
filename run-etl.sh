#!/bin/bash

# Script ETL externe qui utilise uv pour créer un environnement virtuel
# et exécute les scripts Python pour charger les données

set -e

echo "🚀 Script ETL externe - Chargement des données MSPR"

# Vérifier que uv est installé
if ! command -v uv &> /dev/null; then
    echo "❌ uv n'est pas installé. Installez-le avec: curl -LsSf https://astral.sh/uv/install.sh | sh"
    exit 1
fi

# Charger les variables d'environnement
if [ -f ".env" ]; then
    echo "📋 Chargement des variables d'environnement depuis .env"
    # Charger les variables en filtrant les commentaires et lignes vides
    while IFS= read -r line; do
        # Ignorer les commentaires et lignes vides
        if [[ "$line" =~ ^[[:space:]]*# ]] || [[ -z "$line" ]]; then
            continue
        fi
        # Exporter la variable
        export "$line"
    done < .env
else
    echo "⚠️ Fichier .env introuvable, utilisation des valeurs par défaut"
fi

# Configuration des variables avec valeurs par défaut
export POSTGRES_USER="${POSTGRES_USER:-mspr}"
export POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-mspr61}"
export POSTGRES_DB="${POSTGRES_DB:-mspr}"
export POSTGRES_HOST="${POSTGRES_HOST:-localhost}"
export POSTGRES_PORT="${POSTGRES_PORT:-5432}"

# Construire l'URL de la base de données
export DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}"

echo "🌍 Configuration de la base de données:"
echo "  - Host: ${POSTGRES_HOST}:${POSTGRES_PORT}"
echo "  - Database: ${POSTGRES_DB}"
echo "  - User: ${POSTGRES_USER}"

# Vérifier que PostgreSQL est accessible
echo "🔍 Vérification de la connexion PostgreSQL..."
max_attempts=30
attempt=1

while [ $attempt -le $max_attempts ]; do
    if pg_isready -h "${POSTGRES_HOST}" -p "${POSTGRES_PORT}" -U "${POSTGRES_USER}" > /dev/null 2>&1; then
        echo "✅ PostgreSQL est accessible"
        break
    fi
    
    if [ $attempt -eq $max_attempts ]; then
        echo "❌ PostgreSQL non accessible après $max_attempts tentatives"
        echo "🔧 Vérifiez que le container PostgreSQL est démarré:"
        echo "    docker-compose -f infrastructure/docker/docker-compose.yml up -d postgres"
        exit 1
    fi
    
    echo "Tentative $attempt/$max_attempts - PostgreSQL pas encore prêt..."
    sleep 2
    attempt=$((attempt + 1))
done

# Créer l'environnement virtuel avec uv
echo "🐍 Création de l'environnement virtuel Python avec uv..."
if [ -d ".venv" ]; then
    echo "♻️ Environnement virtuel existant trouvé"
else
    uv venv
    echo "✅ Environnement virtuel créé"
fi

# Installer les dépendances
echo "📦 Installation des dépendances Python..."
uv pip install -r requirements.txt

# Étape 1: Exécuter fetch.py
echo "📥 Étape 1: Téléchargement des données avec fetch.py..."
if uv run python fetch.py; then
    echo "✅ Données téléchargées avec succès"
else
    echo "❌ Erreur lors du téléchargement des données"
    exit 1
fi

# Vérifier que les données sont téléchargées
if [ ! -f "raw_data/WHO-COVID-19-global-data.csv" ]; then
    echo "❌ Fichier WHO-COVID-19-global-data.csv non trouvé"
    exit 1
fi

if [ ! -f "raw_data/mpox-22-june.csv" ]; then
    echo "❌ Fichier mpox-22-june.csv non trouvé"
    exit 1
fi

echo "✅ Fichiers de données présents:"
echo "  - $(wc -l < raw_data/WHO-COVID-19-global-data.csv) lignes dans WHO-COVID-19-global-data.csv"
echo "  - $(wc -l < raw_data/mpox-22-june.csv) lignes dans mpox-22-june.csv"

# Étape 2: Exécuter main.py
echo "🔄 Étape 2: Traitement des données avec main.py..."
if uv run python main.py; then
    echo "✅ Données traitées avec succès"
else
    echo "❌ Erreur lors du traitement des données"
    exit 1
fi

# Vérifier que les données filtrées sont créées
if [ ! -f "filtered/covid_filtered.csv" ] || [ ! -f "filtered/mpox_filtered.csv" ]; then
    echo "❌ Fichiers filtrés manquants"
    ls -la filtered/ 2>/dev/null || echo "Dossier filtered/ inexistant"
    exit 1
fi

echo "✅ Fichiers filtrés créés:"
echo "  - $(wc -l < filtered/covid_filtered.csv) lignes dans covid_filtered.csv"
echo "  - $(wc -l < filtered/mpox_filtered.csv) lignes dans mpox_filtered.csv"

# Étape 3: Exécuter postgress.py
echo "💾 Étape 3: Import des données dans PostgreSQL avec postgress.py..."
if uv run python postgress.py; then
    echo "✅ Données importées avec succès en base"
else
    echo "❌ Erreur lors de l'import des données"
    exit 1
fi

# Vérification finale
echo "🔍 Vérification des données en base..."
PGPASSWORD="${POSTGRES_PASSWORD}" psql -h "${POSTGRES_HOST}" -p "${POSTGRES_PORT}" -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" -c "
    SELECT 
        'COVID-19' as dataset, 
        COUNT(*) as records 
    FROM covid_data 
    UNION ALL 
    SELECT 
        'MPOX' as dataset, 
        COUNT(*) as records 
    FROM mpox_data;
" 2>/dev/null && echo "✅ Vérification réussie" || echo "❌ Erreur lors de la vérification"

echo "🎉 ETL terminé avec succès!"
echo "📊 Les données sont maintenant disponibles dans PostgreSQL"
echo "🌐 Vous pouvez démarrer l'application complète avec:"
echo "    docker-compose -f infrastructure/docker/docker-compose.yml up -d"