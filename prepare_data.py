import pandas as pd

# Dataset load
df = pd.read_csv("data/wsn_landslide_data.csv")

# Input features
X = df.drop("Label", axis=1)

# Target/output
y = df["Label"]

print("Dataset loaded successfully!")

print()
print("Input X shape:")
print(X.shape)

print()
print("Target y shape:")
print(y.shape)

print()
print("X columns:")
print(X.columns.tolist())

print()
print("Label distribution:")
print(y.value_counts())