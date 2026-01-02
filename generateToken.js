const jwt = require('jsonwebtoken');
const jwtKey = "your_secret_key";

const now = Math.floor(Date.now() / 1000);
const payload = {
  timestamp: now,
  temperature: 22.5,
  humidity: 55,
  exp: now + 20
};

const token = jwt.sign(payload, jwtKey);
console.log(token);