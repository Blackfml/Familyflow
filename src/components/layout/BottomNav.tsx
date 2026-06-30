import React from "react";

interface NavItem {
  id: string;
  label: string;
  icon: string;
  activeIcon: string;
  color?: string;
  matchGroup?: string[];
}

const NAV_ITEMS: NavItem[] = [
  { id: "Home", label: "Home", icon: "home", activeIcon: "home" },
  { id: "Agenda", label: "Agenda", icon: "calendar_today", activeIcon: "calendar_month" },
  { id: "Tarefas", label: "Tarefas", icon: "task_alt", activeIcon: "task_alt", matchGroup: ["Tarefas", "Objetivos", "Hábitos", "Compras"] },
  { id: "Conquistas", label: "Conquistas", icon: "emoji_events", activeIcon: "emoji_events", color: "text-amber-400" },
  { id: "IA", label: "Gemini", icon: "smart_toy", activeIcon: "smart_toy", color: "text-brand-purple" },
  { id: "Chat", label: "Chat", icon: "forum", activeIcon: "forum", color: "text-emerald-400" },
  { id: "Perfil", label: "Perfil", icon: "person_outline", activeIcon: "person" },
];

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const isActive = (item: NavItem) =>
    item.matchGroup ? item.matchGroup.includes(activeTab) : activeTab === item.id;

  return (
    <div className="bg-[#151B2C] border-t border-slate-800/80 p-2.5 px-3 flex justify-between items-center shrink-0 z-30 select-none">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          id={`tab-${item.id.toLowerCase()}`}
          onClick={() => onTabChange(item.id)}
          className={`flex-1 flex flex-col items-center gap-1 p-1 rounded-xl transition duration-200 relative cursor-pointer ${
            isActive(item) ? "text-brand-primary font-bold" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <span
            className={`material-symbols-rounded text-[20px] ${isActive(item) && item.color ? item.color : ""}`}
          >
            {isActive(item) ? item.activeIcon : item.icon}
          </span>
          <span className="text-[11px] font-bold tracking-tight">{item.label}</span>
          {isActive(item) && (
            <span className="absolute bottom-[-10px] w-5 h-1 bg-brand-primary rounded-t-full" />
          )}
        </button>
      ))}
    </div>
  );
}
