import { Goal } from "../../src/types";
import { goalRepository } from "../repositories";
import { NotFoundError, ValidationError } from "../types/errors";

export const goalService = {
  async list(familyId: string): Promise<Goal[]> {
    return goalRepository.findByFamily(familyId);
  },

  async create(familyId: string, data: Partial<Goal>, creatorName: string): Promise<Goal> {
    if (!data.title) throw new ValidationError("Título é obrigatório");

    const now = new Date().toISOString();
    const goal: Goal = {
      id: `goal-${Date.now()}`,
      title: data.title,
      description: data.description || "",
      targetAmount: data.targetAmount,
      currentAmount: data.currentAmount || 0,
      deadline: data.deadline || now.split("T")[0],
      progress: data.targetAmount
        ? Math.round(((data.currentAmount || 0) / data.targetAmount) * 100)
        : 0,
      subtasks: data.subtasks || [],
      category: data.category || "Finanças",
      icon: data.icon || "Target",
      status: "Em Progresso",
      createdBy: creatorName,
      createdAt: now,
    };

    return goalRepository.create(familyId, goal);
  },

  async update(familyId: string, goalId: string, data: Partial<Goal>): Promise<Goal> {
    const existing = await goalRepository.findById(familyId, goalId);
    if (!existing) throw new NotFoundError("Goal", goalId);

    const updated = { ...existing, ...data };
    if (data.currentAmount !== undefined && existing.targetAmount) {
      updated.progress = Math.round((data.currentAmount / existing.targetAmount) * 100);
    }
    await goalRepository.update(familyId, goalId, updated);
    return updated;
  },

  async remove(familyId: string, goalId: string): Promise<void> {
    const existing = await goalRepository.findById(familyId, goalId);
    if (!existing) throw new NotFoundError("Goal", goalId);
    await goalRepository.remove(familyId, goalId);
  },
};
