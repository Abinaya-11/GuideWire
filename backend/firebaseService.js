// filepath: C:\Users\saipo\OneDrive\Desktop\guideWire\backend\firebaseService.js
const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

function createMockFirestore() {
  const store = { payouts: [] };
  return {
    collection(name) {
      const rows = store[name] || (store[name] = []);
      return {
        orderBy() {
          return this;
        },
        limit() {
          return this;
        },
        async get() {
          const sorted = [...rows].sort(
            (a, b) => (b.createdAt?.getTime?.() || 0) - (a.createdAt?.getTime?.() || 0)
          );
          return {
            docs: sorted.slice(0, 100).map((data, i) => ({
              id: data.__id || `row-${i}`,
              data: () => {
                const { __id, ...rest } = data;
                return rest;
              }
            }))
          };
        },
        async add(payload) {
          const id = `local-${Date.now()}`;
          rows.unshift({ ...payload, __id: id });
          return { id };
        }
      };
    }
  };
}

function initFirebase() {
  const svcPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || "./serviceAccountKey.json";
  const resolved = path.resolve(svcPath);
  if (!fs.existsSync(resolved)) {
    console.warn(
      "[firebaseService] No service account at %s — using in-memory store for local dev.",
      resolved
    );
    return createMockFirestore();
  }
  const serviceAccount = require(resolved);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID
  });
  return admin.firestore();
}

module.exports = { initFirebase };
