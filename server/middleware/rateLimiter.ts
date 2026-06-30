import { Request, Response, NextFunction } from "express";

const requestCounts = new Map<string, { count: number; resetAt: number }>();

export function rateLimiter(maxRequests = 100, windowMs = 60000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const now = Date.now();
    const record = requestCounts.get(ip);

    if (!record || now > record.resetAt) {
      requestCounts.set(ip, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    if (record.count >= maxRequests) {
      res.status(429).json({
        error: "Muitas requisições. Tente novamente em instantes.",
        code: "RATE_LIMITED",
      });
      return;
    }

    record.count++;
    next();
  };
}
