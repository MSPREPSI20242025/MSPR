import os
import pandas as pd

# Load the data with explicit UTF-8 encoding
data1 = pd.read_csv('raw_data/WHO-COVID-19-global-data.csv', encoding='utf-8')
data2 = pd.read_csv('raw_data/mpox-22-june.csv', encoding='utf-8')
# data2 = pd.read_csv('data2/full_grouped.csv')
# data3 = pd.read_csv('data3/owid-monkeypox-data.csv')

data1_final_columns = ["date", "country", "total_cases", "new_cases", "total_deaths", "new_deaths"]
data2_final_columns = ["date", "country", "total_cases", "new_cases", "total_deaths", "new_deaths"]

# Standardize column names
data1.columns = data1.columns.str.lower().str.replace(' ', '_')
data2.columns = data2.columns.str.lower().str.replace(' ', '_')


# Rename all columns to match the final columns

data1.rename(columns={
    "date_reported": "date",
    "country": "country",
    "cumulative_cases": "total_cases",
    "new_cases": "new_cases",
    "cumulative_deaths": "total_deaths",
    "new_deaths": "new_deaths"
}, inplace=True)


data2.rename(columns={
    "date": "date",
    "country": "country",
    "total_conf_cases": "total_cases",
    "new_conf_cases": "new_cases",
    "total_conf_deaths": "total_deaths",
    "new_conf_deaths": "new_deaths"
}, inplace=True)

data2['date'] = pd.to_datetime(data2['date'])

data1["Previous_Total_Cases"] = data1["total_cases"].shift(1).fillna(0)


data1.fillna(0, inplace=True)
data2.fillna(0, inplace=True)

all_datas=[]


for country, group in data1.groupby("country"):
    # Créer un fichier CSV pour chaque pays avec un nom spécifique
    os.makedirs('tempfilter', exist_ok=True)
    group.to_csv(f'tempfilter/{country}_data1_filtered.csv', index=False, encoding='utf-8')

for file_name in os.listdir('tempfilter'):
    file_path=os.path.join('tempfilter', file_name)
    try:
        dataf = pd.read_csv(file_path, delimiter=',', encoding='utf-8')
        all_datas.append(dataf)
    except Exception as e:
        print(e)

data1 = pd.concat(all_datas)
# Delete all file inside folder tempfilter & remove directory
for file_name in os.listdir('tempfilter'):
    file_path=os.path.join('tempfilter', file_name)
    os.remove(file_path)
os.rmdir('tempfilter')

data1 = data1[data1_final_columns]
data2 = data2[data2_final_columns]

data1.replace("Côte d'Ivoire", "Cote d'Ivoire", inplace=True)
data1.replace("T�rkiye", "Turkey", inplace=True)
data1.replace("Cura�ao", "Curacao", inplace=True)
data1.replace("R�union", "Reunion", inplace=True)
data1.replace("Saint Barth�lemy", "Saint Barthélemy", inplace=True)


# Save the filtered data with explicit UTF-8 encoding
os.makedirs('filtered', exist_ok=True)
data2.to_csv('filtered/mpox_filtered.csv', index=False, encoding='utf-8')
data1.to_csv('filtered/covid_filtered.csv', index=False, encoding='utf-8')
