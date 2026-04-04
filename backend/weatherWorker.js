// filepath: C:\Users\saipo\OneDrive\Desktop\guideWire\backend\weatherWorker.js
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const cron = require("node-cron");
const axios = require("axios");
const { initFirebase } = require("./firebaseService");

const db = initFirebase();
const OPENWEATHER_KEY = process.env.OPENWEATHER_KEY;
const RAIN_MM_THRESHOLD = parseFloat(process.env.RAINFALL_THRESHOLD_MM_PER_HOUR || "15");
const TEMP_C_THRESHOLD = 42;
const AQI_THRESHOLD = 300;

const ZONES = [
  { id: "chennai-velachery", name: "Velachery (High Flood Zone)", lat: 12.9784, lon: 80.2184 },
  { id: "chennai-adyar", name: "Adyar", lat: 13.0012, lon: 80.2565 },
  { id: "chennai-anna-nagar", name: "Anna Nagar", lat: 13.0850, lon: 80.2101 },
  { id: "chennai-t-nagar", name: "T. Nagar (Central)", lat: 13.0405, lon: 80.2337 }
];

/** US EPA AQI from PM2.5 (µg/m³), current conditions — used to match "AQI > 300". */
function pm25ToUSAQI(pm25) {
  if (pm25 == null || Number.isNaN(pm25)) return 0;
  const c = Math.round(pm25 * 10) / 10;
  const tiers = [
    [0, 12.0, 0, 50],
    [12.1, 35.4, 51, 100],
    [35.5, 55.4, 101, 150],
    [55.5, 150.4, 151, 200],
    [150.5, 250.4, 201, 300],
    [250.5, 350.4, 301, 400],
    [350.5, 500.4, 401, 500]
  ];
  for (const [cLow, cHigh, iLow, iHigh] of tiers) {
    if (c >= cLow && c <= cHigh) {
      return Math.round(((iHigh - iLow) / (cHigh - cLow)) * (c - cLow) + iLow);
    }
  }
  if (c > 500.4) return 500;
  return 0;
}

async function addPayoutDoc(base, extra) {
  const now = new Date();
  await db.collection("payouts").add({
    ...base,
    ...extra,
    timestamp: now,
    createdAt: now,
    status: "created"
  });
}

async function checkZone(zone) {
  if (!OPENWEATHER_KEY) {
    console.error("OPENWEATHER_KEY is not set; skip zone checks.");
    return;
  }
  const base = { zoneId: zone.id, zoneName: zone.name };

  try {
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${zone.lat}&lon=${zone.lon}&units=metric&appid=${OPENWEATHER_KEY}`;
    const weatherRes = await axios.get(weatherUrl);
    const data = weatherRes.data;
    const rainMeta = data.rain;
    const rainfall = rainMeta && rainMeta["1h"] != null ? rainMeta["1h"] : 0;
    const temp = data.main && data.main.temp != null ? data.main.temp : null;

    console.log(`${zone.name} rainfall (1h): ${rainfall} mm, temp: ${temp} °C`);

    if (rainfall > RAIN_MM_THRESHOLD) {
      await addPayoutDoc(base, {
        triggerType: "rainfall",
        trigger: `Rainfall > ${RAIN_MM_THRESHOLD}mm`,
        rainfallMm: rainfall,
        amount: 300
      });
      console.log("Payout (rainfall) created for", zone.name);
    }

    if (temp != null && temp > TEMP_C_THRESHOLD) {
      await addPayoutDoc(base, {
        triggerType: "temperature",
        trigger: `Temperature > ${TEMP_C_THRESHOLD}°C`,
        tempC: temp,
        amount: 200
      });
      console.log("Payout (temperature) created for", zone.name);
    }
  } catch (err) {
    console.error("Error checking weather for", zone.name, err.message);
  }

  try {
    const airUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${zone.lat}&lon=${zone.lon}&appid=${OPENWEATHER_KEY}`;
    const airRes = await axios.get(airUrl);
    const entry = airRes.data.list && airRes.data.list[0];
    if (!entry || !entry.components) return;
    const pm25 = entry.components.pm2_5;
    const aqi = pm25ToUSAQI(pm25);
    console.log(`${zone.name} PM2.5: ${pm25} µg/m³ → approx US AQI ${aqi}`);

    if (aqi > AQI_THRESHOLD) {
      await addPayoutDoc(base, {
        triggerType: "aqi",
        trigger: `AQI > ${AQI_THRESHOLD}`,
        aqi,
        pm25UgM3: pm25,
        amount: 150
      });
      console.log("Payout (AQI) created for", zone.name);
    }
  } catch (err) {
    console.error("Error checking air quality for", zone.name, err.message);
  }
}

async function runAll() {
  console.log("Running weather / air-quality checks for all zones...");
  for (const z of ZONES) {
    await checkZone(z);
  }
}

runAll();
cron.schedule("5 * * * *", () => {
  runAll();
});
