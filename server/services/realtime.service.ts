import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import { authService } from "./auth.service";

let io: SocketIOServer | null = null;

export function setupRealtimeServer(httpServer: HTTPServer) {
  io = new SocketIOServer(httpServer, {
    cors: { origin: "*" },
    pingInterval: 30000,
    pingTimeout: 10000,
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Unauthorized"));
    try {
      const payload = authService.verifyToken(token);
      (socket as any).user = payload;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", (socket as any).user?.name);
    socket.on("disconnect", () => console.log("Client disconnected"));
  });

  return io;
}

export function getIO(): SocketIOServer {
  if (!io) throw new Error("Socket.IO not initialized");
  return io;
}

export function broadcastStateUpdate(data: any) {
  io?.emit("state_update", data);
}

export function sendNotification(userId: string, notification: any) {
  io?.emit("notification", notification);
}
