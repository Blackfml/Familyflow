import { Request, Response } from "express";
import { stateService } from "../services/state.service";

export const stateController = {
  get(req: Request, res: Response) {
    res.json(stateService.get());
  },

  reset(req: Request, res: Response) {
    const state = stateService.reset();
    res.json({ message: "Estado resetado", state });
  },
};
