const { initializeApp, getApps, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const {
  getFirestore,
  FieldValue,
  Timestamp,
} = require("firebase-admin/firestore");

function normalize(sa) {
  if (sa.private_key) {
    sa.private_key = sa.private_key.replace(/\\n/g, "\n").trim();
  }
  const missing = ["project_id", "client_email", "private_key"].filter(
    (k) => !sa[k]
  );
  if (missing.length) {
    throw new Error("Service account is missing: " + missing.join(", "));
  }
  return sa;
}

function loadServiceAccount() {
  // Option 1: base64 (recommended on Render)
  if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    const json = Buffer.from(
      process.env.FIREBASE_SERVICE_ACCOUNT_BASE64.trim(),
      "base64"
    ).toString("utf8");
    return normalize(JSON.parse(json));
  }

  // Option 2: raw JSON
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (raw && raw.trim()) {
    let parsed = JSON.parse(raw.trim());
    if (typeof parsed === "string") parsed = JSON.parse(parsed);
    return normalize(parsed);
  }

  // Option 3: local development only
  return normalize(require("./serviceAccountKey.json"));
}

if (getApps().length === 0) {
  initializeApp({ credential: cert(loadServiceAccount()) });
}

// Compatibility layer so existing code using admin.auth(), admin.firestore(),
// admin.firestore.FieldValue, admin.firestore.Timestamp keeps working
const firestore = () => getFirestore();
firestore.FieldValue = FieldValue;
firestore.Timestamp = Timestamp;

const admin = {
  auth: () => getAuth(),
  firestore,
  credential: { cert },
};

try {
  const { getMessaging } = require("firebase-admin/messaging");
  admin.messaging = () => getMessaging();
} catch (e) {}

try {
  const { getStorage } = require("firebase-admin/storage");
  admin.storage = () => getStorage();
} catch (e) {}

module.exports = admin;