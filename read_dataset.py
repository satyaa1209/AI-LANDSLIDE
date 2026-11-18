import pandas as pd

file_path = "data/wsn_landslide_data.csv"

df = pd.read_csv(file_path)

print("Dataset successfully loaded!")
print()
print("Rows and Columns:")
print(df.shape)

print()
print("Column Names:")
print(df.columns.tolist())

print()
print("First 5 Rows:")
print(df.head())
print()
print("Label values:")
print(df["Label"].value_counts())

print()
print("Label unique values:")
print(df["Label"].unique())

print()
print("Sample data for Label 0:")
print(df[df["Label"] == 0].head())

print()
print("Sample data for Label 1:")
print(df[df["Label"] == 1].head())