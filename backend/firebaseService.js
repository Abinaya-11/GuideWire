// filepath: C:\Users\saipo\OneDrive\Desktop\guideWire\backend\firebaseService.js
const admin = require("firebase-admin");
const path = require("path");

function initFirebase() {
  const svcPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || "./serviceAccountKey.json";
  const serviceAccount = require(path.resolve(svcPath));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID
  });
  return admin.firestore();
}

module.exports = { initFirebase };
