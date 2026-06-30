import React from "react";
import { api } from "../services/api";

type AIMode = "correria" | "foco" | "familia";

interface AIModeSelectorProps {
  currentMode: AIMode;
  onModeChange: (mode: AIMode) => void;
}

const modes: { key: AIMode; label: string; icon: string; color: string; activeColor: string }[] = [
  { key: "correria", label: "Correria", icon: "bolt", color: "text-red-400 border-red-800 bg-red-900/20", activeColor: "bg-red-500 text-white border-red-500" },
  { key: "foco", label: "Foco", icon: "target", color: "text-blue-400 border-blue-800 bg-blue-900/20", activeColor: "bg-blue-500 text-white border-blue-500" },
  { key: "familia", label: "Família", icon: "familiarity_and_children", color: "text-green-400 border-green-800 bg-green-900/20", activeColor: "bg-green-500 text-white border-green-500" },
];

export default function AIModeSelector({ currentMode, onModeChange }: AIModeSelectorProps) {
  const handleModeClick = async (mode: AIMode) => {
    try {
      await api.post("/gemini/mode", { mode });
      onModeChange(mode);
    } catch (err) {
      console.error("Failed to set mode:", err);
    }
  };

  return (
    <div className="flex gap-1.5 mb-3">
      {modes.map(m => {
        const isActive = currentMode === m.key;
        return (
          <button
            key={m.key}
            onClick={() => handleModeClick(m.key)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-[11px] font-bold uppercase tracking-wider transition cursor-pointer ${
              isActive ? m.activeColor : `${m.color} hover:opacity-80`
            }`}
          >
            <span className="material-symbols-rounded text-[14px]">{m.icon}</span>
            {m.label}
          </button>
        );
      })}
    </div>
  );
}
