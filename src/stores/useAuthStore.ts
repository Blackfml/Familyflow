import { create } from "zustand";

interface AuthStore {
  currentUser: string;
  token: string | null;
  setCurrentUser: (name: string) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  currentUser: (() => {
    try { return localStorage.getItem("familyflow_current_user") || ""; }
    catch { return ""; }
  })(),
  token: (() => {
    try { return localStorage.getItem("familyflow_token"); }
    catch { return null; }
  })(),
  setCurrentUser: (name) => {
    try { localStorage.setItem("familyflow_current_user", name); } catch {}
    set({ currentUser: name });
  },
  setToken: (token) => {
    try {
      if (token) localStorage.setItem("familyflow_token", token);
      else localStorage.removeItem("familyflow_token");
    } catch {}
    set({ token });
  },
  logout: () => {
    try { localStorage.removeItem("familyflow_current_user"); } catch {}
    try { localStorage.removeItem("familyflow_token"); } catch {}
    set({ currentUser: "", token: null });
  },
}));
