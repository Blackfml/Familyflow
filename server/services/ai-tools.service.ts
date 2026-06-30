import { taskService } from "./task.service";
import { goalService } from "./goal.service";
import { habitService } from "./habit.service";
import { shoppingService } from "./shopping.service";
import { chatService } from "./chat.service";
import { stateService } from "./state.service";

const FAMILY_ID = "default";

export interface AITool {
  name: string;
  description: string;
  parameters: Record<string, any>;
  execute: (args: any) => Promise<any>;
}

const tools: AITool[] = [
  {
    name: "createTask",
    description: "Creates a new task for the family",
    parameters: {
      title: { type: "string", required: true },
      description: { type: "string", required: false },
      responsible: { type: "string", required: false },
      priority: { type: "string", required: false, enum: ["Baixa", "Média", "Alta", "Urgente"] },
      category: { type: "string", required: false },
      date: { type: "string", required: false },
    },
    async execute(args: any) {
      const userName = args.userName || "IA";
      const task = await taskService.create(FAMILY_ID, args, "ai-agent", userName);
      return { message: `Tarefa "${task.title}" criada com sucesso`, task };
    },
  },
  {
    name: "completeTask",
    description: "Marks a task as completed",
    parameters: {
      taskId: { type: "string", required: true },
    },
    async execute(args: any) {
      const userName = args.userName || "IA";
      const task = await taskService.update(FAMILY_ID, args.taskId, { status: "Concluído" }, userName);
      return { message: `Tarefa "${task.title}" concluída`, task };
    },
  },
  {
    name: "deleteTask",
    description: "Removes a task",
    parameters: {
      taskId: { type: "string", required: true },
    },
    async execute(args: any) {
      await taskService.remove(FAMILY_ID, args.taskId);
      return { message: "Tarefa removida" };
    },
  },
  {
    name: "getTasks",
    description: "Lists tasks with optional filters",
    parameters: {
      status: { type: "string", required: false },
      responsible: { type: "string", required: false },
    },
    async execute(args: any) {
      const tasks = await taskService.list(FAMILY_ID, args);
      return { tasks, count: tasks.length };
    },
  },
  {
    name: "createGoal",
    description: "Creates a new goal",
    parameters: {
      title: { type: "string", required: true },
      description: { type: "string", required: false },
      targetAmount: { type: "number", required: false },
      deadline: { type: "string", required: false },
      category: { type: "string", required: false },
    },
    async execute(args: any) {
      const userName = args.userName || "IA";
      const goal = await goalService.create(FAMILY_ID, args, userName);
      return { message: `Meta "${goal.title}" criada`, goal };
    },
  },
  {
    name: "updateGoalProgress",
    description: "Updates goal progress by setting current amount",
    parameters: {
      goalId: { type: "string", required: true },
      currentAmount: { type: "number", required: true },
    },
    async execute(args: any) {
      const goal = await goalService.update(FAMILY_ID, args.goalId, { currentAmount: args.currentAmount });
      return { message: `Progresso da meta "${goal.title}" atualizado para ${goal.progress}%`, goal };
    },
  },
  {
    name: "toggleHabit",
    description: "Toggles a habit for today",
    parameters: {
      habitId: { type: "string", required: true },
      dateStr: { type: "string", required: true },
      completed: { type: "boolean", required: true },
    },
    async execute(args: any) {
      const userName = args.userName;
      const habit = await habitService.toggle(FAMILY_ID, args.habitId, args.dateStr, args.completed, userName);
      return { message: `Hábito "${habit.title}" ${args.completed ? "marcado" : "desmarcado"}`, habit };
    },
  },
  {
    name: "getHabitStreak",
    description: "Gets streak info for a habit",
    parameters: {
      habitId: { type: "string", required: true },
    },
    async execute(args: any) {
      const state = stateService.get();
      const habit = state.habits.find(h => h.id === args.habitId);
      if (!habit) return { error: "Hábito não encontrado" };
      return { title: habit.title, streak: habit.streak };
    },
  },
  {
    name: "addShoppingItem",
    description: "Adds an item to the shopping list",
    parameters: {
      name: { type: "string", required: true },
      quantity: { type: "number", required: false },
      cost: { type: "number", required: false },
      responsible: { type: "string", required: false },
    },
    async execute(args: any) {
      const userName = args.userName || "IA";
      const item = await shoppingService.upsert(FAMILY_ID, args, userName);
      return { message: `Item "${item.name}" adicionado à lista`, item };
    },
  },
  {
    name: "checkShoppingItem",
    description: "Marks a shopping item as purchased",
    parameters: {
      itemId: { type: "string", required: true },
    },
    async execute(args: any) {
      await shoppingService.toggle(FAMILY_ID, args.itemId, true);
      return { message: "Item marcado como comprado" };
    },
  },
  {
    name: "sendFamilyMessage",
    description: "Sends a message to the family group chat",
    parameters: {
      content: { type: "string", required: true },
    },
    async execute(args: any) {
      const userName = args.userName || "IA";
      const message = await chatService.sendGroupMessage(FAMILY_ID, userName, args.content);
      return { message: "Mensagem enviada ao chat", groupMessage: message };
    },
  },
  {
    name: "getWorkloadBalance",
    description: "Analyzes workload distribution among family members",
    parameters: {},
    async execute() {
      const state = stateService.get();
      const pending = state.tasks.filter(t => t.status !== "Concluído");
      const distribution: Record<string, number> = {};
      pending.forEach(t => {
        distribution[t.responsible] = (distribution[t.responsible] || 0) + 1;
      });
      const userNames = Object.keys(state.users);
      const analysis = userNames.map(name => ({
        name,
        pendingTasks: distribution[name] || 0,
        points: state.users[name]?.points || 0,
      }));
      return { analysis, totalPending: pending.length };
    },
  },
  {
    name: "reorganizeSchedule",
    description: "Suggests task reordering based on priority and balance",
    parameters: {},
    async execute() {
      const state = stateService.get();
      const pending = state.tasks.filter(t => t.status !== "Concluído");
      const priorityOrder: Record<string, number> = { Urgente: 0, Alta: 1, Média: 2, Baixa: 3 };
      const sorted = [...pending].sort((a, b) => (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2));
      return {
        suggestion: sorted.map((t, i) => `${i + 1}. ${t.title} (${t.responsible}) - ${t.priority}`),
        sorted,
      };
    },
  },
  {
    name: "generateWeeklyReport",
    description: "Generates a weekly summary of completed tasks, habits, and progress",
    parameters: {},
    async execute() {
      const state = stateService.get();
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
      const completed = state.tasks.filter(t => t.status === "Concluído" && t.updatedAt && t.updatedAt >= weekAgo);
      const pending = state.tasks.filter(t => t.status !== "Concluído");
      const topHabits = [...state.habits].sort((a, b) => b.streak - a.streak).slice(0, 5);
      const summary = {
        completedTasks: completed.length,
        pendingTasks: pending.length,
        topHabits: topHabits.map(h => ({ title: h.title, streak: h.streak })),
        userPoints: Object.fromEntries(Object.entries(state.users).map(([name, u]) => [name, u.points])),
      };
      return summary;
    },
  },
];

