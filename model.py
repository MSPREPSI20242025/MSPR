import pandas as pd
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestRegressor
from sklearn.multioutput import MultiOutputRegressor
from sklearn.metrics import mean_absolute_error
from sklearn.model_selection import TimeSeriesSplit
import numpy as np
import os

# 1. Load data
df = pd.read_csv("filtered/covid_filtered.csv")
df['date'] = pd.to_datetime(df['date'])

# 2. Add date features
df['year'] = df['date'].dt.year
df['month'] = df['date'].dt.month
df['week'] = df['date'].dt.isocalendar().week
df['day_of_week'] = df['date'].dt.dayofweek

# 3. Encode country
encoder = LabelEncoder()
df['country_encoded'] = encoder.fit_transform(df['country'])

# 4. Split train/test by date
train_df = df[df['date'] < '2025-01-01']
test_df = df[df['date'] >= '2025-01-01']

# 5. Define features and targets (only new cases and deaths)
features = ['country_encoded', 'year', 'month', 'week', 'day_of_week']
target_cols = ['new_cases', 'new_deaths']

X_train = train_df[features]
y_train = train_df[target_cols]

X_test = test_df[features]
y_test = test_df[target_cols]

# 6. Cross-validation sur les données d'entraînement
print("=== Cross-Validation Evaluation ===")

# Utilisation de TimeSeriesSplit pour respecter l'ordre temporel
tscv = TimeSeriesSplit(n_splits=10)

# Modèle pour la cross-validation
base_model = RandomForestRegressor(n_estimators=100, random_state=42)
cv_model = MultiOutputRegressor(base_model)

# Cross-validation scores pour chaque target
cv_scores_cases = []
cv_scores_deaths = []

for train_idx, val_idx in tscv.split(X_train):
    X_train_fold, X_val_fold = X_train.iloc[train_idx], X_train.iloc[val_idx]
    y_train_fold, y_val_fold = y_train.iloc[train_idx], y_train.iloc[val_idx]
    
    # Entraîner le modèle sur le fold
    cv_model.fit(X_train_fold, y_train_fold)
    
    # Prédire sur le fold de validation
    y_pred_fold = cv_model.predict(X_val_fold)
    
    # Calculer MAE pour chaque target
    mae_cases = mean_absolute_error(y_val_fold.iloc[:, 0], y_pred_fold[:, 0])
    mae_deaths = mean_absolute_error(y_val_fold.iloc[:, 1], y_pred_fold[:, 1])
    
    cv_scores_cases.append(mae_cases)
    cv_scores_deaths.append(mae_deaths)

# Afficher les résultats de cross-validation
print(f"Cross-validation MAE for new_cases: {np.mean(cv_scores_cases):.2f} (+/- {np.std(cv_scores_cases) * 2:.2f})")
print(f"Cross-validation MAE for new_deaths: {np.mean(cv_scores_deaths):.2f} (+/- {np.std(cv_scores_deaths) * 2:.2f})")
print(f"Overall CV MAE: {np.mean([np.mean(cv_scores_cases), np.mean(cv_scores_deaths)]):.2f}")

# 7. Entraîner le modèle final sur toutes les données d'entraînement
print("\n=== Final Model Training ===")
final_model = MultiOutputRegressor(RandomForestRegressor(n_estimators=100, random_state=42))
final_model.fit(X_train, y_train)

# 8. Évaluer sur les données de test
y_pred = final_model.predict(X_test)
mae_test = mean_absolute_error(y_test, y_pred)
mae_test_cases = mean_absolute_error(y_test.iloc[:, 0], y_pred[:, 0])
mae_test_deaths = mean_absolute_error(y_test.iloc[:, 1], y_pred[:, 1])

print(f"Test MAE for new_cases: {mae_test_cases:.2f}")
print(f"Test MAE for new_deaths: {mae_test_deaths:.2f}")
print(f"Overall Test MAE: {mae_test:.2f}")

# Comparaison CV vs Test
print("\n=== Model Performance Comparison ===")
print(f"CV MAE vs Test MAE for new_cases: {np.mean(cv_scores_cases):.2f} vs {mae_test_cases:.2f}")
print(f"CV MAE vs Test MAE for new_deaths: {np.mean(cv_scores_deaths):.2f} vs {mae_test_deaths:.2f}")

