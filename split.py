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

    split_index_90 = int(0.9 * len(df))
    df_train_val = df.iloc[:split_index_90]
    df_test = df.iloc[split_index_90:]

    split_index_80 = int(0.8 * len(df_train_val))
    df_train = df_train_val.iloc[:split_index_80]
    df_val = df_train_val.iloc[split_index_80:]

    name_without_ext = os.path.splitext(filename)[0]

    train_path = os.path.join(output_folder, f'{name_without_ext}_train.csv')
    val_path = os.path.join(output_folder, f'{name_without_ext}_val.csv')
    test_path = os.path.join(output_folder, f'{name_without_ext}_test.csv')

    df_train.to_csv(train_path, index=False)
    df_val.to_csv(val_path, index=False)
    df_test.to_csv(test_path, index=False)
