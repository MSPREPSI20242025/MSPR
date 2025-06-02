import pandas as pd
from joblib import load
from sklearn.metrics import mean_absolute_error, r2_score


df_test = pd.read_csv('split/data1_filtered_test.csv')

X_test = df_test[['total_cases', 'total_recovered']]  # mêmes features que l'entraînement
y_test = df_test['total_deaths']

model_files = [
    'linear_regression_final.joblib',
    'random_forest_final.joblib',
    'gradient_boosting_final.joblib',
    'xgboost_final.joblib'
]

for model_file in model_files:
    # Charger le modèle
    model = load(model_file)
    # Prédiction
    y_pred = model.predict(X_test)
    # Calcul des scores
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    print(f"{model_file.replace('_final.joblib', '').replace('_', ' ').title()} ➤ MAE: {mae:.5f} | R²: {r2:.5f}")
