require("dotenv").config();
const { initializeApp } = require("firebase-admin/app");
const admin = require("firebase-admin");
const { getFirestore } = require("firebase-admin/firestore");
const serviceAccount = require("../claveSDK/fluttergewete-firebase-adminsdk-syr4r-02a2f56b6f.json");

initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = getFirestore();
module.exports = { db };