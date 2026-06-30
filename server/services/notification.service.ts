import { Task, AppNotification } from "../../src/types";
import { stateService } from "./state.service";
import { notificationChannelsService } from "./notification-channels.service";
import { fcmService } from "./fcm.service";

function getFamilyTokens(): string[] {
  const state = stateService.get();
  const tokens: string[] = [];
  Object.values(state.users).forEach((u: any) => {
    if (u.fcmTokens && Array.isArray(u.fcmTokens)) {
      tokens.push(...u.fcmTokens);
    }
  });
  return tokens;
}

export const notificationService = {
  async notifyNewTask(familyId: string, task: Task, creatorName: string): Promise<void> {
    const now = new Date().toISOString();
    const state = stateService.get();

    if (task.responsible !== "Ambos" && task.responsible !== creatorName) {
      const not: AppNotification = {
        id: `not-${Date.now()}`,
        title: "Nova tarefa para você! 📋",
        body: `${creatorName} atribuiu a tarefa: "${task.title}" para você com prioridade ${task.priority}.`,
        targetUser: task.responsible,
        type: "info",
        readBy: [],
        timestamp: now,
      };
      state.notifications.unshift(not);

      if (notificationChannelsService.shouldNotify(task.responsible, "push")) {
        await fcmService.sendToDevice(task.responsible, {
          title: not.title,
          body: not.body,
        });
      }
    }

    await stateService.save();
  },

  async notifyTaskCompleted(familyId: string, task: Task, points: number): Promise<void> {
    const now = new Date().toISOString();
    const state = stateService.get();

    const not: AppNotification = {
      id: `not-${Date.now()}`,
      title: "Tarefa Concluída! 🎉",
      body: `${task.responsible === "Ambos" ? "Vocês" : task.responsible} concluiu a tarefa: "${task.title}". (+${points} pts!)`,
      targetUser: "Ambos",
      type: "success",
      readBy: [],
      timestamp: now,
    };
    state.notifications.unshift(not);

    const tokens = getFamilyTokens();
    if (tokens.length > 0) {
      await fcmService.sendToDevices(tokens, {
        title: not.title,
        body: not.body,
      });
    }

    await stateService.save();
  },

  async markAllRead(familyId: string, user: string): Promise<void> {
    const state = stateService.get();
    state.notifications.forEach(n => {
      if (!n.readBy.includes(user)) {
        n.readBy.push(user);
      }
    });
    await stateService.save();
  },

  async sendPushToUser(userId: string, title: string, body: string, data?: Record<string, string>): Promise<void> {
    const state = stateService.get();
    const user = state.users[userId] as any;
    if (!user || !user.fcmTokens || user.fcmTokens.length === 0) return;

    if (!notificationChannelsService.shouldNotify(userId, "push")) return;

    state.notifications.unshift({
      id: `not-${Date.now()}`,
      title,
      body,
      targetUser: userId,
      type: "info",
      readBy: [],
      timestamp: new Date().toISOString(),
    });

    await fcmService.sendToDevices(user.fcmTokens, { title, body, data });
    await stateService.save();
  },

  async sendPushToAll(title: string, body: string, data?: Record<string, string>): Promise<void> {
    const tokens = getFamilyTokens();
    if (tokens.length > 0) {
      await fcmService.sendToDevices(tokens, { title, body, data });
    }
  },
};
