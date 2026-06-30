import { Router } from "express";
import { aiController } from "../controllers/ai.controller";

export function setupAIEndpoints(router: Router) {
  router.post("/gemini/chat", aiController.chat);
  router.post("/gemini/chat/stream", aiController.chatStream);
  router.get("/gemini/mode", aiController.getMode);
  router.post("/gemini/mode", aiController.setMode);
  router.post("/gemini/reorganize", aiController.reorganize);
  router.post("/gemini/analyze-workload", aiController.analyzeWorkload);
  router.post("/gemini/weekly-meeting", aiController.weeklyMeeting);
}
