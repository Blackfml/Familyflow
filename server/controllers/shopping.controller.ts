import { Request, Response } from "express";
import { shoppingService } from "../services/shopping.service";
import { stateService } from "../services/state.service";

const DEFAULT_FAMILY = "default";

export const shoppingController = {
  async upsert(req: Request, res: Response) {
    try {
      const userName = (req as any).userName || req.body.createdBy || "Usuário";
      const item = await shoppingService.upsert(DEFAULT_FAMILY, req.body, userName);

      if (!req.body.id) {
        const state = stateService.get();
        state.history.unshift({
          id: `hist-${Date.now()}`,
          userName: item.createdBy,
          action: "adicionou à lista de compras",
          targetName: item.name,
          targetType: "shopping",
          timestamp: new Date().toISOString(),
        });
        await stateService.save();
      }

      res.json({ message: req.body.id ? "Item atualizado" : "Item adicionado", item, state: stateService.get() });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  async remove(req: Request, res: Response) {
    try {
      await shoppingService.remove(DEFAULT_FAMILY, req.params.id);
      res.json({ message: "Item removido", state: stateService.get() });
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  },
};
