import express from "express";
import http from "http";
import path from "path";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

import { env } from "./server/config/env";
import { initFirebase } from "./server/config/firebase";
import { stateService } from "./server/services/state.service";
import { fcmService } from "./server/services/fcm.service";
import { monitoringService } from "./server/services/monitoring.service";
import { errorHandler } from "./server/middleware/errorHandler";
import { rateLimiter } from "./server/middleware/rateLimiter";
import routes from "./server/routes";
import { setupAIEndpoints } from "./server/ai";
import { setupRealtimeServer } from "./server/services/realtime.service";

const app = express();
app.use(cors({ origin: env.APP_URL, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(rateLimiter(200, 60000));

// Metrics recording
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    monitoringService.recordMetric("response_time", duration, {
      endpoint: req.path,
      method: req.method,
      status: String(res.statusCode),
    });
  });
  next();
});

// Initialize Firebase
initFirebase();
fcmService.init();

// Load state from Firestore + local file
stateService.load().then(() => {
  console.log("FamilyFlow state loaded successfully.");
});

// Health check
app.get("/health", (req, res) => {
  const health = monitoringService.checkHealth();
  res.status(health.status === "healthy" ? 200 : 503).json(health);
});

app.get("/api/metrics", (req, res) => {
  const name = req.query.name as string | undefined;
  const minutes = req.query.minutes ? parseInt(req.query.minutes as string, 10) : undefined;
  res.json({ metrics: monitoringService.getMetrics(name, minutes) });
});

// API routes
app.use("/api", routes);

// AI routes (Gemini) — registered after authMiddleware in routes
setupAIEndpoints(routes);

// Error handler (must be last)
app.use(errorHandler);

// Vite + Static
const PORT = env.PORT;

async function startServer() {
  const httpServer = http.createServer(app);
  setupRealtimeServer(httpServer);

  if (env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`FamilyFlow server listening at http://0.0.0.0:${PORT}`);
  });
}

startServer();
