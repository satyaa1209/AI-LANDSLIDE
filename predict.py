import pandas as pd
import joblib

# Trained model load
model = joblib.load("model/landslide_model.pkl")

# Dataset se ek sample input le rahe hain
df = pd.read_csv("data/wsn_landslide_data.csv")

# Label ko hata kar input features
X = df.drop("Label", axis=1)

# Pehli row ko prediction ke liye use karenge
sample = X.iloc[[0]]

# Prediction
prediction = model.predict(sample)[0]

# Probability
probability = model.predict_proba(sample)[0]

print("================================")
print("LANDSLIDE PREDICTION SYSTEM")
print("================================")

print("Predicted Label:", prediction)

print(f"Probability of No Landslide: {probability[0] * 100:.2f}%")
print(f"Probability of Landslide: {probability[1] * 100:.2f}%")

if prediction == 1:
    print()
    print("🚨 HIGH RISK: LANDSLIDE WARNING!")
else:
    print()
    print("✅ LOW RISK: No Landslide Warning")