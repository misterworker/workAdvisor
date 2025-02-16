from flask import Flask, request, jsonify
import joblib
import pandas as pd

# Initialize Flask app
app = Flask(__name__)

# Load the trained model
model = joblib.load("optimized_education_model.pkl")

@app.route("/")
def home():
    return jsonify({"message": "Education AI Model is running on Flask!"})

@app.route("/predict", methods=["POST"])
def predict():
    try:
        # Get JSON input from user
        data = request.get_json()
        
        # Convert to DataFrame
        input_data = pd.DataFrame([data])

        # Make prediction
        prediction = model.predict(input_data)[0]

        return jsonify({"prediction": prediction})

    except Exception as e:
        return jsonify({"error": str(e)})

# Run the app (for local testing)
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
