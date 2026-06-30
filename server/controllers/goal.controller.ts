import { Request, Response } from "express";
import { goalService } from "../services/goal.service";
import { stateService } from "../services/state.service";

const DEFAULT_FAMILY = "default";

export const goalController = {
  async create(req: Request, res: Response) {
    try {
      const userName = (req as any).userName || req.body.createdBy || "Usuário";
      const goal = await goalService.create(DEFAULT_FAMILY, req.body, userName);
      res.json({ message: "Meta criada", goal, state: stateService.get() });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },
};