export const aiToolsService = {
  getTools(): AITool[] {
    return tools;
  },

  getTool(name: string): AITool | undefined {
    return tools.find(t => t.name === name);
  },

  async execute(name: string, args: any): Promise<any> {
    const tool = this.getTool(name);
    if (!tool) {
      throw new Error(`Tool "${name}" not found`);
    }
    return tool.execute(args);
  },

  getToolDescriptions(): string {
    return tools.map(t => {
      const params = Object.entries(t.parameters)
        .map(([k, v]: [string, any]) => `  - ${k} (${v.required ? "required" : "optional"}): ${v.type}${v.enum ? ` [${v.enum.join(", ")}]` : ""}`)
        .join("\n");
      return `## ${t.name}\n${t.description}\nParameters:\n${params || "  (none)"}`;
    }).join("\n\n");
  },

  async detectIntent(prompt: string): Promise<{ tool: string; args: any } | null> {
    const lower = prompt.toLowerCase();

    if (lower.includes("criar") && (lower.includes("tarefa") || lower.includes("tarefas"))) {
      const title = prompt.replace(/criar\s+a?\s*tarefa\s*/i, "").trim();
      return { tool: "createTask", args: { title: title || "Nova tarefa" } };
    }
    if ((lower.includes("completar") || lower.includes("concluir")) && lower.includes("tarefa")) {
      const state = stateService.get();
      const pending = state.tasks.filter(t => t.status !== "Concluído");
      if (pending.length === 1) {
        return { tool: "completeTask", args: { taskId: pending[0].id } };
      }
      return null;
    }
    if (lower.includes("deletar") && lower.includes("tarefa")) {
      return { tool: "deleteTask", args: { taskId: "" } };
    }
    if (lower.includes("tarefa") || lower.includes("fazer")) {
      return { tool: "getTasks", args: {} };
    }
    if (lower.includes("criar") && (lower.includes("meta") || lower.includes("poupança"))) {
      const title = prompt.replace(/criar\s+a?\s*meta\s*/i, "").trim();
      return { tool: "createGoal", args: { title: title || "Nova meta" } };
    }
    if (lower.includes("progresso") || (lower.includes("meta") && lower.includes("atualizar"))) {
      return { tool: "updateGoalProgress", args: {} };
    }
    if (lower.includes("hábito") || lower.includes("habito") || lower.includes("rotina")) {
      return { tool: "getHabitStreak", args: {} };
    }
    if (lower.includes("compras") || lower.includes("shopping") || lower.includes("lista")) {
      return { tool: "addShoppingItem", args: {} };
    }
    if (lower.includes("mensagem") || lower.includes("chat") || lower.includes("dizer")) {
      return { tool: "sendFamilyMessage", args: { content: prompt } };
    }
    if (lower.includes("sobrecarregado") || lower.includes("carga") || lower.includes("workload") || lower.includes("distribuição")) {
      return { tool: "getWorkloadBalance", args: {} };
    }
    if (lower.includes("reorganizar") || lower.includes("ordenar") || lower.includes("sugerir")) {
      return { tool: "reorganizeSchedule", args: {} };
    }
    if (lower.includes("semanal") || lower.includes("semana") || lower.includes("relatório") || lower.includes("report")) {
      return { tool: "generateWeeklyReport", args: {} };
    }

    return null;
  },
};
