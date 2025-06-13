import pandas as pd
import numpy as np
from sklearn.model_selection import KFold
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import LinearRegression
import xgboost as xgb
from joblib import dump

# Liste de tes datasets
datasets = {
    "Dataset 1": "split/data1_filtered_train.csv",
    "Dataset 2": "split/data2_filtered_train.csv"
}

models = {
    'Linear Regression': LinearRegression(),
    'Random Forest': RandomForestRegressor(random_state=42),
    'Gradient Boosting': GradientBoostingRegressor(random_state=42),
    'XGBoost': xgb.XGBRegressor(objective='reg:squarederror', random_state=42)
}


def train_mortality(file_path, dataset_name):
    print(f"\n📊 Training on {dataset_name}...")
    df = pd.read_csv(file_path)

    features = ["total_cases", "new_cases", "total_deaths" , "active_cases"]
    X = df[features]
    y = df["new_deaths"]

    kf = KFold(n_splits=10, shuffle=True, random_state=42)
    results = {}

    for name, model in models.items():
        mae_scores = []
        r2_scores = []
        print(f"\nModel: {name}")

        for fold, (train_idx, val_idx) in enumerate(kf.split(X), 1):
            X_train, X_val = X.iloc[train_idx], X.iloc[val_idx]
            y_train, y_val = y.iloc[train_idx], y.iloc[val_idx]

            model.fit(X_train, y_train)
            y_pred = model.predict(X_val)

            mae = mean_absolute_error(y_val, y_pred)
            r2 = r2_score(y_val, y_pred)

            mae_scores.append(mae)
            r2_scores.append(r2)

            print(f" Fold {fold} ➤ MAE: {mae:.5f} | R²: {r2:.5f}")

        print(f"\n✅ Résultats moyens sur {dataset_name} :")
        print(f"{name}: MAE moyen = {np.mean(mae_scores):.5f} | R² moyen = {np.mean(r2_scores):.5f}")

        # Entraîner sur tout le dataset d'entraînement (après CV)
        model.fit(X, y)

        # Sauvegarder le modèle entraîné
        filename = f"{name.replace(' ', '_').lower()}_{dataset_name.replace(' ', '_').lower()}_final.joblib"
        dump(model, filename)
        print(f"Modèle sauvegardé sous : {filename}")

        results[name] = {'MAE mean': np.mean(mae_scores), 'R² mean': np.mean(r2_scores)}

    return results


global_results = {}

for dataset_name, file_path in datasets.items():
    global_results[dataset_name] = train_mortality(file_path, dataset_name)

