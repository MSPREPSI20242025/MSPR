import pandas as pd
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestRegressor
from sklearn.multioutput import MultiOutputRegressor
from sklearn.metrics import mean_absolute_error
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
train_df = df[df['date'] < '2023-01-01']
test_df = df[df['date'] >= '2023-01-01']

# 5. Define features and targets (only new cases and deaths)
features = ['country_encoded', 'year', 'month', 'week', 'day_of_week']
target_cols = ['new_cases', 'new_deaths']

X_train = train_df[features]
y_train = train_df[target_cols]

X_test = test_df[features]
y_test = test_df[target_cols]

# 6. Train model
base_model = RandomForestRegressor(n_estimators=100, random_state=42)
model = MultiOutputRegressor(base_model)
model.fit(X_train, y_train)

# 7. Evaluate on test data
y_pred = model.predict(X_test)
mae = mean_absolute_error(y_test, y_pred)
print("Mean Absolute Error on test set (new cases & new deaths):", mae)

# 8. Generate future dates every 7 days
future_dates = pd.date_range(start='2023-01-01', end='2025-12-31', freq='7D')

# 9. Prepare future data for all countries
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

# 10. Predict new cases and new deaths for future dates
X_future = df_future[features]
future_new_preds = model.predict(X_future)
df_future['predicted_new_cases'] = future_new_preds[:, 0]
df_future['predicted_new_deaths'] = future_new_preds[:, 1]

# 11. Calculate cumulative totals using last known totals from end of 2022

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

# 12. Save predictions
output_cols = [
    'country', 'date',
    'predicted_new_cases', 'predicted_total_cases',
    'predicted_new_deaths', 'predicted_total_deaths'
]
os.makedirs('predictions', exist_ok=True)
df_future[output_cols].to_csv('predictions/future_predictions_covid.csv', index=False)

print("Future predictions saved to 'predictions/future_predictions_covid.csv'")
