import { Request, Response } from "express";
import { stateService } from "../services/state.service";
import { notificationService } from "../services/notification.service";

const DEFAULT_FAMILY = "default";

export const notificationController = {
  async markRead(req: Request, res: Response) {
    const { user } = req.body;
    if (user) {
      await notificationService.markAllRead(DEFAULT_FAMILY, user);
    }
    res.json({ message: "Notificações marcadas como lidas", state: stateService.get() });
  },
};
