import pandas as pd
from joblib import load
from sklearn.metrics import mean_absolute_error, r2_score

# 1. Configuration des chemins
test_datasets = {
    "Dataset_1": "split/data1_filtered_test.csv",
    "Dataset_2": "split/data2_filtered_test.csv"
}


# 2. Chargement des modèles Random Forest sauvegardés
def load_rf_models():
    rf_models = {}
    for ds in ["Dataset_1", "Dataset_2"]:
        model_path = f"random_forest_{ds.lower()}_final.joblib"
        try:
            rf_models[ds] = load(model_path)
            print(f"✅ Modèle chargé : {model_path}")
        except FileNotFoundError:
            print(f"❌ Fichier non trouvé : {model_path}")
    return rf_models


# 3. Évaluation sur les données de test
def evaluate_models(models):
    results = {}

    for ds_name, test_path in test_datasets.items():
        # Chargement des données de test
        test_data = pd.read_csv(test_path)
        X_test = test_data[["total_cases", "new_cases", "total_deaths", "active_cases"]]
        y_test = test_data["new_deaths"]

        # Prédiction et calcul des métriques
        if ds_name in models:
            y_pred = models[ds_name].predict(X_test)
            results[ds_name] = {
                'MAE': mean_absolute_error(y_test, y_pred),
                'R2': r2_score(y_test, y_pred)
            }

    return pd.DataFrame.from_dict(results, orient='index')


# 4. Exécution
rf_models = load_rf_models()
test_results = evaluate_models(rf_models)

# Affichage des résultats
print("\n📊 Résultats du Random Forest sur les données de test:")
print(test_results)

# Sauvegarde des résultats
test_results.to_csv("rf_test_results.csv")
print("\n💾 Résultats sauvegardés dans rf_test_results.csv")