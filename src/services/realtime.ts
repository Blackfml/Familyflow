import { io, Socket } from "socket.io-client";

type StateUpdateHandler = (data: any) => void;
type NotificationHandler = (data: any) => void;

class RealtimeService {
  private socket: Socket | null = null;
  private stateHandler?: StateUpdateHandler;
  private notificationHandler?: NotificationHandler;

  connect(token: string) {
    this.socket = io(import.meta.env.VITE_API_URL || undefined, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
    });

    this.socket.on("connect", () => console.log("Realtime connected"));
    this.socket.on("state_update", (data) => this.stateHandler?.(data));
    this.socket.on("notification", (data) => this.notificationHandler?.(data));
    this.socket.on("disconnect", () => console.log("Realtime disconnected"));
  }

  onStateUpdate(handler: StateUpdateHandler) { this.stateHandler = handler; }
  onNotification(handler: NotificationHandler) { this.notificationHandler = handler; }

  disconnect() { this.socket?.disconnect(); }
}

export const realtimeService = new RealtimeService();
