import os
import subprocess
import zipfile

# Dossier de destination des fichiers
DOWNLOAD_PATH = os.path.expanduser("./downloads")

# Mapping des fichiers ZIP et des dossiers de destination
datasets = {
    "WHO-COVID-19-global-data.csv": {
        "url": "https://srhdpeuwpubsa.blob.core.windows.net/whdh/COVID/WHO-COVID-19-global-data.csv",
        "extract_to": "raw_data"
    },
    
    # "covid19-global-dataset.zip": {
    #     "url": "https://www.kaggle.com/api/v1/datasets/download/josephassaker/covid19-global-dataset",
    #     "extract_to": "data1"
    # },
    # "corona-virus-report.zip": {
    #     "url": "https://www.kaggle.com/api/v1/datasets/download/imdevskp/corona-virus-report",
    #     "extract_to": "data2"
    # },
    # "mpox-monkeypox-data.zip": {
    #     "url": "https://www.kaggle.com/api/v1/datasets/download/utkarshx27/mpox-monkeypox-data",
    #     "extract_to": "data3"
    # }
}

def download_and_extract():
    os.makedirs(DOWNLOAD_PATH, exist_ok=True)

    for filename, info in datasets.items():
        file_path = os.path.join(DOWNLOAD_PATH, filename)
        extract_path = os.path.abspath(info["extract_to"])

        # Make sure the extract path exists
        os.makedirs(extract_path, exist_ok=True)

        print(f"Download of {filename}")
        command = f'curl -L -o "{file_path}" "{info["url"]}"'
        subprocess.run(command, shell=True, check=True)
        print(f"{filename} downloaded.\n")

        # # Extract the ZIP file
        # print(f"Extraction of {filename} to {extract_path}")
        # with zipfile.ZipFile(file_path, 'r') as zip_ref:
        #     zip_ref.extractall(extract_path)
        # print(f" Extraction done.")

        os.rename(file_path, os.path.join(extract_path, filename))
        print(f"{filename} moved.\n")

if __name__ == "__main__":
    download_and_extract()
