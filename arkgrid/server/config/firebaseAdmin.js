const admin = require("firebase-admin");
const { getApps } = require("firebase-admin/app");

function loadServiceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;

  if (raw && raw.trim()) {
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      throw new Error(
        "FIREBASE_SERVICE_ACCOUNT is set but is not valid JSON. Paste the full contents of the service account key file on a single line."
      );
    }
    // Fix escaped newlines in the private key
    if (parsed.private_key) {
      parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");
    }
    return parsed;
  }

  // Local development only
  try {
    return require("./serviceAccountKey.json");
  } catch (e) {
    throw new Error(
      "No Firebase credentials found. Set FIREBASE_SERVICE_ACCOUNT in the Render Environment tab, or add serviceAccountKey.json locally."
    );
  }
}

if (getApps().length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(loadServiceAccount()),
  });
}

module.exports = admin;