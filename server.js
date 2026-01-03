const mongoose = require("mongoose");
const Sensor = require("./models/Sensor");

require('dotenv').config();

const port = process.env.PORT || 4000;

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("✅ Connected to MongoDB Atlas"))
.catch(err => console.error("MongoDB connection error:", err));

const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

// Quick log to confirm env variable
console.log("JWT_SECRET from env:", process.env.JWT_SECRET);

let latestData = {};

// Helper: check if timestamp is fresh
function isTimestampValid(timestamp) {
  const now = Math.floor(Date.now() / 1000); // current epoch in seconds
  const maxAge = 3; // allow up to n seconds difference
  return Math.abs(now - timestamp) <= maxAge;
}

// Example schema
const SensorSchema = new mongoose.Schema({
  value: Number,
  timestamp: { type: Date, default: Date.now }
});
const Sensor = mongoose.model("Sensor", SensorSchema);

// Route to get latest sensor data
app.get("/api/sensor/latest", async (req, res) => {
  try {
    const latest = await Sensor.findOne().sort({ timestamp: -1 });
    if (!latest) {
      return res.status(404).json({ message: "No sensor data found" });
    }
    res.json(latest);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/sensor", async(req, res) => {
  try {
    const decoded = jwt.verify(req.body.token, process.env.JWT_SECRET);
    const sensor = new Sensor({
      timestamp: decoded.timestamp,
      temperature: decoded.temperature,
      humidity: decoded.humidity
    });

    // Save to MongoDB
    await sensor.save();

    res.json({ success: true, data: sensor });
  } catch (err) {
    console.error("Error saving sensor data:", err);
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

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));