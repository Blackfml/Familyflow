import { getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import fs from "fs";
import path from "path";
import { env } from "./env";

let db: Firestore | null = null;

export function initFirebase(): Firestore {
  if (db) return db;

  try {
    const apps = getApps();
    if (apps.length === 0) {
      initializeApp({ projectId: env.FIREBASE_PROJECT_ID });
      console.log(`Firebase Admin initialized with project: ${env.FIREBASE_PROJECT_ID}`);
    }
  } catch (err: any) {
    console.error("Firebase Admin init failed:", err.message);
  }

  try {
    db = getFirestore(null as any, env.FIRESTORE_DATABASE_ID);
    console.log(`Connected to Firestore: ${env.FIRESTORE_DATABASE_ID}`);
  } catch (err: any) {
    console.warn("Firestore connection failed:", err.message);
  }

  return db!;
}

export function getDb(): Firestore {
  if (!db) return initFirebase();
  return db;
}
