import dotenv from 'dotenv'
import admin from 'firebase-admin';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore'
import {serviceAccount} from '../claveSDK/adminsdk';
dotenv.config();

initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = getFirestore();
export { db }; 