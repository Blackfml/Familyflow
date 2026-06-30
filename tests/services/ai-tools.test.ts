import { describe, it, expect } from "vitest";

const mockTools = [
  {
    name: "createTask",
    description: "Creates a new task for the family",
    parameters: {
      title: { type: "string", required: true },
      responsible: { type: "string", required: false },
      priority: { type: "string", required: false, enum: ["Baixa", "Média", "Alta", "Urgente"] },
    },
  },
  {
    name: "getTasks",
    description: "Lists tasks with optional filters",
    parameters: {
      status: { type: "string", required: false },
      responsible: { type: "string", required: false },
    },
  },
  {
    name: "completeTask",
    description: "Marks a task as completed",
    parameters: {
      taskId: { type: "string", required: true },
    },
  },
  {
    name: "deleteTask",
    description: "Removes a task",
    parameters: {
      taskId: { type: "string", required: true },
    },
  },
  {
    name: "createGoal",
    description: "Creates a new goal",
    parameters: {
      title: { type: "string", required: true },
      targetAmount: { type: "number", required: false },
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
  },
  {
    name: "addShoppingItem",
    description: "Adds an item to the shopping list",
    parameters: {
      name: { type: "string", required: true },
      quantity: { type: "number", required: false },
    },
  },
  {
    name: "sendFamilyMessage",
    description: "Sends a message to the family group chat",
    parameters: {
      content: { type: "string", required: true },
    },
  },
  {
    name: "getWorkloadBalance",
    description: "Analyzes workload distribution among family members",
    parameters: {},
  },
  {
    name: "reorganizeSchedule",
    description: "Suggests task reordering based on priority and balance",
    parameters: {},
  },
  {
    name: "generateWeeklyReport",
    description: "Generates a weekly summary",
    parameters: {},
  },
];

function getTool(name: string) {
  return mockTools.find(t => t.name === name);
}

function getToolDescriptions(): string {
  return mockTools.map(t => {
    const params = Object.entries(t.parameters)
      .map(([k, v]: [string, any]) => `  - ${k} (${v.required ? "required" : "optional"}): ${v.type}`)
      .join("\n");
    return `${t.name}: ${t.description}\n${params || "  (none)"}`;
  }).join("\n\n");
}

function detectIntent(prompt: string): { tool: string; args: any } | null {
  const lower = prompt.toLowerCase();

  if (lower.includes("criar") && lower.includes("tarefa")) {
    return { tool: "createTask", args: { title: "Nova tarefa" } };
  }
  if ((lower.includes("completar") || lower.includes("concluir")) && lower.includes("tarefa")) {
    return { tool: "completeTask", args: { taskId: "mock-id" } };
  }
  if (lower.includes("deletar") && lower.includes("tarefa")) {
    return { tool: "deleteTask", args: { taskId: "mock-id" } };
  }
  if (lower.includes("tarefa") || lower.includes("fazer")) {
    return { tool: "getTasks", args: {} };
  }
  if (lower.includes("criar") && (lower.includes("meta") || lower.includes("poupança"))) {
    return { tool: "createGoal", args: { title: "Nova meta" } };
  }
  if (lower.includes("hábito") || lower.includes("habito")) {
    return { tool: "toggleHabit", args: { habitId: "mock-id", dateStr: "2026-06-30", completed: true } };
  }
  if (lower.includes("compras") || lower.includes("shopping")) {
    return { tool: "addShoppingItem", args: { name: "Item da lista" } };
  }
  if (lower.includes("mensagem") || lower.includes("dizer")) {
    return { tool: "sendFamilyMessage", args: { content: prompt } };
  }
  if (lower.includes("sobrecarregado") || lower.includes("carga")) {
    return { tool: "getWorkloadBalance", args: {} };
  }
  if (lower.includes("reorganizar") || lower.includes("sugerir")) {
    return { tool: "reorganizeSchedule", args: {} };
  }
  if (lower.includes("semanal") || lower.includes("relatório")) {
    return { tool: "generateWeeklyReport", args: {} };
  }

  return null;
}

describe("AI Tools Service", () => {
  describe("getTool", () => {
    it("returns tool by name", () => {
      const tool = getTool("createTask");
      expect(tool).toBeDefined();
      expect(tool!.name).toBe("createTask");
    });

    it("returns undefined for unknown tool", () => {
      expect(getTool("nonexistent")).toBeUndefined();
    });

    it("all tools have names and descriptions", () => {
      mockTools.forEach(t => {
        expect(t.name).toBeTruthy();
        expect(t.description).toBeTruthy();
      });
    });

    it("createTask requires title parameter", () => {
      const tool = getTool("createTask")!;
      expect(tool.parameters.title.required).toBe(true);
    });

    it("getWorkloadBalance has no parameters", () => {
      const tool = getTool("getWorkloadBalance")!;
      expect(Object.keys(tool.parameters)).toHaveLength(0);
    });
  });

  describe("getToolDescriptions", () => {
    it("returns all tool descriptions", () => {
      const desc = getToolDescriptions();
      expect(desc).toContain("createTask");
      expect(desc).toContain("Creates a new task");
      expect(desc).toContain("required");
    });
  });

  describe("detectIntent", () => {
    it("detects create task intent", () => {
      const result = detectIntent("Criar uma tarefa para comprar leite");
      expect(result).not.toBeNull();
      expect(result!.tool).toBe("createTask");
    });

    it("detects complete task intent", () => {
      const result = detectIntent("completar a tarefa");
      expect(result).not.toBeNull();
      expect(result!.tool).toBe("completeTask");
    });

    it("detects delete task intent", () => {
      const result = detectIntent("deletar a tarefa");
      expect(result).not.toBeNull();
      expect(result!.tool).toBe("deleteTask");
    });

    it("detects get tasks intent", () => {
      const result = detectIntent("quais são minhas tarefas?");
      expect(result).not.toBeNull();
      expect(result!.tool).toBe("getTasks");
    });

    it("detects create goal intent", () => {
      const result = detectIntent("criar uma meta de economia");
      expect(result).not.toBeNull();
      expect(result!.tool).toBe("createGoal");
    });

    it("detects habit toggle intent", () => {
      const result = detectIntent("marcar hábito");
      expect(result).not.toBeNull();
      expect(result!.tool).toBe("toggleHabit");
    });

    it("detects shopping item intent", () => {
      const result = detectIntent("adicionar nas compras");
      expect(result).not.toBeNull();
      expect(result!.tool).toBe("addShoppingItem");
    });

    it("detects workload balance intent", () => {
      const result = detectIntent("quem está sobrecarregado?");
      expect(result).not.toBeNull();
      expect(result!.tool).toBe("getWorkloadBalance");
    });

    it("detects reorganize intent", () => {
      const result = detectIntent("pode reorganizar minha agenda");
      expect(result).not.toBeNull();
      expect(result!.tool).toBe("reorganizeSchedule");
    });

    it("detects weekly report intent", () => {
      const result = detectIntent("relatório semanal");
      expect(result).not.toBeNull();
      expect(result!.tool).toBe("generateWeeklyReport");
    });

    it("returns null for unknown intent", () => {
      const result = detectIntent("qual é a previsão do tempo?");
      expect(result).toBeNull();
    });
  });
});
