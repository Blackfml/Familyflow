import { describe, it, expect } from "vitest";

const LEVEL_THRESHOLDS = [
  { minPoints: 0, level: 1 },
  { minPoints: 100, level: 2 },
  { minPoints: 300, level: 3 },
  { minPoints: 600, level: 4 },
  { minPoints: 1000, level: 5 },
  { minPoints: 1500, level: 6 },
  { minPoints: 2200, level: 7 },
  { minPoints: 3000, level: 8 },
  { minPoints: 4000, level: 9 },
  { minPoints: 5000, level: 10 },
];

function getLevel(points: number): number {
  if (points >= 5000) return 10;
  if (points >= 4000) return 9;
  if (points >= 3000) return 8;
  if (points >= 2200) return 7;
  if (points >= 1500) return 6;
  if (points >= 1000) return 5;
  if (points >= 600) return 4;
  if (points >= 300) return 3;
  if (points >= 100) return 2;
  return 1;
}

function getPointsToNextLevel(points: number): number {
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (points >= LEVEL_THRESHOLDS[i].minPoints) continue;
    return LEVEL_THRESHOLDS[i].minPoints - points;
  }
  return 0;
}

function getStreakBadge(streak: number): string {
  if (streak >= 30) return "🔥 Fogo";
  if (streak >= 14) return "⚡ Raio";
  if (streak >= 7) return "🌟 Estrela";
  if (streak >= 3) return "💧 Gota";
  return "🌱 Broto";
}

async function awardPoints(state: { users: Record<string, { points: number; streak: number }> }, user: string, points: number) {
  if (user === "Ambos") {
    Object.keys(state.users).forEach(u => {
      state.users[u].points += points;
      state.users[u].streak += 1;
    });
  } else if (state.users[user]) {
    state.users[user].points += points;
    state.users[user].streak += 1;
  }
}

describe("Gamification Service", () => {
  describe("getLevel", () => {
    it("returns level 1 for 0 points", () => {
      expect(getLevel(0)).toBe(1);
    });

    it("returns level 2 for 100 points", () => {
      expect(getLevel(100)).toBe(2);
    });

    it("returns level 3 for 300 points", () => {
      expect(getLevel(300)).toBe(3);
    });

    it("returns level 4 for 600 points", () => {
      expect(getLevel(600)).toBe(4);
    });

    it("returns level 5 for 1000 points", () => {
      expect(getLevel(1000)).toBe(5);
    });

    it("returns level 6 for 1500 points", () => {
      expect(getLevel(1500)).toBe(6);
    });

    it("returns level 7 for 2200 points", () => {
      expect(getLevel(2200)).toBe(7);
    });

    it("returns level 8 for 3000 points", () => {
      expect(getLevel(3000)).toBe(8);
    });

    it("returns level 9 for 4000 points", () => {
      expect(getLevel(4000)).toBe(9);
    });

    it("returns level 10 for 5000 points", () => {
      expect(getLevel(5000)).toBe(10);
    });

    it("returns level 10 for points above 5000", () => {
      expect(getLevel(7500)).toBe(10);
    });
  });

  describe("getPointsToNextLevel", () => {
    it("returns 100 for new user", () => {
      expect(getPointsToNextLevel(0)).toBe(100);
    });

    it("returns 200 for user at level 2 threshold", () => {
      expect(getPointsToNextLevel(100)).toBe(200);
    });

    it("returns 0 for max level", () => {
      expect(getPointsToNextLevel(5000)).toBe(0);
    });
  });

  describe("getStreakBadge", () => {
    it("returns Broto for < 3 streak", () => {
      expect(getStreakBadge(1)).toBe("🌱 Broto");
    });

    it("returns Gota for >= 3 streak", () => {
      expect(getStreakBadge(3)).toBe("💧 Gota");
    });

    it("returns Estrela for >= 7 streak", () => {
      expect(getStreakBadge(7)).toBe("🌟 Estrela");
    });

    it("returns Raio for >= 14 streak", () => {
      expect(getStreakBadge(14)).toBe("⚡ Raio");
    });

    it("returns Fogo for >= 30 streak", () => {
      expect(getStreakBadge(30)).toBe("🔥 Fogo");
    });
  });

  describe("awardPoints", () => {
    it("awards points to a single user", async () => {
      const state = { users: { João: { points: 0, streak: 0 } } };
      await awardPoints(state, "João", 50);
      expect(state.users["João"].points).toBe(50);
      expect(state.users["João"].streak).toBe(1);
    });

    it("awards points to both when user is Ambos", async () => {
      const state = { users: { João: { points: 0, streak: 0 }, Maria: { points: 0, streak: 0 } } };
      await awardPoints(state, "Ambos", 25);
      expect(state.users["João"].points).toBe(25);
      expect(state.users["Maria"].points).toBe(25);
      expect(state.users["João"].streak).toBe(1);
      expect(state.users["Maria"].streak).toBe(1);
    });

    it("does nothing for unknown user", async () => {
      const state = { users: { João: { points: 0, streak: 0 } } };
      await awardPoints(state, "Unknown", 50);
      expect(state.users["João"].points).toBe(0);
    });
  });
});
