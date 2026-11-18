import joblib
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score

# Dataset load
df = pd.read_csv("data/wsn_landslide_data.csv")

# Input and target
X = df.drop("Label", axis=1)
y = df["Label"]

# Training and testing data
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

print("Training AI model...")

# Random Forest model
model = RandomForestClassifier(
    n_estimators=100,
    random_state=42
)

# Train model
model.fit(X_train, y_train)

print("Model training completed!")

# Prediction
y_pred = model.predict(X_test)

# Accuracy
accuracy = accuracy_score(y_test, y_pred)

print()
print("Model Accuracy:")
print(f"{accuracy * 100:.2f}%")

# Save trained model
joblib.dump(model, "model/landslide_model.pkl")

print()
print("Model saved successfully!")