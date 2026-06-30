import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { AppTheme } from "./types";

interface ThemeContextType {
  theme: AppTheme;
  isDark: boolean;
  setTheme: (theme: AppTheme) => void;
  toggleDark: () => void;
  themes: { id: AppTheme; label: string; colors: string[] }[];
}

const themes: { id: AppTheme; label: string; colors: string[] }[] = [
  { id: "light", label: "Claro", colors: ["#2563eb", "#ffffff", "#e2e8f0"] },
  { id: "dark", label: "Escuro", colors: ["#3b82f6", "#0f172a", "#334155"] },
  { id: "rose", label: "Rosé", colors: ["#e11d48", "#fff1f2", "#fecdd3"] },
  { id: "nature", label: "Natureza", colors: ["#65a30d", "#f7fee7", "#d9f99d"] },
  { id: "ocean", label: "Oceano", colors: ["#0891b2", "#ecfeff", "#a5f3fc"] },
];

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<AppTheme>(() => {
    try {
      return (localStorage.getItem("familyflow_theme") as AppTheme) || "dark";
    } catch { return "dark"; }
  });

  const [isDark, setIsDark] = useState(() => {
    try {
      return localStorage.getItem("familyflow_isDark") !== "false";
    } catch { return true; }
  });

  const applyTheme = useCallback((t: AppTheme, dark: boolean) => {
    document.documentElement.setAttribute("data-theme", t);
    document.documentElement.setAttribute("data-dark", String(dark));
  }, []);

  const setTheme = useCallback((t: AppTheme) => {
    setThemeState(t);
    try { localStorage.setItem("familyflow_theme", t); } catch {}
    applyTheme(t, isDark);
  }, [isDark, applyTheme]);

  const toggleDark = useCallback(() => {
    setIsDark(prev => {
      const next = !prev;
      try { localStorage.setItem("familyflow_isDark", String(next)); } catch {}
      applyTheme(theme, next);
      return next;
    });
  }, [theme, applyTheme]);

  useEffect(() => {
    applyTheme(theme, isDark);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, isDark, setTheme, toggleDark, themes }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}