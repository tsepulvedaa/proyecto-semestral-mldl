import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import { marker } from "leaflet";

const App = () => {
  const [magnitude, setMagnitude] = useState("");
  const [prediction, setPrediction] = useState(null);
  const [markerPosition, setMarkerPosition] = useState([-33.456, -70.648]); // Default: Santiago, Chile
  const [error, setError] = useState(""); // For showing the warning

  const LocationMarker = () => {
    useMapEvents({
      click(event) {
        const { lat, lng } = event.latlng;
        setMarkerPosition([lat, lng]);
        //console.log("Latitud:", lat, "Longitud:", lng);
      },
    });

    return markerPosition ? <Marker position={markerPosition} /> : null;
  };

  const handlePrediction = async () => {
    // Check for invalid magnitude
    if (!magnitude || isNaN(magnitude) || parseFloat(magnitude) <= 0) {
      setError("Por favor digite un valor de magnitud válido.");
      return;
    }

    // Clear any existing error
    setError("");

    try {
      const response = await axios.post("http://localhost:8000/predict/", {
        Magnitude: parseFloat(magnitude),
        Longitude: markerPosition[1],
        Latitude: markerPosition[0],
      });
      setPrediction(response.data["Predicted Depth"]);
    } catch (error) {
      console.error("Prediction failed:", error);
    }
  };

  return (
    <div style={{ width: "100vw", height: "100vh", display: "flex", flexDirection: "column" }}>
      <div
        style={{
          textAlign: "center",
          padding: "10px",
          backgroundColor: "#f8f9fa",
          boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h1 style={{ margin: "0 0 10px", color: "rgb(33, 32, 40)" }}>Predictor de profundidad</h1>
        {error && <p style={{ color: "red", margin: "0 0 10px" }}>{error}</p>}
        <div style={{ color: "rgb(33, 32, 40)" }}>
          Latitud y longitud actuales (aprox): {markerPosition[0].toFixed(3)}, {markerPosition[1].toFixed(3)}
        </div>
        <input
          type="number"
          placeholder="Ingrese magnitud"
          value={magnitude}
          onChange={(e) => setMagnitude(e.target.value)}
          style={{ padding: "5px", marginRight: "10px", borderRadius: "4px" }}
        />
        <button
          onClick={handlePrediction}
          style={{
            padding: "5px 10px",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Predecir profundidad
        </button>
        {prediction !== null && (
          <p style={{ margin: "10px 0 0", color: "rgb(33, 32, 40)"}}>
            Profundidad predicha: {prediction.toFixed(2)} km
          </p>
        )}
      </div>
      <MapContainer
        center={markerPosition}
        zoom={7}
        style={{ flexGrow: 1 }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />
        <LocationMarker />
      </MapContainer>
    </div>
  );
};

export default App;
