/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Activity, 
  Plus, 
  Droplets, 
  Dumbbell, 
  BookOpen, 
  Bookmark, 
  Flame, 
  CheckCircle,
  Clock,
  Heart,
  Trash2,
  X
} from "lucide-react";
import { FamilyState, Habit, UserRole } from "../types";

interface HabitsViewProps {
  state: FamilyState;
  onToggleHabit: (id: string, dateStr: string, completed: boolean) => void;
  onAddHabit: (habitData: any) => void;
  onDeleteHabit: (id: string) => void;
  currentUser: string;
  autoOpenAddModal?: boolean;
  onAddModalOpened?: () => void;
}

export default function HabitsView({ 
  state, 
  onToggleHabit, 
  onAddHabit, 
  onDeleteHabit,
  currentUser,
  autoOpenAddModal,
  onAddModalOpened
}: HabitsViewProps) {
  const [showAddModal, setShowAddModal] = useState(false);

  React.useEffect(() => {
    if (autoOpenAddModal) {
      setShowAddModal(true);
      if (onAddModalOpened) {
        onAddModalOpened();
      }
    }
  }, [autoOpenAddModal]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [responsible, setResponsible] = useState<string>("Ambos");
  const [icon, setIcon] = useState("Droplets");
  const [color, setColor] = useState("#3B82F6");

  const todayStr = new Date().toISOString().split("T")[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    onAddHabit({
      title,
      description,
      responsible,
      streak: 0,
      icon,
      color,
      createdBy: currentUser,
    });

    // Reset Form
    setTitle("");
    setDescription("");
    setResponsible("Ambos");
    setIcon("Droplets");
    setColor("#3B82F6");
    setShowAddModal(false);
  };

  // Helper to map icon name to Lucide Icon
  const getIconComponent = (iconName: string, iconColor: string) => {
    const style = { color: iconColor };
    switch (iconName) {
      case "Droplets": return <Droplets className="w-6 h-6" style={style} />;
      case "Dumbbell": return <Dumbbell className="w-6 h-6" style={style} />;
      case "BookOpen": return <BookOpen className="w-6 h-6" style={style} />;
      default: return <Activity className="w-6 h-6" style={style} />;
    }
  };

  return (
    <div id="habits-section" className="space-y-6 pb-20">
      
      {/* Top Header Panel */}
      <div className="flex flex-col gap-3.5 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" /> Hábitos Diários
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Desenvolva rotinas saudáveis juntos com gamificação</p>
          </div>
          <button 
            id="add-habit-btn"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition duration-200 shadow-sm shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" /> Novo Hábito
          </button>
        </div>

        {/* Informative tips */}
        <div className="bg-blue-50/50 dark:bg-blue-950/20 p-3 rounded-2xl text-[11px] text-slate-700 dark:text-slate-300 flex items-center gap-2.5 border border-blue-100 dark:border-blue-900/40">
          <Flame className="w-4 h-4 text-orange-550 animate-pulse shrink-0" />
          <span>Completar hábitos diariamente garante +15 pontos de evolução familiar!</span>
        </div>
      </div>

      {/* HABITS GRID */}
      <div className="grid grid-cols-1 gap-4">
        {state.habits.map(habit => {
          const completedToday = habit.history && habit.history[todayStr] === true;

          return (
            <div 
              key={habit.id} 
              className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
            >
              <div className="flex justify-between items-start">
                <div className="flex gap-3">
                  {/* Icon wrap */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl shrink-0 border border-slate-100 dark:border-slate-700/60">
                    {getIconComponent(habit.icon, habit.color)}
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">{habit.title}</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{habit.description}</p>
                  </div>
                </div>

                {/* Flame indicator */}
                <div className="flex items-center gap-1 text-orange-650 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 px-2.5 py-1 rounded-lg border border-orange-100 dark:border-orange-900/30">
                  <Flame className="w-4 h-4 text-orange-500 animate-bounce" />
                  <span className="text-xs font-black font-mono">{habit.streak} d</span>
                </div>
              </div>

              {/* Weekly Tracker visualization row */}
              <div className="bg-slate-50/50 dark:bg-slate-850/20 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/60">
                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 block mb-2.5 uppercase tracking-wider font-mono">Histórico recente de 5 dias</span>
                <div className="grid grid-cols-5 gap-2 text-center">
                  {[4, 3, 2, 1, 0].map((offset) => {
                    const date = new Date();
                    date.setDate(date.getDate() - offset);
                    const dateString = date.toISOString().split("T")[0];
                    const wasDone = habit.history && habit.history[dateString] === true;
                    const isNow = offset === 0;

                    return (
                      <div key={offset} className="flex flex-col items-center gap-1">
                        <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                          {isNow ? "Hoje" : date.toLocaleDateString('pt-BR', { weekday: 'narrow' })}
                        </span>
                        <div 
                          className={`w-6 h-6 rounded-lg border flex items-center justify-center text-[11px] font-extrabold ${wasDone ? "bg-emerald-600 border-emerald-650 text-white" : "border-slate-200 text-slate-350 dark:border-slate-800"}`}
                        >
                          {wasDone ? "✓" : "○"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Footer action */}
              <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Designado: 👤 {habit.responsible}</span>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => onDeleteHabit(habit.id)}
                    className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
                    title="Remover Hábito"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    id={`toggle-habit-${habit.id}`}
                    onClick={() => onToggleHabit(habit.id, todayStr, !completedToday)}
                    className={`text-xs font-extrabold px-4 py-2 rounded-xl transition duration-200 ${completedToday ? "bg-emerald-600 text-white shadow-sm" : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-500/10"}`}
                  >
                    {completedToday ? "Feito! ✓" : "Completar Hábito"}
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* CREATE HABIT DIALOG */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-5 space-y-4 border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Criar Novo Hábito</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                Fechar
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Título do Hábito</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Ex: Dormir cedo (22:30)"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-800 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Descrição</label>
                <textarea 
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Por que este hábito é importante para vocês?"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-800 dark:text-white h-16"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Responsável</label>
                  <select 
                    value={responsible}
                    onChange={e => setResponsible(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300"
                  >
                    <option value="Ambos">Ambos 👨‍👩‍👧‍👦</option>
                    {Object.values(state.users).map((user) => (
                      <option key={user.id} value={user.name}>{user.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Ícone</label>
                  <select 
                    value={icon}
                    onChange={e => setIcon(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300"
                  >
                    <option value="Droplets">Água / Hidratação 💧</option>
                    <option value="Dumbbell">Exercício / Saúde 🏋️</option>
                    <option value="BookOpen">Leitura / Estudos 📚</option>
                    <option value="Activity">Outro Hábito ⚡</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Cor Temática</label>
                <div className="flex gap-2.5 pt-1">
                  {["#3B82F6", "#10B981", "#EF4444", "#8B5CF6", "#F59E0B"].map(hex => (
                    <button 
                      key={hex}
                      type="button"
                      onClick={() => setColor(hex)}
                      className={`w-6 h-6 rounded-full border-2 ${color === hex ? "border-slate-900 scale-110" : "border-transparent"}`}
                      style={{ backgroundColor: hex }}
                    />
                  ))}
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-3 mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md"
              >
                Criar Hábito
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