# 9. Analyse des features importantes
print("\n=== Feature Importance Analysis ===")
feature_names = features
for i, target in enumerate(target_cols):
    print(f"\nTop features for {target}:")
    importances = final_model.estimators_[i].feature_importances_
    feature_importance = sorted(zip(feature_names, importances), key=lambda x: x[1], reverse=True)
    for feature, importance in feature_importance:
        print(f"  {feature}: {importance:.4f}")

# 10. Generate future dates every 7 days
future_dates = pd.date_range(start='2025-06-22', end='2026-06-22', freq='7D')

# 11. Prepare future data for all countries
future_rows = []
for country in encoder.classes_:
    country_encoded = encoder.transform([country])[0]
    for date in future_dates:
        future_rows.append({
            'country_encoded': country_encoded,
            'year': date.year,
            'month': date.month,
            'week': date.isocalendar()[1],
            'day_of_week': date.weekday(),
            'country': country,
            'date': date
        })

df_future = pd.DataFrame(future_rows)

# 12. Predict new cases and new deaths for future dates
X_future = df_future[features]
future_new_preds = final_model.predict(X_future)
df_future['predicted_new_cases'] = future_new_preds[:, 0]
df_future['predicted_new_deaths'] = future_new_preds[:, 1]

# 13. Calculate cumulative totals using last known totals from end of 2022
# Find the last available date per country before 2023-01-01
last_dates = train_df.groupby('country')['date'].max().reset_index()

# Merge to get last known totals per country at the last date in 2022
last_known_totals = pd.merge(train_df, last_dates, how='inner', on=['country', 'date'])

# Keep only relevant columns and set index
last_known_totals = last_known_totals.set_index('country')[['total_cases', 'total_deaths']]

# Fill missing values with zero
last_known_totals = last_known_totals.fillna(0)

# Initialize total_cases and total_deaths columns in future DataFrame
df_future['predicted_total_cases'] = 0.0
df_future['predicted_total_deaths'] = 0.0

# Iterate over each country to accumulate totals
for country in encoder.classes_:
    country_mask = df_future['country'] == country
    future_country_df = df_future.loc[country_mask].sort_values('date').copy()

    total_cases = last_known_totals.at[country, 'total_cases'] if country in last_known_totals.index else 0
    total_deaths = last_known_totals.at[country, 'total_deaths'] if country in last_known_totals.index else 0

    total_cases_list = []
    total_deaths_list = []

    for _, row in future_country_df.iterrows():
        total_cases += row['predicted_new_cases']
        total_deaths += row['predicted_new_deaths']

        total_cases_list.append(total_cases)
        total_deaths_list.append(total_deaths)

    df_future.loc[country_mask, 'predicted_total_cases'] = total_cases_list
    df_future.loc[country_mask, 'predicted_total_deaths'] = total_deaths_list

df_future['predicted_new_cases'] = df_future['predicted_new_cases'].round().astype(int)
df_future['predicted_new_deaths'] = df_future['predicted_new_deaths'].round().astype(int)
df_future['predicted_total_cases'] = df_future['predicted_total_cases'].round().astype(int)
df_future['predicted_total_deaths'] = df_future['predicted_total_deaths'].round().astype(int)

# 14. Save predictions
output_cols = [
    'country', 'date',
    'predicted_new_cases', 'predicted_total_cases',
    'predicted_new_deaths', 'predicted_total_deaths'
]
os.makedirs('predictions', exist_ok=True)
df_future[output_cols].to_csv('predictions/future_predictions_covid.csv', index=False)

print("\nFuture predictions saved to 'predictions/future_predictions_covid.csv'")

# 15. Sauvegarder les métriques de validation
metrics_summary = {
    'cv_mae_new_cases': np.mean(cv_scores_cases),
    'cv_mae_new_deaths': np.mean(cv_scores_deaths),
    'cv_mae_overall': np.mean([np.mean(cv_scores_cases), np.mean(cv_scores_deaths)]),
    'test_mae_new_cases': mae_test_cases,
    'test_mae_new_deaths': mae_test_deaths,
    'test_mae_overall': mae_test,
    'cv_std_new_cases': np.std(cv_scores_cases),
    'cv_std_new_deaths': np.std(cv_scores_deaths)
}

metrics_df = pd.DataFrame([metrics_summary])
metrics_df.to_csv('predictions/model_metrics.csv', index=False)
print("Model metrics saved to 'predictions/model_metrics.csv'")