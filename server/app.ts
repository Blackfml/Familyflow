import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import { env } from "./config/env";
import { initFirebase } from "./config/firebase";
import { stateService } from "./services/state.service";
import { fcmService } from "./services/fcm.service";
import { monitoringService } from "./services/monitoring.service";
import { errorHandler } from "./middleware/errorHandler";
import { rateLimiter } from "./middleware/rateLimiter";
import routes from "./routes";
import { setupAIEndpoints } from "./ai";

const app = express();
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (origin.includes("vercel.app")) return cb(null, true);
    cb(null, true);
  },
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(rateLimiter(200, 60000));

app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    monitoringService.recordMetric("response_time", Date.now() - start, {
      endpoint: req.path, method: req.method, status: String(res.statusCode),
    });
  });
  next();
});

initFirebase();
fcmService.init();
stateService.load().then(() => console.log("FamilyFlow state loaded."));

app.get("/health", (req, res) => {
  const health = monitoringService.checkHealth();
  res.status(health.status === "healthy" ? 200 : 503).json(health);
});
app.get("/api/metrics", (req, res) => {
  const name = req.query.name as string | undefined;
  const minutes = req.query.minutes ? parseInt(req.query.minutes as string, 10) : undefined;
  res.json({ metrics: monitoringService.getMetrics(name, minutes) });
});
app.use("/api", routes);
setupAIEndpoints(routes);
app.use(errorHandler);

export default app;
