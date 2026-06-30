import { Request, Response } from "express";
import { habitService } from "../services/habit.service";
import { stateService } from "../services/state.service";

const DEFAULT_FAMILY = "default";

export const habitController = {
  async toggle(req: Request, res: Response) {
    try {
      const { id, dateStr, completed, user } = req.body;
      if (!id || !dateStr) {
        res.status(400).json({ error: "id e dateStr são obrigatórios" });
        return;
      }
      const habit = await habitService.toggle(DEFAULT_FAMILY, id, dateStr, completed ?? true, user);
      res.json({ message: "Hábito alternado", habit, state: stateService.get() });
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  },

  async remove(req: Request, res: Response) {
    try {
      await habitService.remove(DEFAULT_FAMILY, req.params.id);
      res.json({ message: "Hábito removido", state: stateService.get() });
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  },
};
