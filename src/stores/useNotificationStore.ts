import { create } from "zustand";

interface FloatingAlert {
  id: string;
  title: string;
  body: string;
  type: "task" | "notification" | "system" | "success";
  responsible?: string;
  time?: string;
  taskId?: string;
}

interface NotificationStore {
  floatingAlerts: FloatingAlert[];
  showNotifications: boolean;
  showNotificationCenter: boolean;
  remindedTasks: string[];
  showNotificationPromptBanner: boolean;
  systemNotificationPermission: string;
  addFloatingAlert: (alert: Omit<FloatingAlert, "id">) => void;
  dismissAlert: (id: string) => void;
  setShowNotifications: (v: boolean) => void;
  setShowNotificationCenter: (v: boolean) => void;
  markAsReminded: (taskId: string) => void;
  dismissPromptBanner: () => void;
  setSystemNotificationPermission: (v: string) => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  floatingAlerts: [],
  showNotifications: false,
  showNotificationCenter: false,
  remindedTasks: (() => {
    try { return JSON.parse(localStorage.getItem("familyflow_reminded_tasks") || "[]"); }
    catch { return []; }
  })(),
  showNotificationPromptBanner: (() => {
    try {
      const saved = localStorage.getItem("familyflow_dismiss_perm_banner");
      const emulated = localStorage.getItem("familyflow_emulated_permission");
      return saved !== "true" && emulated !== "granted";
    } catch { return true; }
  })(),
  systemNotificationPermission: (() => {
    try {
      return localStorage.getItem("familyflow_emulated_permission") ||
        (typeof Notification !== "undefined" ? Notification.permission : "default");
    } catch { return "default"; }
  })(),

  addFloatingAlert(alert) {
    const id = `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    set((s) => ({ floatingAlerts: [{ ...alert, id }, ...s.floatingAlerts].slice(0, 5) }));
    setTimeout(() => {
      set((s) => ({ floatingAlerts: s.floatingAlerts.filter((a) => a.id !== id) }));
    }, 7000);
  },

  dismissAlert(id) {
    set((s) => ({ floatingAlerts: s.floatingAlerts.filter((a) => a.id !== id) }));
  },

  setShowNotifications(v) { set({ showNotifications: v }); },
  setShowNotificationCenter(v) { set({ showNotificationCenter: v }); },

  markAsReminded(taskId) {
    set((s) => {
      const updated = [...s.remindedTasks, taskId];
      try { localStorage.setItem("familyflow_reminded_tasks", JSON.stringify(updated)); } catch {}
      return { remindedTasks: updated };
    });
  },

  dismissPromptBanner() {
    set({ showNotificationPromptBanner: false });
    try { localStorage.setItem("familyflow_dismiss_perm_banner", "true"); } catch {}
  },

  setSystemNotificationPermission(v) {
    set({ systemNotificationPermission: v });
    try { localStorage.setItem("familyflow_emulated_permission", v); } catch {}
  },
}));
