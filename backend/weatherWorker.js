// filepath: C:\Users\saipo\OneDrive\Desktop\guideWire\backend\weatherWorker.js
require("dotenv").config();
const cron = require("node-cron");
const axios = require("axios");
const { initFirebase } = require("./firebaseService");

const db = initFirebase();
const OPENWEATHER_KEY = process.env.OPENWEATHER_KEY;
const THRESHOLD = parseFloat(process.env.RAINFALL_THRESHOLD_MM_PER_HOUR || "15");

// Example zones — replace with real rider zones
const ZONES = [
  { id: "zone-1", name: "Sector A", lat: 12.9716, lon: 77.5946 },
  { id: "zone-2", name: "Sector B", lat: 12.2958, lon: 76.6394 }
];

async function checkZone(zone) {
  try {
    const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${zone.lat}&lon=${zone.lon}&exclude=minutely,daily&units=metric&appid=${OPENWEATHER_KEY}`;
    const res = await axios.get(url);
    const hourly = res.data.hourly && res.data.hourly[0];
    const rainfall = (hourly && hourly.rain && hourly.rain["1h"]) ? hourly.rain["1h"] : 0;
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
