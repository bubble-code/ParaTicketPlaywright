require("dotenv").config();
const { initializeApp } = require("firebase-admin/app");
const admin = require("firebase-admin");
const { getFirestore } = require("firebase-admin/firestore");
const serviceAccount = require("../claveSDK/adminsdk.json");

initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = getFirestore();
module.exports = { db }; 