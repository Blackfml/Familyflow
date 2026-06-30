/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { FamilyState, Task, CalendarEvent, HistoryLog } from "../types";
import { motion } from "motion/react";
import MorningRoutine from "./MorningRoutine";

interface HomeDashboardProps {
  state: FamilyState;
  currentUser: string;
  onSwitchUser: (user: string) => void;
  onAddTaskClick: () => void;
  onNavigate: (tab: string) => void;
  onQuickToggleHabit: (habitId: string) => void;
  onQuickCompleteTask: (taskId: string) => void;
  onReorganizeAI: () => void;
  aiLoading: boolean;
  aiRecommendation: string;
}

export default function HomeDashboard({
  state,
  currentUser,
  onSwitchUser,
  onAddTaskClick,
  onNavigate,
  onQuickToggleHabit,
  onQuickCompleteTask,
  onReorganizeAI,
  aiLoading,
  aiRecommendation
}: HomeDashboardProps) {
  const now = new Date();
  
  // Format weekday and date
  const weekday = now.toLocaleDateString('pt-BR', { weekday: 'long' });
  const capitalizedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  const formattedDate = now.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });

  // Calculations for Indicators
  const pendingTasks = state.tasks.filter(t => t.status !== "Concluído" && t.status !== "Cancelado");
  const pendingTasksCount = pendingTasks.length;
  
  const todayStr = now.toISOString().split("T")[0];
  const todayEventsCount = state.calendarEvents.filter(e => e.date === todayStr).length;
  
  const activeGoalsCount = state.goals.filter(g => g.status === "Em Progresso").length;

  // Circular progress calculation
  const totalTasksCount = state.tasks.length;
  const completedTasksCount = state.tasks.filter(t => t.status === "Concluído").length;
  const progressPercent = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 87;

  // Next Task determination
  const nextTask = pendingTasks[0] || state.tasks[0];

  // Map of category icons for custom indicators
  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case "academia":
      case "saúde":
        return "fitness_center";
      case "trabalho":
      case "reunião":
        return "work";
      case "refeição":
      case "jantar":
      case "almoço":
        return "restaurant";
      case "escola":
      case "crianças":
        return "school";
      case "manutenção":
      case "casa":
        return "home_repair_service";
      default:
        return "task_alt";
    }
  };

  return (
    <div className="space-y-8 pb-32 animate-in fade-in slide-in-from-bottom-3 duration-300">
      
      {/* 1. Header Section - Clean & Sophisticated */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-1.5">
            Bom dia, {currentUser || "Alessandro"}! 👋
          </h2>
          <p className="text-xs text-slate-400 font-medium mt-1">
            {capitalizedWeekday} • {formattedDate}
          </p>
        </div>

        {/* User Switcher Quick Bubble & Notification Bell */}
        <div className="flex items-center gap-3">
          {/* Unread Alert Indicator Badge */}
          <button 
            onClick={() => onNavigate("IA")}
            className="w-10 h-10 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800/60 flex items-center justify-center text-slate-300 relative cursor-pointer active:scale-95 transition"
            title="Notificações"
          >
            <span className="material-symbols-rounded text-[21px]">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-brand-warning rounded-full animate-pulse" />
          </button>

          {/* Logged user profile bubble (Private) */}
          {state.users[currentUser] && (
            <button
              onClick={() => onNavigate("Perfil")}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-900 border border-slate-800/60 text-xs font-black transition cursor-pointer relative hover:scale-105 active:scale-95 p-1"
              title="Ir para o meu perfil"
            >
              {state.users[currentUser].avatar ? (
                <img 
                  src={state.users[currentUser].avatar} 
                  alt={currentUser} 
                  className="w-full h-full rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="text-white">{currentUser.charAt(0)}</span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* 2. Primary Hero Card - "Organização do casal" with Circular Progress */}
      <div className="bg-brand-card rounded-3xl border border-slate-800/40 p-6 shadow-xl relative overflow-hidden">
        {/* Subtle decorative mesh background */}
        <div className="absolute right-0 top-0 w-44 h-44 bg-brand-primary/5 rounded-full blur-3xl -mr-10 -mt-10" />
        
        <h3 className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500 mb-5 flex items-center gap-1.5">
          <span className="material-symbols-rounded text-brand-primary text-[14px]">partner_exchange</span>
          Organização do casal
        </h3>

        <div className="flex items-center gap-6">
          {/* Radial SVG Progress Circle */}
          <div className="relative shrink-0 flex items-center justify-center">
            <svg className="w-20 h-20 transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="40"
                cy="40"
                r="34"
                className="stroke-slate-800"
                strokeWidth="6"
                fill="transparent"
              />
              {/* Animated active progress circle */}
              <motion.circle
                cx="40"
                cy="40"
                r="34"
                className="stroke-brand-primary"
                strokeWidth="6"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 34}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 34 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 34 * (1 - progressPercent / 100) }}
                transition={{ type: "spring", stiffness: 45, damping: 12 }}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-base font-black text-white">{progressPercent}%</span>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-300">
              {progressPercent >= 80 ? "Ótimo trabalho!" : "Progresso da semana"}
            </p>
            <p className="text-xs text-slate-400 leading-relaxed font-light">
              Excelente organização hoje. Vocês já completaram {completedTasksCount} de {totalTasksCount} atividades programadas.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Indicators - Three small same-sized cards side-by-side */}
      <div className="grid grid-cols-3 gap-3">
        {/* Indicators: Tarefas */}
        <button
          onClick={() => onNavigate("Tarefas")}
          className="bg-brand-card hover:bg-slate-900 border border-slate-800/40 p-3.5 rounded-2xl flex flex-col justify-between items-start text-left cursor-pointer transition active:scale-95 group shadow-sm"
        >
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Tarefas</span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-xl font-bold text-white group-hover:text-brand-primary transition">
              {pendingTasksCount}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">atrasadas</span>
          </div>
        </button>

        {/* Indicators: Eventos */}
        <button
          onClick={() => onNavigate("Agenda")}
          className="bg-brand-card hover:bg-slate-900 border border-slate-800/40 p-3.5 rounded-2xl flex flex-col justify-between items-start text-left cursor-pointer transition active:scale-95 group shadow-sm"
        >
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Eventos</span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-xl font-bold text-white group-hover:text-brand-success transition">
              {todayEventsCount}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">hoje</span>
          </div>
        </button>

        {/* Indicators: Metas */}
        <button
          onClick={() => onNavigate("Objetivos")}
          className="bg-brand-card hover:bg-slate-900 border border-slate-800/40 p-3.5 rounded-2xl flex flex-col justify-between items-start text-left cursor-pointer transition active:scale-95 group shadow-sm"
        >
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Metas</span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-xl font-bold text-white group-hover:text-brand-warning transition">
              {activeGoalsCount}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">ativas</span>
          </div>
        </button>
      </div>

      {/* 4. Next Task Section */}
      <div className="space-y-3">
        <h3 className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500 flex items-center gap-1.5 pl-1">
          <span className="material-symbols-rounded text-brand-primary text-[14px]">event_upcoming</span>
          Próxima tarefa
        </h3>

        {nextTask ? (
          <div className="bg-brand-card rounded-2xl border border-slate-800/40 p-5 flex items-center justify-between shadow-md">
            <div className="space-y-2">
              <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider bg-slate-900 text-brand-primary border border-slate-800/40">
                {nextTask.category || "Manutenção"}
              </span>
              <h4 className="text-sm font-bold text-white leading-tight">
                {nextTask.title}
              </h4>
              <p className="text-[10.5px] text-slate-400 flex items-center gap-1.5 font-medium">
                <span className="material-symbols-rounded text-[14px] text-slate-500">schedule</span>
                Hoje às {nextTask.time || "18:00"}
                <span>•</span>
                <span className="material-symbols-rounded text-[14px] text-slate-500">person</span>
                {nextTask.responsible}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Custom action icon button */}
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800/60 flex items-center justify-center text-slate-400">
                <span className="material-symbols-rounded text-[18px]">
                  {getCategoryIcon(nextTask.category)}
                </span>
              </div>

              {/* Complete Task trigger button */}
              <button
                onClick={() => onQuickCompleteTask(nextTask.id)}
                className="bg-brand-primary hover:bg-brand-primary/90 text-white text-xs font-extrabold px-4 py-2.5 rounded-xl cursor-pointer active:scale-95 transition flex items-center gap-1 shadow-md shadow-brand-primary/10"
              >
                <span className="material-symbols-rounded text-[16px]">play_arrow</span>
                Iniciar
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-brand-card rounded-2xl border border-slate-800/40 p-6 text-center italic text-slate-500 text-xs font-semibold">
            Nenhuma tarefa pendente para hoje! Aproveite o dia. 🎉
          </div>
        )}
      </div>

      {/* 5. AI Suggestion for today */}
      <div className="bg-gradient-to-br from-slate-950 to-[#10121D] rounded-3xl border border-brand-purple/20 p-5 relative overflow-hidden shadow-lg">
        <div className="absolute right-[-15px] bottom-[-15px] w-32 h-32 bg-brand-purple/10 rounded-full blur-2xl" />
        
        <div className="flex items-start gap-4">
          {/* AI Robot Avatar Icon */}
          <div className="w-10 h-10 rounded-2xl bg-brand-purple/15 border border-brand-purple/30 flex items-center justify-center text-brand-purple shrink-0">
            <span className="material-symbols-rounded text-[21px] animate-pulse">smart_toy</span>
          </div>

          <div className="space-y-3 flex-1 min-w-0">
            <div>
              <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-brand-purple">Sugestão da IA para hoje</h4>
              <p className="text-xs text-slate-300 font-light mt-1.5 leading-relaxed">
                {aiRecommendation || `${currentUser || "Alessandro"}, você pode adiar o mercado de manhã para liberar a tarde para os treinos do casal.`}
              </p>
            </div>

            <button
              onClick={() => onNavigate("IA")}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-[11px] font-bold text-brand-purple cursor-pointer active:scale-95 transition flex items-center gap-1.5"
            >
              Ver planejamento
              <span className="material-symbols-rounded text-[14px]">arrow_outward</span>
            </button>
          </div>
        </div>
      </div>

      {/* 6. Morning Routine - Rotina Matinal */}
      <MorningRoutine
        state={state}
        currentUser={currentUser}
        onQuickToggleHabit={onQuickToggleHabit}
        onQuickCompleteTask={onQuickCompleteTask}
      />

      {/* 7. Agenda de Hoje - Elegant vertical timeline */}
      <div className="space-y-4">
        <h3 className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500 flex items-center gap-1.5 pl-1">
          <span className="material-symbols-rounded text-brand-primary text-[14px]">timeline</span>
          Agenda de hoje
        </h3>

        {/* Vertical Timeline container */}
        <div className="bg-brand-card rounded-3xl border border-slate-800/40 p-5 space-y-5 relative">
          
          {/* Vertical continuous line */}
          <div className="absolute left-14 top-8 bottom-8 w-0.5 bg-slate-800" />

          {/* Timeline Node 1 */}
          <div className="flex gap-4 relative z-10">
            <span className="w-10 text-[11px] font-black text-slate-500 text-right shrink-0 pt-1.5">08:00</span>
            <div className="w-2.5 h-2.5 rounded-full bg-brand-primary border-4 border-slate-900 outline-none shrink-0 mt-2" />
            <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800/30 flex-1 flex justify-between items-center">
              <div>
                <h5 className="text-xs font-bold text-white">Academia</h5>
                <p className="text-[9.5px] text-slate-400 mt-0.5">Alessandro</p>
              </div>
              <span className="material-symbols-rounded text-[16px] text-slate-600">fitness_center</span>
            </div>
          </div>

          {/* Timeline Node 2 */}
          <div className="flex gap-4 relative z-10">
            <span className="w-10 text-[11px] font-black text-slate-500 text-right shrink-0 pt-1.5">10:00</span>
            <div className="w-2.5 h-2.5 rounded-full bg-brand-purple border-4 border-slate-900 outline-none shrink-0 mt-2" />
            <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800/30 flex-1 flex justify-between items-center">
              <div>
                <h5 className="text-xs font-bold text-white">Reunião de trabalho</h5>
                <p className="text-[9.5px] text-slate-400 mt-0.5">Alessandro</p>
              </div>
              <span className="material-symbols-rounded text-[16px] text-slate-600">work</span>
            </div>
          </div>

          {/* Timeline Node 3 */}
          <div className="flex gap-4 relative z-10">
            <span className="w-10 text-[11px] font-black text-slate-500 text-right shrink-0 pt-1.5">12:00</span>
            <div className="w-2.5 h-2.5 rounded-full bg-brand-success border-4 border-slate-900 outline-none shrink-0 mt-2" />
            <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800/30 flex-1 flex justify-between items-center">
              <div>
                <h5 className="text-xs font-bold text-white">Almoço em família</h5>
                <p className="text-[9.5px] text-slate-400 mt-0.5">Ambos</p>
              </div>
              <span className="material-symbols-rounded text-[16px] text-slate-600">restaurant</span>
            </div>
          </div>

          {/* Timeline Node 4 */}
          <div className="flex gap-4 relative z-10">
            <span className="w-10 text-[11px] font-black text-slate-500 text-right shrink-0 pt-1.5">15:00</span>
            <div className="w-2.5 h-2.5 rounded-full bg-brand-warning border-4 border-slate-900 outline-none shrink-0 mt-2" />
            <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800/30 flex-1 flex justify-between items-center">
              <div>
                <h5 className="text-xs font-bold text-white">Buscar crianças na escola</h5>
                <p className="text-[9.5px] text-slate-400 mt-0.5">Brenda</p>
              </div>
              <span className="material-symbols-rounded text-[16px] text-slate-600">school</span>
            </div>
          </div>

          {/* Timeline Node 5 */}
          <div className="flex gap-4 relative z-10">
            <span className="w-10 text-[11px] font-black text-slate-500 text-right shrink-0 pt-1.5">18:00</span>
            <div className="w-2.5 h-2.5 rounded-full bg-brand-primary border-4 border-slate-900 outline-none shrink-0 mt-2" />
            <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800/30 flex-1 flex justify-between items-center">
              <div>
                <h5 className="text-xs font-bold text-white">Trocar resistência do chuveiro</h5>
                <p className="text-[9.5px] text-slate-400 mt-0.5">Alessandro</p>
              </div>
              <span className="material-symbols-rounded text-[16px] text-slate-600">home_repair_service</span>
            </div>
          </div>
        </div>
      </div>

      {/* 8. Atividades Recentes - Clean list */}
      <div className="space-y-3">
        <h3 className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500 flex items-center gap-1.5 pl-1">
          <span className="material-symbols-rounded text-brand-primary text-[14px]">history</span>
          Atividades recentes
        </h3>

        <div className="bg-brand-card rounded-3xl border border-slate-800/40 p-4 divide-y divide-slate-800/40">
          {state.history && state.history.slice(0, 3).map((log) => (
            <div key={log.id} className="py-3 flex items-center justify-between text-xs first:pt-1 last:pb-1">
              <div className="flex items-center gap-3">
                <span className="material-symbols-rounded text-slate-500 text-[18px]">
                  {log.targetType === "task" ? "task_alt" : log.targetType === "goal" ? "track_changes" : log.targetType === "habit" ? "local_fire_department" : "shopping_bag"}
                </span>
                <div>
                  <p className="text-slate-300 font-medium">
                    <span className="font-bold text-white">{log.userName}</span> {log.action}{" "}
                    <span className="text-slate-400 font-semibold">"{log.targetName}"</span>
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {new Date(log.timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {(!state.history || state.history.length === 0) && (
            <p className="text-center italic text-slate-500 text-xs py-2">Sem histórico recente.</p>
          )}
        </div>
      </div>

    </div>
  );
}
