import requests
import pandas as pd

# Dataset se ek sample row
df = pd.read_csv("data/wsn_landslide_data.csv")

sample = df.drop("Label", axis=1).iloc[0].to_dict()

# Flask API ko data bhejna
response = requests.post(
    "http://127.0.0.1:5000/predict",
    json=sample
)

print("Status Code:", response.status_code)
print("Prediction Result:")
print(response.json())