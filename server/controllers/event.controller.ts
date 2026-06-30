import { Request, Response } from "express";
import { eventService } from "../services/event.service";
import { stateService } from "../services/state.service";

const DEFAULT_FAMILY = "default";

export const eventController = {
  async create(req: Request, res: Response) {
    try {
      const userName = (req as any).userName || req.body.createdBy || "Usuário";
      const event = await eventService.create(DEFAULT_FAMILY, req.body, userName);
      res.json({ message: "Evento adicionado", event, state: stateService.get() });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },
};
