import { Request, Response } from "express";
import { chatService } from "../services/chat.service";
import { stateService } from "../services/state.service";

const DEFAULT_FAMILY = "default";

export const chatController = {
  async sendGroupMessage(req: Request, res: Response) {
    try {
      const { sender, content } = req.body;
      const message = await chatService.sendGroupMessage(DEFAULT_FAMILY, sender, content);
      res.json({ message: "Mensagem enviada!", messageData: message, state: stateService.get() });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },
};
