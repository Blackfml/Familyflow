import { Request, Response, NextFunction } from "express";
import { env } from "../config/env";

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token && env.NODE_ENV === "development") {
    (req as any).userId = "dev-user";
    (req as any).userName = "Dev";
    return next();
  }

  if (!token) {
    res.status(401).json({ error: "Token não fornecido", code: "NO_TOKEN" });
    return;
  }

  try {
    const jwt = require("jsonwebtoken");
    const decoded = jwt.verify(token, env.JWT_SECRET) as any;
    (req as any).userId = decoded.uid;
    (req as any).userName = decoded.name;
    next();
  } catch (err) {
    res.status(401).json({ error: "Token inválido ou expirado", code: "INVALID_TOKEN" });
  }
}
