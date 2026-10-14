const path = require("path");
const { initializeApp, getApps, getApp, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore, FieldValue, Timestamp } = require("firebase-admin/firestore");
const { getStorage } = require("firebase-admin/storage");

const serviceAccount = require(path.join(__dirname, "serviceAccountKey.json"));

const app = getApps().length ? getApp() : initializeApp({ credential: cert(serviceAccount) });

const db = getFirestore(app);
try {
  db.settings({ ignoreUndefinedProperties: true }); // skip undefined fields instead of throwing
} catch {
  /* settings were already applied */
}
const auth = getAuth(app);

// Compatibility layer: the controllers use the older style
// (admin.firestore.FieldValue, admin.storage().bucket(...)), so keep that working.
const admin = {
  app,
  firestore: Object.assign(() => db, { FieldValue, Timestamp }),
  auth: () => auth,
  storage: () => getStorage(app),
};

module.exports = { admin, db, auth, FieldValue, Timestamp };