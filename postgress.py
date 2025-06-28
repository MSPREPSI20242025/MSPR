import pandas as pd
import psycopg2
from sqlalchemy import create_engine, text
from dotenv import load_dotenv
import os

# Charger les variables d'environnement
load_dotenv()

# Paramètres de connexion PostgreSQL
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT", "5432")

# Créer une connexion à PostgreSQL
print("Connecting to PostgreSQL...")
engine = create_engine(f'postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}')
connection = engine.connect()

print("Loading data...")
# Charger les fichiers CSV
data1 = pd.read_csv('filtered/covid_filtered.csv')  # COVID
data2 = pd.read_csv('filtered/mpox_filtered.csv')  # MPOX

# Définir les noms des tables
TABLE_COVID = "covid_data"
TABLE_MPOX = "mpox_data"

print("Importing data...")
# Charger les données COVID (data1 et data2)
data1.to_sql(TABLE_COVID, engine, if_exists='replace', index=True)

# Charger les données MPOX (data3)
data2.to_sql(TABLE_MPOX, engine, if_exists='replace', index=True)

print("Data imported successfully!")
connection.close()
engine.dispose()
