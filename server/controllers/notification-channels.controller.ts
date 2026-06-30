import { Request, Response } from "express";
import { notificationChannelsService } from "../services/notification-channels.service";

export const notificationChannelsController = {
  async getChannels(req: Request, res: Response) {
    const { userId } = req.params;
    const channels = notificationChannelsService.getChannels(userId);
    res.json(channels);
  },

  async setChannel(req: Request, res: Response) {
    const { userId, channel, enabled } = req.body;
    if (!userId || !channel) {
      res.status(400).json({ error: "userId e channel são obrigatórios" });
      return;
    }
    notificationChannelsService.setChannel(userId, channel, enabled);
    res.json({ message: "Canal atualizado", channels: notificationChannelsService.getChannels(userId) });
  },

  async setQuietHours(req: Request, res: Response) {
    const { userId, start, end } = req.body;
    if (!userId || !start || !end) {
      res.status(400).json({ error: "userId, start e end são obrigatórios" });
      return;
    }
    notificationChannelsService.setQuietHours(userId, start, end);
    res.json({ message: "Horário de silêncio atualizado" });
  },
};
