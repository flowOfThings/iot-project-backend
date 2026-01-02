const mongoose = require("mongoose");

const sensorSchema = new mongoose.Schema({
  timestamp: Number,
  temperature: Number,
  humidity: Number
});

module.exports = mongoose.model("Sensor", sensorSchema);