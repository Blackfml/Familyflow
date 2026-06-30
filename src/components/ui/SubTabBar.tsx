import React from "react";

interface SubTab {
  key: string;
  label: string;
}

interface SubTabBarProps {
  tabs: SubTab[];
  activeTab: string;
  onTabChange: (key: string) => void;
}

export function SubTabBar({ tabs, activeTab, onTabChange }: SubTabBarProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 shrink-0 scrollbar-none">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold tracking-tight whitespace-nowrap transition duration-200 ${
            activeTab === tab.key
              ? "bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-none"
              : "bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-slate-500 dark:text-slate-400"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export const TASK_SUB_TABS: SubTab[] = [
  { key: "Tarefas", label: "Tarefas" },
  { key: "Objetivos", label: "Objetivos" },
  { key: "Hábitos", label: "Hábitos" },
  { key: "Compras", label: "Compras" },
];
