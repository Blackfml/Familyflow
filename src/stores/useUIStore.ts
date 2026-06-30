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

interface UIStore {
  darkMode: boolean;
  activeTab: string;
  showFabMenu: boolean;
  showNotifications: boolean;
  loading: boolean;
  floatingAlerts: FloatingAlert[];

  setDarkMode: (value: boolean) => void;
  setActiveTab: (tab: string) => void;
  setShowFabMenu: (value: boolean) => void;
  setShowNotifications: (value: boolean) => void;
  setLoading: (value: boolean) => void;
  addAlert: (alert: FloatingAlert) => void;
  removeAlert: (id: string) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  darkMode: true,
  activeTab: "Home",
  showFabMenu: false,
  showNotifications: false,
  loading: true,
  floatingAlerts: [],

  setDarkMode: (darkMode) => set({ darkMode }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setShowFabMenu: (showFabMenu) => set({ showFabMenu }),
  setShowNotifications: (showNotifications) => set({ showNotifications }),
  setLoading: (loading) => set({ loading }),

  addAlert: (alert) =>
    set((state) => ({
      floatingAlerts: [alert, ...state.floatingAlerts].slice(0, 5),
    })),

  removeAlert: (id) =>
    set((state) => ({
      floatingAlerts: state.floatingAlerts.filter((a) => a.id !== id),
    })),
}));
