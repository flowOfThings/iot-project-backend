const mongoose = require("mongoose");
const Sensor = require("./models/Sensor");

mongoose.connect("mongodb+srv://karrit_db_user:BH8dykqJRbGiK13Z@clusterdemo.m1piqiq.mongodb.net/iotdb?retryWrites=true&w=majority&appName=ClusterDemo")
.then(() => console.log("✅ Connected to MongoDB Atlas"))
.catch(err => console.error("MongoDB connection error:", err));

const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();
const port = 4000;

app.use(express.json());

const jwtKey = "your_secret_key"; // must match ESP8266 jwtKey
let latestData = {};

// Helper: check if timestamp is fresh
function isTimestampValid(timestamp) {
  const now = Math.floor(Date.now() / 1000); // current epoch in seconds
  const maxAge = 20; // allow up to n seconds difference
  return Math.abs(now - timestamp) <= maxAge;
}

app.post("/api/sensor", async (req, res) => {
  try {
    // Verify JWT from ESP8266 payload
    const decoded = jwt.verify(req.body.token, jwtKey);

    // Create a new sensor document
    const sensor = new Sensor({
      timestamp: decoded.timestamp,
      temperature: decoded.temperature,
      humidity: decoded.humidity
    });

    // Save to MongoDB Atlas
    await sensor.save();

    res.json({ status: "ok", data: decoded });
  } catch (err) {
    console.error("Error saving sensor:", err);
    res.status(401).json({ error: "Invalid token or save failed" });
  }
});

app.get('/api/sensor', async (req, res) => {
  try {
    // Find the latest 50 readings, sorted by timestamp descending
    const sensors = await Sensor.find().sort({ timestamp: -1 }).limit(50);
    res.json(sensors);
  } catch (err) {
    console.error("Error fetching sensor data:", err);
    res.status(500).json({ error: "Failed to fetch sensor data" });
  }
});

app.get("/api/test-insert", async (req, res) => {
  try {
    const sensor = new Sensor({
      timestamp: Math.floor(Date.now() / 1000),
      temperature: 21.5,
      humidity: 60
    });

    await sensor.save();
    res.json({ status: "ok", message: "Dummy sensor data saved!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});