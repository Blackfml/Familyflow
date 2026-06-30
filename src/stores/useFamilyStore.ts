import { create } from "zustand";
import { FamilyState } from "../types";
import { api } from "../services/api";

interface FamilyStore {
  state: FamilyState | null;
  loading: boolean;
  error: string | null;
  fetchState: () => Promise<void>;
  setState: (state: FamilyState) => void;
  updateState: (partial: Partial<FamilyState>) => void;
}

export const useFamilyStore = create<FamilyStore>((set, get) => ({
  state: null,
  loading: true,
  error: null,

  async fetchState() {
    try {
      const data = await api.get<any>("/state");
      set({ state: data, error: null });
    } catch (err: any) {
      set({ error: "Falha na sincronização" });
    } finally {
      set({ loading: false });
    }
  },

  setState(state) {
    set({ state });
  },

  updateState(partial) {
    const current = get().state;
    if (current) {
      set({ state: { ...current, ...partial } });
    }
  },
}));
