import os
import pandas as pd


input_folder = 'filtered/'
output_folder = 'split/'

os.makedirs(output_folder, exist_ok=True)

filenames = ['data1_filtered.csv', 'data2_filtered.csv', 'data3_filtered.csv']

for filename in filenames:
    file_path = os.path.join(input_folder, filename)
    df = pd.read_csv(file_path)

    df['date'] = pd.to_datetime(df['date'])

    df = df.sort_values(by='date')
    split_index = int(0.6 * len(df))

    train_df = df.iloc[:split_index]
    test_df = df.iloc[split_index:]

    name_without_ext = os.path.splitext(filename)[0]
    train_path = os.path.join(output_folder, f'{name_without_ext}_train.csv')
    test_path = os.path.join(output_folder, f'{name_without_ext}_test.csv')

    train_df.to_csv(train_path, index=False)
    test_df.to_csv(test_path, index=False)