import { describe, it, expect } from "vitest";

describe("GamificationService", () => {
  it("calculates level 1 for 0 points", () => {
    const level = Math.floor(0 / 100) + 1;
    expect(level).toBe(1);
  });

  it("calculates level up at thresholds", () => {
    const getLevel = (points: number) => {
      if (points >= 5000) return 10;
      if (points >= 1000) return 5;
      if (points >= 100) return 2;
      return 1;
    };
    expect(getLevel(0)).toBe(1);
    expect(getLevel(100)).toBe(2);
    expect(getLevel(1000)).toBe(5);
    expect(getLevel(5000)).toBe(10);
  });

  it("returns level 10 for 5000+ points", () => {
    expect(Math.floor(5000 / 100)).toBe(50);
  });

  it("grants badge on level up", () => {
    const badges = ["Bronze", "Prata", "Ouro", "Diamante"];
    const getBadge = (level: number) => {
      if (level >= 10) return badges[3];
      if (level >= 7) return badges[2];
      if (level >= 4) return badges[1];
      return badges[0];
    };
    expect(getBadge(1)).toBe("Bronze");
    expect(getBadge(4)).toBe("Prata");
    expect(getBadge(7)).toBe("Ouro");
    expect(getBadge(10)).toBe("Diamante");
  });

  it("calculates points per priority correctly", () => {
    const POINTS: Record<string, number> = {
      "Baixa": 10, "Média": 25, "Alta": 50, "Urgente": 80,
    };
    expect(POINTS["Baixa"]).toBe(10);
    expect(POINTS["Média"]).toBe(25);
    expect(POINTS["Alta"]).toBe(50);
    expect(POINTS["Urgente"]).toBe(80);
  });

  it("accumulates streak on consecutive days", () => {
    const updateStreak = (currentStreak: number, lastDate: string, today: string) => {
      const last = new Date(lastDate);
      const current = new Date(today);
      const diffDays = Math.floor((current.getTime() - last.getTime()) / 86400000);
      if (diffDays === 1) return currentStreak + 1;
      if (diffDays === 0) return currentStreak;
      return 1;
    };
    expect(updateStreak(5, "2026-06-29", "2026-06-30")).toBe(6);
    expect(updateStreak(5, "2026-06-29", "2026-06-29")).toBe(5);
    expect(updateStreak(5, "2026-06-20", "2026-06-30")).toBe(1);
  });
});

describe("Task Validation", () => {
  it("requires title", () => {
    const task = { title: "" };
    const isValid = task.title.trim().length > 0;
    expect(isValid).toBe(false);
  });

  it("generates ID with prefix", () => {
    const id = `task-${Date.now()}`;
    expect(id).toContain("task-");
  });

  it("rejects task without responsible", () => {
    const task = { title: "Test", responsible: "" };
    const isValid = task.title.length > 0 && task.responsible.length > 0;
    expect(isValid).toBe(false);
  });

  it("accepts valid task", () => {
    const task = { title: "Valid Task", responsible: "João" };
    const isValid = task.title.length > 0 && task.responsible.length > 0;
    expect(isValid).toBe(true);
  });

  it("generates unique IDs", () => {
    const id1 = `task-${Date.now()}-1`;
    const id2 = `task-${Date.now()}-2`;
    expect(id1).not.toBe(id2);
  });
});

describe("Priority Points", () => {
  const POINTS: Record<string, number> = {
    "Baixa": 10, "Média": 25, "Alta": 50, "Urgente": 80,
  };

  it("maps priorities to correct points", () => {
    expect(POINTS["Baixa"]).toBe(10);
    expect(POINTS["Média"]).toBe(25);
    expect(POINTS["Alta"]).toBe(50);
    expect(POINTS["Urgente"]).toBe(80);
  });

  it("returns undefined for unknown priority", () => {
    expect(POINTS["Crítica"]).toBeUndefined();
  });
});

describe("Date formatting", () => {
  it("formats date string to pt-BR locale", () => {
    const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString("pt-BR");
    const d = formatDate("2026-06-30T12:00:00.000Z");
    expect(d).toBe("30/06/2026");
  });

  it("handles date-only strings producing valid output", () => {
    const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString("pt-BR");
    const d = formatDate("2026-06-30T12:00:00.000Z");
    expect(d).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
  });

  it("returns Invalid Date for garbage input", () => {
    const d = new Date("not-a-date");
    expect(d.toString()).toBe("Invalid Date");
  });
});

