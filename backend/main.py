from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib  # or use `pickle` if you prefer
import numpy as np
import pandas as pd

# Load your model
MODEL_PATH = "fourth_model.pkl"
model = joblib.load(MODEL_PATH)

# Define FastAPI app
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Replace with your frontend's URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define input data structure
class PredictionRequest(BaseModel):
    Magnitude: float
    Longitude: float
    Latitude: float

# Endpoint to predict
@app.post("/predict/")
async def predict(data: PredictionRequest):
    try:
        # Create a DataFrame from the input data
        new_data_point = pd.DataFrame({
            'Magnitude': [data.Magnitude],
            'Longitude': [data.Longitude],
            'Latitude': [data.Latitude]
        })

        # Make a prediction
        prediction = model.predict(new_data_point)

        # Return prediction
        return {"Predicted Depth": prediction[0]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Prediction failed: {str(e)}")