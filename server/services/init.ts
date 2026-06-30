import { env } from "../config/env";
import { initFirebase } from "../config/firebase";
import { stateService } from "./state.service";
import { fcmService } from "./fcm.service";

let initialized = false;

export async function ensureInit() {
  if (initialized) return;
  initialized = true;

  try { initFirebase(); } catch (e) { console.warn("Firebase init skipped:", (e as Error)?.message); }
  try { fcmService.init(); } catch (e) { console.warn("FCM init skipped:", (e as Error)?.message); }
  try { await stateService.load(); } catch (e) { console.warn("State load skipped:", (e as Error)?.message); }

  console.log("FamilyFlow services initialized");
}
