import pandas as pd
import numpy as np
from sklearn.model_selection import KFold
from sklearn.metrics import mean_absolute_error, r2_score
from joblib import dump

from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import LinearRegression

import xgboost as xgb

# Charger les données
df = pd.read_csv('split/data1_filtered_train.csv')

# Choix des features et de la cible
features = ["total_cases", "new_cases", "total_deaths"]
X = df[features]
y = df["new_deaths"]


# Liste des modèles à tester
models = {
    'Linear Regression': LinearRegression(),
    'Random Forest': RandomForestRegressor(random_state=42),
    'Gradient Boosting': GradientBoostingRegressor(random_state=42),
    'XGBoost': xgb.XGBRegressor(objective='reg:squarederror', random_state=42)
}

kf = KFold(n_splits=10, shuffle=True, random_state=42)

results = {}

for name, model in models.items():
    mae_scores = []
    r2_scores = []
    print(f"\nTesting model: {name}")

    for fold, (train_idx, val_idx) in enumerate(kf.split(X)):
        X_train, X_val = X.iloc[train_idx], X.iloc[val_idx]
        y_train, y_val = y.iloc[train_idx], y.iloc[val_idx]

        model.fit(X_train, y_train)
        y_pred = model.predict(X_val)

        mae = mean_absolute_error(y_val, y_pred)
        r2 = r2_score(y_val, y_pred)

        print(f"Fold {fold+1} ➤ MAE: {mae:.5f} | R²: {r2:.5f}")
        mae_scores.append(mae)
        r2_scores.append(r2)

    results[name] = {
        'MAE mean': np.mean(mae_scores),
        'R² mean': np.mean(r2_scores)
    }

print("\n✅ Résumé des performances moyennes :")
for name, metrics in results.items():
    print(f"{name} ➤ MAE moyen: {metrics['MAE mean']:.5f} | R² moyen: {metrics['R² mean']:.5f}")


for name, model in models.items():
    print(f"\nTraining and saving model: {name}")
    model.fit(X, y)  # entraînement complet sur tout le dataset
    filename = f"{name.replace(' ', '_').lower()}_final.joblib"
    dump(model, filename)
    print(f"Model saved as {filename}")
