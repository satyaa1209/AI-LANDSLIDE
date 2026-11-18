import joblib
import pandas as pd
import numpy as np
import os

MODEL_PATH = r"C:\xampp\htdocs\landslide_warning\model\landslide_model.pkl"

model = joblib.load(MODEL_PATH)

features = [
    'Rainfall_mm', 'Slope_Angle', 'Soil_Saturation',
    'Vegetation_Cover', 'Rainfall_3Day', 'Rainfall_7Day',
    'Aspect', 'Elevation_m', 'NDVI_Index',
    'Land_Use_Urban', 'Land_Use_Forest', 'Land_Use_Agriculture',
    'Earthquake_Activity', 'Proximity_to_Water',
    'Distance_to_Road_m', 'Temperature_C', 'Humidity_percent',
    'Soil_pH', 'Clay_Content', 'Sand_Content', 'Silt_Content',
    'Soil_Erosion_Rate', 'Historical_Landslide_Count',
    'Soil_Type_Gravel', 'Soil_Type_Sand', 'Soil_Type_Silt',
    'Soil_Type_Clay', 'Pore_Water_Pressure_kPa',
    'Soil_Moisture_Content', 'Microseismic_Activity',
    'Acoustic_Emission_dB', 'Soil_Strain',
    'Soil_Temperature_C', 'TDR_Reflection_Index'
]

def make_input(rainfall, slope, soil):

    return {
        "Rainfall_mm": rainfall,
        "Slope_Angle": slope,
        "Soil_Saturation": soil,
        "Vegetation_Cover": 50,
        "Rainfall_3Day": rainfall,
        "Rainfall_7Day": rainfall,
        "Aspect": 180,
        "Elevation_m": 500,
        "NDVI_Index": 0.5,
        "Land_Use_Urban": 0,
        "Land_Use_Forest": 1,
        "Land_Use_Agriculture": 0,
        "Earthquake_Activity": 0,
        "Proximity_to_Water": 500,
        "Distance_to_Road_m": 1000,
        "Temperature_C": 25,
        "Humidity_percent": 70,
        "Soil_pH": 7,
        "Clay_Content": 30,
        "Sand_Content": 40,
        "Silt_Content": 30,
        "Soil_Erosion_Rate": 2,
        "Historical_Landslide_Count": 1,
        "Soil_Type_Gravel": 0,
        "Soil_Type_Sand": 1,
        "Soil_Type_Silt": 0,
        "Soil_Type_Clay": 0,
        "Pore_Water_Pressure_kPa": 20,
        "Soil_Moisture_Content": soil,
        "Microseismic_Activity": 0,
        "Acoustic_Emission_dB": 20,
        "Soil_Strain": 0.1,
        "Soil_Temperature_C": 22,
        "TDR_Reflection_Index": 0.8
    }

best = None

for rainfall in range(50, 301, 10):
    for slope in range(30, 91, 5):
        for soil in range(30, 101, 5):

            data = make_input(rainfall, slope, soil)
            df = pd.DataFrame([data], columns=features)

            probability = model.predict_proba(df)[0]

            classes = model.classes_

            prob_dict = {
                int(c): float(p)
                for c, p in zip(classes, probability)
            }

            landslide = prob_dict.get(1, 0) * 100

            if best is None or landslide > best[0]:
                best = (landslide, rainfall, slope, soil)

            if landslide >= 70:
                print("\n================================")
                print("HIGH RISK INPUT FOUND")
                print("================================")
                print("Rainfall:", rainfall, "mm")
                print("Slope:", slope, "degrees")
                print("Soil Saturation:", soil, "%")
                print("Landslide Probability:", round(landslide, 2), "%")
                print("Risk: HIGH")
                print("================================")
                raise SystemExit

print("\nNo HIGH input found in tested range.")
print("Best combination:")
print("Rainfall:", best[1])
print("Slope:", best[2])
print("Soil Saturation:", best[3])
print("Probability:", round(best[0], 2), "%")