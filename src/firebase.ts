import { initializeApp } from 'firebase/app';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { Analytics, getAnalytics, logEvent as firebaseLogEvent } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

export const app = initializeApp(firebaseConfig);
const analyticsInstance: Analytics | null =
  process.env.REACT_APP_USE_EMULATOR === 'true' ? null : getAnalytics(app);

export function logEvent(eventName: string, params?: Record<string, unknown>) {
  if (analyticsInstance) firebaseLogEvent(analyticsInstance, eventName, params);
}

export const db = getFirestore(app);

if (process.env.REACT_APP_USE_EMULATOR === 'true') {
  connectFirestoreEmulator(db, 'localhost', 8080);
}
