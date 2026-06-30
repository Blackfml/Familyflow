import express from "express";
import http from "http";
import path from "path";
import dotenv from "dotenv";
dotenv.config();
import app from "./server/app";
import { env } from "./server/config/env";
import { setupRealtimeServer } from "./server/services/realtime.service";

const PORT = env.PORT;

async function startServer() {
  const httpServer = http.createServer(app);
  setupRealtimeServer(httpServer);

  if (env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
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
