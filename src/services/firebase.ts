import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";

const FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDJLdksOtCZJZNNy-famUGUgQJ_2BxqCb4",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "compact-petal-zdckx.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "compact-petal-zdckx",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "compact-petal-zdckx.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "347308256598",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:347308256598:web:e38dff58d78a38c4defaf7",
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (!app) {
    app = initializeApp(FIREBASE_CONFIG);
  }
  return app;
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    auth = getAuth(getFirebaseApp());
  }
  return auth;
}
