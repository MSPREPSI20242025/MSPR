import os
import pandas as pd
from sklearn.model_selection import train_test_split

input_folder = 'filtered/'
output_folder = 'split/'

os.makedirs(output_folder, exist_ok=True)

filenames = ['data1_filtered.csv', 'data2_filtered.csv', 'data3_filtered.csv']

for filename in filenames:
    file_path = os.path.join(input_folder, filename)
    df = pd.read_csv(file_path)

    train_df, test_df = train_test_split(df, test_size=0.4, random_state=42)

    name_without_ext = os.path.splitext(filename)[0]
    train_path = os.path.join(output_folder, f'{name_without_ext}_train.csv')
    test_path = os.path.join(output_folder, f'{name_without_ext}_test.csv')

    train_df.to_csv(train_path, index=False)
    test_df.to_csv(test_path, index=False)

