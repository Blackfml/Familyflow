import { Task } from "../../src/types";
import { taskRepository } from "../repositories";
import { NotFoundError, ValidationError } from "../types/errors";
import { gamificationService } from "./gamification.service";
import { notificationService } from "./notification.service";

const TASK_PRIORITY_POINTS: Record<string, number> = {
  "Baixa": 10,
  "Média": 25,
  "Alta": 50,
  "Urgente": 80,
};

export const taskService = {
  async list(familyId: string, filters?: { status?: string; responsible?: string }): Promise<Task[]> {
    let tasks = await taskRepository.findByFamily(familyId);
    if (filters?.status) tasks = tasks.filter(t => t.status === filters.status);
    if (filters?.responsible) tasks = tasks.filter(t => t.responsible === filters.responsible);
    return tasks;
  },

  async create(familyId: string, data: Partial<Task>, userId: string, userName: string): Promise<Task> {
    if (!data.title) throw new ValidationError("Título é obrigatório");

    const now = new Date().toISOString();
    const task: Task = {
      id: `task-${Date.now()}`,
      title: data.title,
      description: data.description || "",
      responsible: data.responsible || "Ambos",
      createdBy: data.createdBy || userName,
      category: data.category || "Geral",
      date: data.date || now.split("T")[0],
      time: data.time,
      durationEstimate: data.durationEstimate || 30,
      cost: data.cost || 0,
      priority: data.priority || "Média",
      color: data.color || "#3B82F6",
      icon: data.icon || "CheckSquare",
      checklist: data.checklist || [],
      attachments: data.attachments || [],
      status: data.status || "A Fazer",
      recurrence: data.recurrence || "Nenhuma",
      tags: data.tags || [],
      percentCompleted: 0,
      createdAt: now,
      updatedAt: now,
    };

    const saved = await taskRepository.create(familyId, task);

    await notificationService.notifyNewTask(familyId, task, userName);

    return saved;
  },

  async update(familyId: string, taskId: string, data: Partial<Task>, userName: string): Promise<Task> {
    const existing = await taskRepository.findById(familyId, taskId);
    if (!existing) throw new NotFoundError("Tarefa", taskId);

    const now = new Date().toISOString();
    const updated: Task = { ...existing, ...data, updatedAt: now };

    if (data.status === "Concluído" && existing.status !== "Concluído") {
      updated.percentCompleted = 100;
      const points = TASK_PRIORITY_POINTS[updated.priority] || 10;
      await gamificationService.awardPoints(familyId, updated.responsible, points);
      await notificationService.notifyTaskCompleted(familyId, updated, points);
    }

    await taskRepository.update(familyId, taskId, updated);
    return updated;
  },

  async remove(familyId: string, taskId: string): Promise<void> {
    const existing = await taskRepository.findById(familyId, taskId);
    if (!existing) throw new NotFoundError("Tarefa", taskId);
    await taskRepository.remove(familyId, taskId);
  },
};
