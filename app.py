from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import joblib
import os
import mysql.connector
import time


# ==========================================================
# FLASK APP
# ==========================================================

app = Flask(__name__)
CORS(app)


# ==========================================================
# MYSQL CONFIGURATION
# ==========================================================

DB_CONFIG = {
    "host": "127.0.0.1",
    "port": 3307,
    "user": "root",
    "password": "",
    "database": "landslide_warning"
}


# ==========================================================
# MYSQL GLOBALS
# ==========================================================

db = None
cursor = None


# ==========================================================
# CREATE DATABASE CONNECTION
# ==========================================================

def create_database_connection():

    return mysql.connector.connect(
        host=DB_CONFIG["host"],
        port=DB_CONFIG["port"],
        user=DB_CONFIG["user"],
        password=DB_CONFIG["password"],
        database=DB_CONFIG["database"],
        connection_timeout=10,
        autocommit=False
    )


# ==========================================================
# CONNECT DATABASE
# ==========================================================

def reconnect_database():

    global db
    global cursor

    try:

        if db is not None:

            try:

                if db.is_connected():

                    db.ping(
                        reconnect=True,
                        attempts=3,
                        delay=1
                    )

                    cursor = db.cursor()

                    return True

            except Exception:
                pass

        db = create_database_connection()
        cursor = db.cursor()

        print("MYSQL DATABASE CONNECTED SUCCESSFULLY")

        return True

    except mysql.connector.Error as e:

        print("MYSQL CONNECTION ERROR:", e)

        return False


# ==========================================================
# INITIAL DATABASE CONNECTION
# ==========================================================

print("")
print("==========================================")
print("CONNECTING TO MYSQL")
print("==========================================")

mysql_connected = False

for attempt in range(1, 11):

    print(f"MYSQL CONNECTION ATTEMPT {attempt}/10")

    if reconnect_database():

        mysql_connected = True
        break

    if attempt < 10:

        print("Retrying in 3 seconds...")
        time.sleep(3)


if not mysql_connected:

    print("WARNING: MYSQL DATABASE IS NOT AVAILABLE")


# ==========================================================
# LOAD AI MODEL
# ==========================================================

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

# ACTUAL MODEL LOCATION:
# C:\xampp\htdocs\landslide_warning\model\landslide_model.pkl

MODEL_PATH = os.path.abspath(
    os.path.join(
        BASE_DIR,
        "..",
        "model",
        "landslide_model.pkl"
    )
)


print("")
print("==========================================")
print("CHECKING AI MODEL")
print("MODEL PATH:")
print(MODEL_PATH)
print("==========================================")


if not os.path.exists(MODEL_PATH):

    raise FileNotFoundError(
        "\nlandslide_model.pkl nahi mila.\n\n"
        "Expected location:\n"
        + MODEL_PATH
        + "\n"
    )


print("MODEL FILE FOUND SUCCESSFULLY")


# ==========================================================
# LOAD MODEL
# ==========================================================

try:

    model = joblib.load(
        MODEL_PATH
    )

    print("AI MODEL LOADED SUCCESSFULLY")

except Exception as e:

    print("AI MODEL LOAD ERROR:")
    print(e)

    raise


print("==========================================")


# ==========================================================
# HOME ROUTE
# ==========================================================

@app.route("/", methods=["GET"])
def home():

    print("HOME REQUEST RECEIVED")

    return jsonify({

        "status": "running",

        "message":
            "Landslide Warning System Backend is Running!",

        "model":
            "loaded",

        "database":
            "connected"
            if reconnect_database()
            else "disconnected"

    })


# ==========================================================
# HEALTH ROUTE
# ==========================================================

@app.route("/health", methods=["GET"])
def health():

    print("HEALTH CHECK REQUEST RECEIVED")

    database_status = reconnect_database()

    return jsonify({

        "server": "running",

        "model": "loaded",

        "database":
            "connected"
            if database_status
            else "disconnected"

    })


# ==========================================================
# PREDICTION ROUTE
# ==========================================================

