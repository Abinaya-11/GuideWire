// filepath: C:\Users\saipo\OneDrive\Desktop\guideWire\backend\server.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { initFirebase } = require("./firebaseService");
require("dotenv").config();

const PORT = process.env.PORT || 4000;
const db = initFirebase();
const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.get("/payouts", async (req, res) => {
  try {
    const snap = await db.collection("payouts").orderBy("createdAt", "desc").limit(100).get();
    const payouts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json(payouts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/admin/payout", async (req, res) => {
  try {
    const payload = req.body;
    payload.createdAt = new Date();
    const docRef = await db.collection("payouts").add(payload);
    res.json({ id: docRef.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
