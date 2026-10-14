const { admin } = require("./firebaseAdmin");

module.exports = () => {
  const name = process.env.FIREBASE_STORAGE_BUCKET;
  return name ? admin.storage().bucket(name) : null;
};