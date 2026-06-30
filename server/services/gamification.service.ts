import { stateService } from "./state.service";
import { notificationService } from "./notification.service";

export const BADGES = {
  EARLY_BIRD: { id: "early_bird", name: "Madrugador", description: "Completou 5 tarefas antes das 9h", icon: "🌅", threshold: 5 },
  STREAK_7: { id: "streak_7", name: "Raio de Sol", description: "Manteve streak por 7 dias", icon: "☀️", threshold: 7 },
  STREAK_30: { id: "streak_30", name: "Super Star", description: "Manteve streak por 30 dias", icon: "⭐", threshold: 30 },
  TASKS_50: { id: "tasks_50", name: "Mão na Massa", description: "Completou 50 tarefas", icon: "💪", threshold: 50 },
  TASKS_100: { id: "tasks_100", name: "Faz tudo", description: "Completou 100 tarefas", icon: "🏆", threshold: 100 },
  TEAMWORK: { id: "teamwork", name: "Parceiros", description: "Ambos completaram 20 tarefas no mês", icon: "🤝", threshold: 20 },
  ORGANIZER: { id: "organizer", name: "Organizador", description: "Criou 30 tarefas", icon: "📋", threshold: 30 },
  HABIT_MASTER: { id: "habit_master", name: "Mestre dos Hábitos", description: "Manteve 5 hábitos por 7 dias", icon: "🎯", threshold: 5 },
} as const;

export type BadgeId = keyof typeof BADGES;

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export interface UserAchievements {
  userId: string;
  badges: Badge[];
  points: number;
  level: number;
  streak: number;
  tasksCompleted: number;
  habitsCompleted: number;
  weeklyScore: number;
}

export interface PointsLog {
  points: number;
  reason: string;
  timestamp: string;
}

function getPointsForLevel(level: number): number {
  return level * level * 100;
}

function calculateLevel(points: number): number {
  let level = 1;
  while (points >= getPointsForLevel(level + 1)) {
    level++;
  }
  return Math.min(level, 50);
}

function calculatePointsForPriority(priority: string): number {
  const base = 25;
  const priorityBonus: Record<string, number> = {
    "Urgente": 30,
    "Alta": 20,
    "Média": 10,
    "Baixa": 0,
  };
  return base + (priorityBonus[priority] || 10);
}

function getWeekId(): string {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - startOfYear.getTime();
  const week = Math.ceil(diff / (7 * 24 * 60 * 60 * 1000));
  return `${now.getFullYear()}-W${String(week).padStart(2, "0")}`;
}

function getTasksCompletedThisWeek(userId: string): number {
  const state = stateService.get();
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const weekStartStr = weekStart.toISOString();
  return state.tasks.filter(t => {
    if (t.status !== "Concluído") return false;
    if (t.responsible !== "Ambos" && t.responsible !== userId) return false;
    return t.updatedAt >= weekStartStr;
  }).length;
}

function getHabitsCompletedThisWeek(userId: string): number {
  const state = stateService.get();
  const now = new Date();
  let count = 0;
  state.habits.forEach(h => {
    if (h.responsible !== "Ambos" && h.responsible !== userId) return;
    if (!h.history) return;
    Object.entries(h.history).forEach(([dateStr, completed]) => {
      if (completed) {
        const d = new Date(dateStr);
        const diff = now.getTime() - d.getTime();
        if (diff >= 0 && diff < 7 * 24 * 60 * 60 * 1000) {
          count++;
        }
      }
    });
  });
  return count;
}

