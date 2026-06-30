import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
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

app.get("/health", (req, res) => res.json({ status: "healthy", uptime: process.uptime() }));

app.use("/api", routes);
setupAIEndpoints(routes);
app.use(errorHandler);

export default app;
