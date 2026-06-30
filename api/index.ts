import app from "../server/app";
import { ensureInit } from "../server/services/init";

let initialized = false;

export default async function handler(req: any, res: any) {
  if (!initialized) {
    initialized = true;
    await ensureInit();
  }
  return app(req, res);
}