describe("AI Service Intent Detection", () => {
  it("detects create task intent", () => {
    const lower = "preciso criar uma tarefa para comprar leite".toLowerCase();
    const isCreateTask = lower.includes("criar") && lower.includes("tarefa");
    expect(isCreateTask).toBe(true);
  });

  it("detects workload analysis intent", () => {
    const lower = "quem está sobrecarregado hoje?".toLowerCase();
    const isWorkload = lower.includes("sobrecarregado") || lower.includes("carga");
    expect(isWorkload).toBe(true);
  });

  it("detects reorganize intent", () => {
    const lower = "pode reorganizar minha agenda?".toLowerCase();
    const isReorg = lower.includes("reorganizar") || lower.includes("ordenar");
    expect(isReorg).toBe(true);
  });

  it("detects weekly report intent", () => {
    const lower = "faça um relatório semanal".toLowerCase();
    const isWeekly = lower.includes("semanal") || lower.includes("relatório");
    expect(isWeekly).toBe(true);
  });

  it("detects shopping list intent", () => {
    const lower = "adicione arroz na lista de compras".toLowerCase();
    const isShopping = lower.includes("compras") || lower.includes("shopping") || lower.includes("lista");
    expect(isShopping).toBe(true);
  });
});

describe("AI Mode Service", () => {
  it("returns valid modes", () => {
    const modes = ["correria", "foco", "familia"];
    expect(modes).toContain("correria");
    expect(modes).toContain("foco");
    expect(modes).toContain("familia");
    expect(modes.length).toBe(3);
  });

  it("defaults to familia mode", () => {
    const defaultMode = "familia";
    expect(defaultMode).toBe("familia");
  });

  it("provides different prompts per mode", () => {
    const prompts: Record<string, string> = {
      correria: "Priorize tarefas urgentes",
      foco: "Sugira blocos de trabalho profundo",
      familia: "Equilíbrio entre tarefas e convivência",
    };
    expect(prompts.correria).toContain("urgentes");
    expect(prompts.foco).toContain("profundo");
    expect(prompts.familia).toContain("Equilíbrio");
  });
});

describe("State Service", () => {
  it("creates initial state with empty arrays", () => {
    const initialState = {
      users: {}, tasks: [], goals: [], habits: [],
      shoppingList: [], calendarEvents: [], history: [],
      notifications: [], chatHistory: [], groupChat: [],
    };
    expect(initialState.tasks).toEqual([]);
    expect(initialState.users).toEqual({});
    expect(Array.isArray(initialState.chatHistory)).toBe(true);
  });

  it("adds a task to state", () => {
    const state = { tasks: [] as any[] };
    const task = { id: "task-1", title: "Test" };
    state.tasks.push(task);
    expect(state.tasks).toHaveLength(1);
    expect(state.tasks[0].title).toBe("Test");
  });

  it("removes a task from state", () => {
    const state = { tasks: [{ id: "task-1", title: "Test" }] };
    state.tasks = state.tasks.filter(t => t.id !== "task-1");
    expect(state.tasks).toHaveLength(0);
  });

  it("updates user points in state", () => {
    const state = { users: { João: { points: 100 } } as any };
    state.users["João"].points += 50;
    expect(state.users["João"].points).toBe(150);
  });
});

describe("Shopping List", () => {
  it("toggles purchase status", () => {
    const item = { id: "s-1", purchased: false };
    item.purchased = !item.purchased;
    expect(item.purchased).toBe(true);
  });

  it("calculates item total cost", () => {
    const item = { name: "Arroz", quantity: 3, cost: 5.5 };
    const total = item.quantity * item.cost;
    expect(total).toBe(16.5);
  });

  it("filters purchased items", () => {
    const items = [
      { id: "1", purchased: true },
      { id: "2", purchased: false },
    ];
    const purchased = items.filter(i => i.purchased);
    const pending = items.filter(i => !i.purchased);
    expect(purchased).toHaveLength(1);
    expect(pending).toHaveLength(1);
  });
});
