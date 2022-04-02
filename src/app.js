const express = require('express');
const adminFirebase = require('firebase-admin');

adminFirebase.initializeApp({
  credential: adminFirebase.credential.applicationDefault(),
  databaseURL: 'https://fluttergewete.firebaseio.com'
})
const app = express();
// Setting
app.set('port', process.env.PORT || 3000);

module.exports = app;  
