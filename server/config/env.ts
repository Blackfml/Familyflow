import dotenv from "dotenv";
import path from "path";

dotenv.config();

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    console.warn(`⚠️  Missing environment variable: ${key}. Using default.`);
    return "";
  }
  return value;
}

export const env = {
  GEMINI_API_KEY: requireEnv("GEMINI_API_KEY"),
  FIREBASE_SERVICE_ACCOUNT: process.env.FIREBASE_SERVICE_ACCOUNT || "",
  APP_URL: process.env.APP_URL || "http://localhost:3000",
  JWT_SECRET: process.env.JWT_SECRET || "familyflow-dev-secret",
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || "compact-petal-zdckx",
  FIRESTORE_DATABASE_ID: process.env.FIRESTORE_DATABASE_ID || "ai-studio-familyflow-943ecba4-7e23-4db0-82c0-37ca5da3706f",
  FIRESTORE_COLLECTION_PREFIX: process.env.FIRESTORE_COLLECTION_PREFIX || "familyflow_",
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "3000", 10),
};