@app.route("/predict", methods=["POST"])
def predict():

    global db
    global cursor

    print("")
    print("==========================================")
    print("NEW PREDICTION REQUEST RECEIVED")
    print("==========================================")


    try:

        # ==================================================
        # DATABASE
        # ==================================================

        if not reconnect_database():

            print("DATABASE NOT AVAILABLE")

            return jsonify({

                "error":
                    "Database connection unavailable",

                "message":
                    "Please make sure MySQL is running."

            }), 503


        # ==================================================
        # GET JSON
        # ==================================================

        data = request.get_json(
            silent=True
        )


        print("DATA RECEIVED:")
        print(data)


        if not data:

            return jsonify({

                "error":
                    "No data received"

            }), 400


        # ==================================================
        # ENVIRONMENT VALUES
        # ==================================================

        try:

            rainfall = float(
                data.get(
                    "Rainfall_mm",
                    0
                )
            )

            slope = float(
                data.get(
                    "Slope_Angle",
                    0
                )
            )

            soil = float(
                data.get(
                    "Soil_Saturation",
                    0
                )
            )

        except (ValueError, TypeError):

            return jsonify({

                "error":
                    "Environmental values must be numeric."

            }), 400


        # ==================================================
        # LOCATION
        # ==================================================

        latitude = data.get(
            "latitude",
            None
        )

        longitude = data.get(
            "longitude",
            None
        )


        try:

            if latitude is not None and str(latitude).strip() != "":

                latitude = float(latitude)

            else:

                latitude = None


            if longitude is not None and str(longitude).strip() != "":

                longitude = float(longitude)

            else:

                longitude = None

        except (ValueError, TypeError):

            return jsonify({

                "error":
                    "Invalid latitude or longitude."

            }), 400


        # ==================================================
        # VALIDATION
        # ==================================================

        if rainfall < 0:

            return jsonify({

                "error":
                    "Rainfall cannot be negative."

            }), 400


        if slope < 0 or slope > 90:

            return jsonify({

                "error":
                    "Slope must be between 0 and 90."

            }), 400


        if soil < 0 or soil > 100:

            return jsonify({

                "error":
                    "Soil saturation must be between 0 and 100."

            }), 400


        if latitude is not None:

            if latitude < -90 or latitude > 90:

                return jsonify({

                    "error":
                        "Latitude must be between -90 and 90."

                }), 400


        if longitude is not None:

            if longitude < -180 or longitude > 180:

                return jsonify({

                    "error":
                        "Longitude must be between -180 and 180."

                }), 400


        # ==================================================
        # 34 MODEL FEATURES
        # ==================================================

        input_data = {

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


        # ==================================================
        # DATAFRAME
        # ==================================================

        input_df = pd.DataFrame(
            [input_data]
        )


        # ==================================================
        # MODEL FEATURE ORDER
        # ==================================================

        if hasattr(
            model,
            "feature_names_in_"
        ):

            expected_features = list(
                model.feature_names_in_
            )

            missing_features = [

                feature

                for feature in expected_features

                if feature not in input_df.columns

            ]


            if missing_features:

                print(
                    "MISSING FEATURES:",
                    missing_features
                )

                return jsonify({

                    "error":
                        "Model features are missing.",

                    "missing_features":
                        missing_features

                }), 500


            input_df = input_df[
                expected_features
            ]


        # ==================================================
        # AI PREDICTION
        # ==================================================

        prediction = model.predict(
            input_df
        )[0]

        


        # ==================================================
        # PROBABILITY
        # ==================================================

        if not hasattr(
            model,
            "predict_proba"
        ):

            return jsonify({

                "error":
                    "Model does not support probability prediction."

            }), 500


        probability = model.predict_proba(
            input_df
        )[0]


        classes = model.classes_


        probability_dict = {

            int(cls):
                float(prob)

            for cls, prob in zip(
                classes,
                probability
            )

        }


        landslide_probability = (

            probability_dict.get(
                1,
                0
            ) * 100

        )


        no_landslide_probability = (

            probability_dict.get(
                0,
                0
            ) * 100

        )


        # ==================================================
        # RISK
        # ==================================================

        if landslide_probability >= 70:

            risk = "HIGH"

        elif landslide_probability >= 40:

            risk = "MEDIUM"

        else:

            risk = "LOW"


        # ==================================================
        # TERMINAL OUTPUT
        # ==================================================

        print("")
        print("==========================================")
        print("LANDSLIDE PREDICTION RESULT")
        print("==========================================")

        print(
            "Latitude:",
            latitude
        )

        print(
            "Longitude:",
            longitude
        )

        print(
            "Rainfall:",
            rainfall,
            "mm"
        )

        print(
            "Slope:",
            slope,
            "degrees"
        )

        print(
            "Soil Saturation:",
            soil,
            "%"
        )

        print(
            "Prediction:",
            int(prediction)
        )

        print(
            "Landslide Probability:",
            round(
                landslide_probability,
                2
            ),
            "%"
        )

        print(
            "No Landslide Probability:",
            round(
                no_landslide_probability,
                2
            ),
            "%"
        )

        print(
            "RISK:",
            risk
        )


        # ==================================================
        # SAVE MYSQL
        # ==================================================

        try:

            cursor.execute("""

                INSERT INTO prediction_history
                (
                    rainfall,
                    slope,
                    soil_saturation,
                    landslide_probability,
                    no_landslide_probability,
                    risk,
                    prediction
                )

                VALUES
                (
                    %s,
                    %s,
                    %s,
                    %s,
                    %s,
                    %s,
                    %s
                )

            """, (

                rainfall,

                slope,

                soil,

                round(
                    landslide_probability,
                    2
                ),

                round(
                    no_landslide_probability,
                    2
                ),

                risk,

                int(prediction)

            ))


            db.commit()


            print(
                "PREDICTION SAVED TO MYSQL SUCCESSFULLY"
            )


        except mysql.connector.Error as db_error:

            print(
                "MYSQL SAVE ERROR:",
                db_error
            )


            try:

                db.rollback()

            except Exception:
                pass


        print("==========================================")
        print("PREDICTION COMPLETED")
        print("==========================================")
        print("")


        # ==================================================
        # RESPONSE
        # ==================================================

        return jsonify({

            "success": True,

            "prediction":
                int(prediction),

            "risk":
                risk,

            "landslide_probability":
                round(
                    landslide_probability,
                    2
                ),

            "no_landslide_probability":
                round(
                    no_landslide_probability,
                    2
                ),

            "latitude":
                latitude,

            "longitude":
                longitude

        }), 200


    except mysql.connector.Error as e:

        print(
            "MYSQL ERROR:",
            e
        )

        return jsonify({

            "error":
                "Database connection error",

            "message":
                str(e)

        }), 500


    except Exception as e:

        print("")
        print("==========================================")
        print("PREDICTION ERROR")
        print("==========================================")
        print(e)
        print("==========================================")
        print("")

        return jsonify({

            "error":
                "Prediction failed",

            "message":
                str(e)

        }), 500


# ==========================================================
# HISTORY API
# ==========================================================

@app.route("/history", methods=["GET"])
def history():

    print("HISTORY REQUEST RECEIVED")

    try:

        if not reconnect_database():

            return jsonify({

                "error":
                    "Database unavailable"

            }), 503


        cursor.execute("""

            SELECT
                id,
                rainfall,
                slope,
                soil_saturation,
                landslide_probability,
                no_landslide_probability,
                risk,
                prediction,
                created_at

            FROM prediction_history

            ORDER BY id DESC

        """)


        records = cursor.fetchall()


        history_data = []


        for row in records:

            history_data.append({

                "id":
                    int(row[0]),

                "rainfall":
                    float(row[1]),

                "slope":
                    float(row[2]),

                "soil_saturation":
                    float(row[3]),

                "landslide_probability":
                    float(row[4]),

                "no_landslide_probability":
                    float(row[5]),

                "risk":
                    str(row[6]),

                "prediction":
                    int(row[7]),

                "created_at":
                    str(row[8])

            })


        print(
            "HISTORY RECORDS:",
            len(history_data)
        )


        return jsonify(
            history_data
        )


    except Exception as e:

        print(
            "HISTORY ERROR:",
            e
        )

        return jsonify({

            "error":
                "Unable to fetch prediction history",

            "message":
                str(e)

        }), 500


# ==========================================================
# START SERVER
# ==========================================================

if __name__ == "__main__":

    print("")
    print("==========================================")
    print("LANDSLIDE WARNING SYSTEM")
    print("FLASK SERVER STARTING")
    print("==========================================")

    print(
        "Backend URL: http://127.0.0.1:5000"
    )

    print(
        "Prediction API: http://127.0.0.1:5000/predict"
    )

    print(
        "History API: http://127.0.0.1:5000/history"
    )

    print(
        "Health API: http://127.0.0.1:5000/health"
    )

    print("")
    print("Press CTRL+C to stop server.")
    print("")


    app.run(
        host="127.0.0.1",
        port=5000,
        debug=False,
        threaded=True
    )
    # ==========================================================
# START FLASK SERVER
# ==========================================================

if __name__ == "__main__":

    print("")
    print("==========================================")
    print("LANDSLIDE WARNING SYSTEM")
    print("FLASK SERVER STARTING")
    print("==========================================")

    print("Backend URL: http://127.0.0.1:5000")
    print("Prediction API: http://127.0.0.1:5000/predict")
    print("History API: http://127.0.0.1:5000/history")
    print("Health API: http://127.0.0.1:5000/health")

    print("")
    print("Starting Flask...")
    print("")

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=False,
        threaded=True
    )