export const gamificationService = {
  async awardPoints(familyId: string, user: string, points: number): Promise<void> {
    const state = stateService.get();
    const pointsLog: PointsLog = { points, reason: "points", timestamp: new Date().toISOString() };

    if (user === "Ambos") {
      Object.keys(state.users).forEach(u => {
        state.users[u].points += points;
        state.users[u].streak += 1;
        state.users[u].level = calculateLevel(state.users[u].points);
        if (!(state.users[u] as any).pointsLog) (state.users[u] as any).pointsLog = [];
        (state.users[u] as any).pointsLog.push(pointsLog);
      });
    } else if (state.users[user]) {
      state.users[user].points += points;
      state.users[user].streak += 1;
      state.users[user].level = calculateLevel(state.users[user].points);
      if (!(state.users[user] as any).pointsLog) (state.users[user] as any).pointsLog = [];
      (state.users[user] as any).pointsLog.push(pointsLog);
    }

    await stateService.save();
  },

  async awardPointsWithReason(userId: string, points: number, reason: string): Promise<void> {
    const state = stateService.get();
    const user = state.users[userId];
    if (!user) return;

    user.points += points;
    user.level = calculateLevel(user.points);
    if (!(user as any).pointsLog) (user as any).pointsLog = [];
    (user as any).pointsLog.push({ points, reason, timestamp: new Date().toISOString() });

    await stateService.save();
  },

  getLevel(points: number): number {
    return calculateLevel(points);
  },

  getWeeklyScore(userId: string): number {
    const tasks = getTasksCompletedThisWeek(userId);
    const habits = getHabitsCompletedThisWeek(userId);
    return tasks * 10 + habits * 5;
  },

  calculatePointsForPriority(priority: string): number {
    return calculatePointsForPriority(priority);
  },

  async checkAndAwardBadges(userId: string): Promise<Badge[]> {
    const state = stateService.get();
    const user = state.users[userId];
    if (!user) return [];

    const userBadges: Badge[] = (user as any).badges || [];
    const unlockedIds = new Set(userBadges.map(b => b.id));
    const newlyUnlocked: Badge[] = [];

    const taskCount = state.tasks.filter(t => {
      if (t.status !== "Concluído") return false;
      return t.responsible === userId || t.responsible === "Ambos";
    }).length;

    const createdTasks = state.tasks.filter(t => t.createdBy === userId).length;

    const activeHabits = state.habits.filter(h => {
      if (h.responsible !== userId && h.responsible !== "Ambos") return false;
      if (!h.history) return false;
      const recentDays = Object.keys(h.history).filter(k => {
        const d = new Date(k);
        const diff = Date.now() - d.getTime();
        return diff >= 0 && diff < 7 * 24 * 60 * 60 * 1000;
      });
      const completedRecent = recentDays.filter(k => h.history[k] === true).length;
      return completedRecent >= 5;
    }).length;

    const earlyTasks = state.tasks.filter(t => {
      if (t.status !== "Concluído") return false;
      if (t.responsible !== userId && t.responsible !== "Ambos") return false;
      if (!t.updatedAt) return false;
      const hour = new Date(t.updatedAt).getHours();
      return hour < 9;
    }).length;

    const badgesToCheck = [
      { badge: BADGES.EARLY_BIRD, condition: earlyTasks >= BADGES.EARLY_BIRD.threshold },
      { badge: BADGES.STREAK_7, condition: user.streak >= BADGES.STREAK_7.threshold },
      { badge: BADGES.STREAK_30, condition: user.streak >= BADGES.STREAK_30.threshold },
      { badge: BADGES.TASKS_50, condition: taskCount >= BADGES.TASKS_50.threshold },
      { badge: BADGES.TASKS_100, condition: taskCount >= BADGES.TASKS_100.threshold },
      { badge: BADGES.TEAMWORK, condition: false },
      { badge: BADGES.ORGANIZER, condition: createdTasks >= BADGES.ORGANIZER.threshold },
      { badge: BADGES.HABIT_MASTER, condition: activeHabits >= BADGES.HABIT_MASTER.threshold },
    ];

    if (BADGES.TEAMWORK) {
      const allUsers = Object.keys(state.users);
      if (allUsers.length >= 2) {
        const bothCompleted = allUsers.every(u =>
          state.tasks.filter(t => {
            if (t.status !== "Concluído") return false;
            return t.responsible === u || t.responsible === "Ambos";
          }).length >= BADGES.TEAMWORK.threshold
        );
        badgesToCheck[5].condition = bothCompleted;
      }
    }

    for (const { badge, condition } of badgesToCheck) {
      if (!unlockedIds.has(badge.id) && condition) {
        const unlocked: Badge = {
          id: badge.id,
          name: badge.name,
          description: badge.description,
          icon: badge.icon,
          unlockedAt: new Date().toISOString(),
        };
        userBadges.push(unlocked);
        newlyUnlocked.push(unlocked);

        state.notifications.unshift({
          id: `not-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          title: "Novo badge desbloqueado!",
          body: `${badge.icon} Você ganhou o badge "${badge.name}"!`,
          targetUser: "Ambos",
          type: "success",
          readBy: [],
          timestamp: new Date().toISOString(),
        });
      }
    }

    (user as any).badges = userBadges;
    await stateService.save();
    return newlyUnlocked;
  },

  async getUserAchievements(userId: string): Promise<UserAchievements> {
    const state = stateService.get();
    const user = state.users[userId];
    if (!user) {
      return {
        userId,
        badges: [],
        points: 0,
        level: 1,
        streak: 0,
        tasksCompleted: 0,
        habitsCompleted: 0,
        weeklyScore: 0,
      };
    }

    const tasksCompleted = state.tasks.filter(t => {
      if (t.status !== "Concluído") return false;
      return t.responsible === userId || t.responsible === "Ambos";
    }).length;

    const habitsCompleted = state.habits.reduce((acc, h) => {
      if (h.responsible !== userId && h.responsible !== "Ambos") return acc;
      if (!h.history) return acc;
      return acc + Object.values(h.history).filter(v => v === true).length;
    }, 0);

    return {
      userId,
      badges: (user as any).badges || [],
      points: user.points,
      level: user.level || calculateLevel(user.points),
      streak: user.streak,
      tasksCompleted,
      habitsCompleted,
      weeklyScore: this.getWeeklyScore(userId),
    };
  },

  getLeaderboard(): Array<{ userId: string; name: string; points: number; level: number }> {
    const state = stateService.get();
    return Object.entries(state.users)
      .map(([name, user]) => ({
        userId: user.id,
        name,
        points: user.points,
        level: user.level || calculateLevel(user.points),
      }))
      .sort((a, b) => b.points - a.points);
  },
};
