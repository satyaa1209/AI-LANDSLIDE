import pandas as pd
from sklearn.model_selection import train_test_split

# Dataset load
df = pd.read_csv("data/wsn_landslide_data.csv")

# Input features
X = df.drop("Label", axis=1)

# Target
y = df["Label"]

# Training = 80%, Testing = 20%
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

print("Data split successfully!")

print()
print("Training data:")
print("X_train:", X_train.shape)
print("y_train:", y_train.shape)

print()
print("Testing data:")
print("X_test:", X_test.shape)
print("y_test:", y_test.shape)