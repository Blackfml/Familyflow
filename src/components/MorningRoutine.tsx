import React from "react";
import { FamilyState } from "../types";
import { motion } from "motion/react";

interface MorningRoutineProps {
  state: FamilyState;
  currentUser: string;
  onQuickToggleHabit: (habitId: string) => void;
  onQuickCompleteTask: (taskId: string) => void;
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 6) return "Boa madrugada";
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

function isMorningTime(time?: string): boolean {
  if (!time) return false;
  const [h] = time.split(":").map(Number);
  return !isNaN(h) && h < 12;
}

function getTimeDisplay(time?: string): string {
  if (!time) return "";
  return time;
}

const MOTIVATIONAL_PHRASES = [
  "Comece o dia com energia!",
  "Um passo de cada vez.",
  "Você consegue!",
  "Hoje será produtivo!",
  "Foco e disciplina.",
  "Pequenas vitórias, grandes resultados.",
];

const routineIcons: Record<string, string> = {
  "academia": "fitness_center",
  "saúde": "self_improvement",
  "meditação": "self_improvement",
  "café": "coffee",
  "café da manhã": "coffee",
  "café-da-manhã": "coffee",
  "caminhada": "directions_walk",
  "corrida": "directions_run",
  "alongamento": "stretching",
  "água": "water_drop",
  "banho": "shower",
  "ler": "book",
  "leitura": "book",
  "orar": "church",
  "oração": "church",
  "planejar": "calendar_month",
  "planejamento": "calendar_month",
  "arrumar": "bed",
  "cama": "bed",
  "acordar": "alarm",
  "escola": "school",
  "crianças": "child_care",
  "trabalho": "work",
  "reunião": "meeting_room",
  "mercado": "shopping_cart",
  "compras": "shopping_bag",
  "limpeza": "cleaning_services",
  "casa": "home",
  "jantar": "restaurant",
  "almoço": "restaurant",
  "refeição": "restaurant",
};

function guessIcon(title: string): string {
  const lower = title.toLowerCase();
  for (const [key, icon] of Object.entries(routineIcons)) {
    if (lower.includes(key)) return icon;
  }
  return "check_circle";
}

export default function MorningRoutine({
  state,
  currentUser,
  onQuickToggleHabit,
  onQuickCompleteTask,
}: MorningRoutineProps) {
  const todayStr = new Date().toISOString().split("T")[0];

  const morningTasks = state.tasks.filter(t =>
    t.date === todayStr &&
    t.status !== "Concluído" &&
    t.status !== "Cancelado" &&
    isMorningTime(t.time)
  );

  const morningHabits = state.habits.filter(h =>
    h.responsible === currentUser || h.responsible === "Ambos"
  );

  const incompleteHabits = morningHabits.filter(h => !h.history[todayStr]);
  const completedHabits = morningHabits.filter(h => h.history[todayStr] === true);

  const allItems = [
    ...morningTasks.map(t => ({
      id: t.id,
      type: "task" as const,
      title: t.title,
      time: t.time,
      icon: t.icon || guessIcon(t.title),
      color: t.color || "brand-primary",
      completed: false,
      responsible: t.responsible,
    })),
    ...incompleteHabits.map(h => ({
      id: h.id,
      type: "habit" as const,
      title: h.title,
      time: undefined,
      icon: h.icon || guessIcon(h.title),
      color: h.color || "brand-warning",
      completed: false,
      responsible: h.responsible,
    })),
    ...completedHabits.map(h => ({
      id: h.id,
      type: "habit" as const,
      title: h.title,
      time: undefined,
      icon: h.icon || guessIcon(h.title),
      color: h.color || "brand-success",
      completed: true,
      responsible: h.responsible,
    })),
  ];

  const totalItems = allItems.length;
  const doneCount = completedHabits.length + morningTasks.filter(t => t.status === "Concluído").length;
  const progressPercent = totalItems > 0 ? Math.round((doneCount / totalItems) * 100) : 0;

  const phrase = MOTIVATIONAL_PHRASES[Math.floor(Math.random() * MOTIVATIONAL_PHRASES.length)];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="bg-brand-card rounded-3xl border border-slate-800/40 p-5 shadow-xl relative overflow-hidden"
    >
      <div className="absolute right-0 top-0 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <span className="material-symbols-rounded text-white text-[22px]">wb_sunny</span>
          </div>
          <div>
            <h3 className="text-sm font-black text-white tracking-tight">
              {getGreeting()}, {currentUser}
            </h3>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">{phrase}</p>
          </div>
        </div>

        {totalItems > 0 && (
          <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800/50 rounded-xl px-3 py-1.5">
            <span className="text-[11px] font-extrabold text-slate-300">
              {doneCount}/{totalItems}
            </span>
            <span className="text-[8px] text-slate-500">feito</span>
          </div>
        )}
      </div>

      {totalItems > 0 && (
        <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden mb-4">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
      )}

      <div className="space-y-1.5">
        {allItems.length === 0 ? (
          <div className="text-center py-8">
            <span className="material-symbols-rounded text-[32px] text-slate-700">celebration</span>
            <p className="text-xs text-slate-500 font-medium mt-2">
              Nada pendente por aqui! Sua manhã está livre. 🎉
            </p>
          </div>
        ) : (
          allItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.04, duration: 0.2 }}
              className={`group flex items-center gap-3 p-3 rounded-2xl transition-all duration-200 cursor-pointer ${
                item.completed
                  ? "bg-slate-900/40 border border-slate-800/20 opacity-60"
                  : "bg-slate-900/70 border border-slate-800/40 hover:bg-slate-900 hover:border-slate-700/60"
              }`}
              onClick={() => {
                if (item.completed) return;
                if (item.type === "habit") onQuickToggleHabit(item.id);
                else onQuickCompleteTask(item.id);
              }}
            >
              <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                item.completed
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-slate-800/80 text-slate-400 group-hover:text-white group-hover:bg-slate-700"
              }`}>
                <span className="material-symbols-rounded text-[16px]">
                  {item.completed ? "check_circle" : item.icon}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <span className={`text-xs font-bold block truncate ${
                  item.completed ? "text-slate-500 line-through" : "text-slate-200"
                }`}>
                  {item.title}
                </span>
                {item.time && !item.completed && (
                  <span className="text-[8px] font-mono text-amber-400/80 font-bold mt-0.5 block">
                    {item.time}
                  </span>
                )}
              </div>

              <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${
                item.completed
                  ? "bg-emerald-500 border-emerald-500"
                  : "border-slate-700 group-hover:border-brand-primary"
              }`}>
                {item.completed ? (
                  <span className="material-symbols-rounded text-white text-[14px]">check</span>
                ) : (
                  <span className="material-symbols-rounded text-slate-600 text-[14px] opacity-0 group-hover:opacity-100 transition-opacity">add</span>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}
