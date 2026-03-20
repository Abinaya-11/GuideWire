// filepath: C:\Users\saipo\OneDrive\Desktop\guideWire\backend\weatherWorker.js
require("dotenv").config();
const cron = require("node-cron");
const axios = require("axios");
const { initFirebase } = require("./firebaseService");

const db = initFirebase();
const OPENWEATHER_KEY = process.env.OPENWEATHER_KEY;
const THRESHOLD = parseFloat(process.env.RAINFALL_THRESHOLD_MM_PER_HOUR || "15");

// 🌆 Core Chennai Service Zones
const ZONES = [
  { id: "chennai-velachery", name: "Velachery (High Flood Zone)", lat: 12.9784, lon: 80.2184 },
  { id: "chennai-adyar", name: "Adyar", lat: 13.0012, lon: 80.2565 },
  { id: "chennai-anna-nagar", name: "Anna Nagar", lat: 13.0850, lon: 80.2101 },
  { id: "chennai-t-nagar", name: "T. Nagar (Central)", lat: 13.0405, lon: 80.2337 }
];

async function checkZone(zone) {
  try {
    // Using 2.5/weather as it is free-tier friendly
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${zone.lat}&lon=${zone.lon}&units=metric&appid=${OPENWEATHER_KEY}`;
    const res = await axios.get(url);
    const rainMeta = res.data.rain;
    const rainfall = (rainMeta && rainMeta["1h"]) ? rainMeta["1h"] : 0;
    console.log(`${zone.name} rainfall (1h): ${rainfall} mm`);
    if (rainfall > THRESHOLD) {
      const payout = {
        zoneId: zone.id,
        zoneName: zone.name,
        trigger: "rainfall",
        rainfallMm: rainfall,
        amount: 50,
        createdAt: new Date(),
        status: "created"
      };
      await db.collection("payouts").add(payout);
      console.log("Payout created for", zone.name);
    }
  } catch (err) {
    console.error("Error checking zone", zone.name, err.message);
  }
}

async function runAll() {
  console.log("Running weather checks for all zones...");
  for (const z of ZONES) {
    await checkZone(z);
  }
}

runAll();
cron.schedule("5 * * * *", () => {
  runAll();
});
