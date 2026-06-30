import { getApps, getApp, initializeApp, cert } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import { env } from "../config/env";

let initialized = false;

function isInitialized(): boolean {
  try {
    return getApps().length > 0;
  } catch {
    return false;
  }
}

export const fcmService = {
  init(): void {
    if (initialized) return;
    try {
      const raw = env.FIREBASE_SERVICE_ACCOUNT;
      if (!raw) {
        console.warn("FCM: FIREBASE_SERVICE_ACCOUNT not set, push disabled");
        return;
      }
      const serviceAccount = JSON.parse(raw);
      if (getApps().length === 0) {
        initializeApp({ credential: cert(serviceAccount) });
      }
      initialized = true;
      console.log("FCM initialized successfully");
    } catch (err: any) {
      console.warn("FCM init failed:", err.message);
    }
  },

  async sendToDevice(token: string, payload: { title: string; body: string; data?: Record<string, string> }): Promise<void> {
    try {
      if (!isInitialized()) return;
      await getMessaging().send({
        token,
        notification: { title: payload.title, body: payload.body },
        data: payload.data || {},
      });
    } catch (err: any) {
      console.warn("FCM sendToDevice failed:", err.message);
    }
  },

  async sendToDevices(tokens: string[], payload: { title: string; body: string; data?: Record<string, string> }): Promise<void> {
    try {
      if (!isInitialized()) return;
      const messages = tokens.map(token => ({
        token,
        notification: { title: payload.title, body: payload.body },
        data: payload.data || {},
      }));
      await getMessaging().sendEach(messages);
    } catch (err: any) {
      console.warn("FCM sendToDevices failed:", err.message);
    }
  },

  async sendToTopic(topic: string, payload: { title: string; body: string; data?: Record<string, string> }): Promise<void> {
    try {
      if (!isInitialized()) return;
      await getMessaging().send({
        topic,
        notification: { title: payload.title, body: payload.body },
        data: payload.data || {},
      });
    } catch (err: any) {
      console.warn("FCM sendToTopic failed:", err.message);
    }
  },

  async subscribeToTopic(token: string, topic: string): Promise<void> {
    try {
      if (!isInitialized()) return;
      await getMessaging().subscribeToTopic(token, topic);
    } catch (err: any) {
      console.warn("FCM subscribeToTopic failed:", err.message);
    }
  },

  async unsubscribeFromTopic(token: string, topic: string): Promise<void> {
    try {
      if (!isInitialized()) return;
      await getMessaging().unsubscribeFromTopic(token, topic);
    } catch (err: any) {
      console.warn("FCM unsubscribeFromTopic failed:", err.message);
    }
  },
};
