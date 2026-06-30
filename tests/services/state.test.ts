import { describe, it, expect } from "vitest";

interface UserProfile {
  id: string;
  name: string;
  points: number;
  level: number;
  streak: number;
}

interface FamilyState {
  users: Record<string, UserProfile>;
  tasks: any[];
  goals: any[];
  habits: any[];
  shoppingList: any[];
  calendarEvents: any[];
  history: any[];
  notifications: any[];
  chatHistory: any[];
  groupChat: any[];
  lastWeeklyMeetingSummary: string;
}

function getInitialState(): FamilyState {
  return {
    users: {},
    tasks: [],
    goals: [],
    habits: [],
    shoppingList: [],
    calendarEvents: [],
    history: [],
    notifications: [],
    chatHistory: [{
      id: "chat-1",
      role: "model",
      content: "Olá! Sou o FamilyFlow AI",
      timestamp: new Date().toISOString(),
    }],
    groupChat: [],
    lastWeeklyMeetingSummary: "",
  };
}

function createStateManager(initial: FamilyState = getInitialState()) {
  let state = { ...initial, users: { ...initial.users }, tasks: [...initial.tasks] };

  return {
    get: () => state,
    reset: () => {
      state = getInitialState();
      return state;
    },
    addUser: (name: string, user: UserProfile) => {
      state.users[name] = user;
    },
    removeUser: (name: string) => {
      delete state.users[name];
    },
    getUser: (name: string) => state.users[name],
    getUsers: () => Object.values(state.users),
    addTask: (task: any) => {
      state.tasks.push(task);
    },
    removeTask: (id: string) => {
      state.tasks = state.tasks.filter(t => t.id !== id);
    },
    updateUserPoints: (name: string, points: number) => {
      if (state.users[name]) {
        state.users[name].points += points;
      }
    },
  };
}

describe("State Service", () => {
  describe("initial state", () => {
    it("creates initial state with all required keys", () => {
      const state = getInitialState();
      expect(state.users).toEqual({});
      expect(state.tasks).toEqual([]);
      expect(state.goals).toEqual([]);
      expect(state.habits).toEqual([]);
      expect(state.shoppingList).toEqual([]);
      expect(state.calendarEvents).toEqual([]);
      expect(state.history).toEqual([]);
      expect(state.notifications).toEqual([]);
      expect(state.chatHistory).toHaveLength(1);
      expect(state.groupChat).toEqual([]);
      expect(state.lastWeeklyMeetingSummary).toBe("");
    });

    it("initial chat history contains AI welcome message", () => {
      const state = getInitialState();
      expect(state.chatHistory[0].role).toBe("model");
      expect(state.chatHistory[0].content).toContain("FamilyFlow");
    });
  });

  describe("CRUD operations", () => {
    it("adds a user", () => {
      const mgr = createStateManager();
      mgr.addUser("João", { id: "u1", name: "João", points: 0, level: 1, streak: 0 });
      expect(mgr.get().users["João"]).toBeDefined();
      expect(mgr.get().users["João"].name).toBe("João");
    });

    it("removes a user", () => {
      const mgr = createStateManager();
      mgr.addUser("João", { id: "u1", name: "João", points: 0, level: 1, streak: 0 });
      mgr.removeUser("João");
      expect(mgr.get().users["João"]).toBeUndefined();
    });

    it("gets a user by name", () => {
      const mgr = createStateManager();
      mgr.addUser("Maria", { id: "u2", name: "Maria", points: 100, level: 2, streak: 3 });
      const user = mgr.getUser("Maria");
      expect(user).toBeDefined();
      expect(user!.points).toBe(100);
    });

    it("returns undefined for nonexistent user", () => {
      const mgr = createStateManager();
      expect(mgr.getUser("Ghost")).toBeUndefined();
    });

    it("lists all users", () => {
      const mgr = createStateManager();
      mgr.addUser("João", { id: "u1", name: "João", points: 0, level: 1, streak: 0 });
      mgr.addUser("Maria", { id: "u2", name: "Maria", points: 0, level: 1, streak: 0 });
      expect(mgr.getUsers()).toHaveLength(2);
    });

    it("adds a task", () => {
      const mgr = createStateManager();
      const task = { id: "task-1", title: "Test", status: "A Fazer" };
      mgr.addTask(task);
      expect(mgr.get().tasks).toHaveLength(1);
      expect(mgr.get().tasks[0].title).toBe("Test");
    });

    it("removes a task", () => {
      const mgr = createStateManager();
      mgr.addTask({ id: "task-1", title: "Test" });
      mgr.removeTask("task-1");
      expect(mgr.get().tasks).toHaveLength(0);
    });

    it("updates user points", () => {
      const mgr = createStateManager();
      mgr.addUser("João", { id: "u1", name: "João", points: 50, level: 1, streak: 0 });
      mgr.updateUserPoints("João", 30);
      expect(mgr.get().users["João"].points).toBe(80);
    });
  });

  describe("reset", () => {
    it("resets to initial state", () => {
      const mgr = createStateManager();
      mgr.addUser("João", { id: "u1", name: "João", points: 50, level: 1, streak: 0 });
      mgr.addTask({ id: "task-1", title: "Test" });
      mgr.reset();
      expect(mgr.get().users).toEqual({});
      expect(mgr.get().tasks).toEqual([]);
    });
  });
});
