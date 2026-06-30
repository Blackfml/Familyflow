import { Request, Response } from "express";
import { taskService } from "../services/task.service";
import { stateService } from "../services/state.service";

const DEFAULT_FAMILY = "default";

export const taskController = {
  async list(req: Request, res: Response) {
    const tasks = await taskService.list(DEFAULT_FAMILY, req.query as any);
    res.json(tasks);
  },

  async create(req: Request, res: Response) {
    const userName = (req as any).userName || req.body.createdBy || "Usuário";
    const task = await taskService.create(DEFAULT_FAMILY, req.body, (req as any).userId, userName);
    res.json({ message: "Tarefa criada", task, state: stateService.get() });
  },

  async update(req: Request, res: Response) {
    const userName = (req as any).userName || "Usuário";
    const task = await taskService.update(DEFAULT_FAMILY, req.params.id, req.body, userName);
    res.json({ message: "Tarefa atualizada", task, state: stateService.get() });
  },

  async remove(req: Request, res: Response) {
    await taskService.remove(DEFAULT_FAMILY, req.params.id);
    res.json({ message: "Tarefa removida", state: stateService.get() });
  },
};
