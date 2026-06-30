/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Target, 
  Plus, 
  DollarSign, 
  Calendar, 
  CheckCircle, 
  TrendingUp, 
  User, 
  Trash2,
  Bookmark,
  ChevronRight,
  AlertCircle
} from "lucide-react";
import { FamilyState, Goal } from "../types";

interface GoalsViewProps {
  state: FamilyState;
  onAddGoal: (goalData: any) => void;
  currentUser: string;
  autoOpenAddModal?: boolean;
  onAddModalOpened?: () => void;
}

export default function GoalsView({ state, onAddGoal, currentUser, autoOpenAddModal, onAddModalOpened }: GoalsViewProps) {
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
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [category, setCategory] = useState("Financeiro");
  const [icon, setIcon] = useState("Home");

  // Subtasks states
  const [subtaskInput, setSubtaskInput] = useState("");
  const [subtasks, setSubtasks] = useState<string[]>([]);

  const addSubtask = () => {
    if (subtaskInput.trim() && !subtasks.includes(subtaskInput.trim())) {
      setSubtasks([...subtasks, subtaskInput.trim()]);
      setSubtaskInput("");
    }
  };

  const removeSubtask = (idx: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    onAddGoal({
      title,
      description,
      targetAmount: parseFloat(targetAmount) || undefined,
      currentAmount: parseFloat(currentAmount) || 0,
      deadline,
      category,
      icon,
      subtasks: subtasks.map((text, i) => ({ id: `sub-${Date.now()}-${i}`, text, completed: false })),
      createdBy: currentUser,
    });

    // Reset Form
    setTitle("");
    setDescription("");
    setTargetAmount("");
    setCurrentAmount("");
    setDeadline("");
    setCategory("Financeiro");
    setIcon("Home");
    setSubtasks([]);
    setShowAddModal(false);
  };

  return (
    <div id="goals-section" className="space-y-6 pb-20">
      
      {/* Top Header Panel */}
      <div className="flex flex-col gap-3.5 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" /> Metas & Objetivos do Casal
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Conquistas e objetivos de longo prazo planejados juntos</p>
          </div>
          <button 
            id="add-goal-btn"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition duration-200 shadow-sm shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" /> Novo Objetivo
          </button>
        </div>

        {/* Financial accumulation indicator */}
        <div className="bg-blue-50/50 dark:bg-blue-950/20 p-3.5 rounded-2xl flex justify-between items-center text-xs border border-blue-100 dark:border-blue-900/40">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
            <TrendingUp className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Patrimônio poupado nos objetivos:</span>
          </div>
          <span className="font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
            R$ {state.goals.reduce((sum, g) => sum + (g.currentAmount || 0), 0).toLocaleString("pt-BR")}
          </span>
        </div>
      </div>

      {/* GOALS GRID */}
      <div className="grid grid-cols-1 gap-4">
        {state.goals.map(goal => {
          const hasFinancial = goal.targetAmount && goal.targetAmount > 0;
          return (
            <div 
              key={goal.id} 
              className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
            >
              <div className="flex justify-between items-start gap-3">
                <div className="flex gap-3">
                  {/* Goal icon */}
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-2xl shrink-0 border border-blue-100 dark:border-blue-900/30">
                    <Target className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">{goal.title}</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed line-clamp-2">{goal.description}</p>
                  </div>
                </div>
                <span className="text-[11px] bg-slate-100 dark:bg-slate-800 dark:text-slate-300 font-extrabold px-2.5 py-1 rounded-lg uppercase tracking-wider border border-slate-200/50 dark:border-slate-700">
                  {goal.category}
                </span>
              </div>

              {/* Progress bar info */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[11px]">Progresso geral</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400 font-mono">{goal.progress}%</span>
                </div>
                {/* Horizontal Bar */}
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="bg-blue-600 h-full transition-all duration-700" 
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>

                {/* Financial metrics if available */}
                {hasFinancial && (
                  <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 font-mono">
                    <span>Acumulado: <strong className="text-slate-900 dark:text-white">R$ {goal.currentAmount?.toLocaleString("pt-BR")}</strong></span>
                    <span>Alvo: <strong className="text-slate-900 dark:text-white">R$ {goal.targetAmount?.toLocaleString("pt-BR")}</strong></span>
                  </div>
                )}
              </div>

              {/* Subtasks listing */}
              {goal.subtasks && goal.subtasks.length > 0 && (
                <div className="bg-slate-50/50 dark:bg-slate-850/20 p-3.5 rounded-2xl space-y-2.5 border border-slate-100 dark:border-slate-800/60">
                  <h4 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">Etapas do Objetivo</h4>
                  <div className="space-y-1.5">
                    {goal.subtasks.map(sub => (
                      <div key={sub.id} className="flex items-center gap-2 text-[11px]">
                        <input 
                          type="checkbox" 
                          checked={sub.completed}
                          readOnly
                          className="rounded-lg text-blue-600 focus:ring-0 w-3.5 h-3.5 border-slate-300 pointer-events-none"
                        />
                        <span className={`text-slate-700 dark:text-slate-300 font-medium ${sub.completed ? "line-through opacity-50 text-slate-400" : ""}`}>
                          {sub.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Goal footer specs */}
              <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-400">
                <span className="flex items-center gap-1 font-bold uppercase tracking-wider text-[11px] text-slate-400 dark:text-slate-500">
                  <Calendar className="w-3.5 h-3.5 text-blue-500" /> Prazo: <span className="font-mono">{goal.deadline}</span>
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Criado por: {goal.createdBy}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* OBJECTIVE CREATION DIALOG */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-5 space-y-4 border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Adicionar Objetivo</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                Fechar
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Título do Objetivo</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Ex: Comprar Apartamento"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-800 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Descrição</label>
                <textarea 
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Detalhamento geral..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-800 dark:text-white h-16"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Valor Alvo (R$)</label>
                  <input 
                    type="number" 
                    value={targetAmount}
                    onChange={e => setTargetAmount(e.target.value)}
                    placeholder="120000"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Prazo Final</label>
                  <input 
                    type="date" 
                    value={deadline}
                    onChange={e => setDeadline(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-800 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Categoria</label>
                  <select 
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300"
                  >
                    <option value="Financeiro">Financeiro / Poupança</option>
                    <option value="Lazer">Viagem / Lazer</option>
                    <option value="Aquisições">Bens / Compras</option>
                    <option value="Crianças">Crianças / Educação</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Valor Atual Salvo (R$)</label>
                  <input 
                    type="number" 
                    value={currentAmount}
                    onChange={e => setCurrentAmount(e.target.value)}
                    placeholder="0"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Subtasks inside modal */}
              <div className="border border-slate-150 dark:border-slate-800 p-2.5 rounded-xl space-y-2 bg-slate-50/50 dark:bg-slate-800/40">
                <label className="block text-[11px] font-bold text-slate-400 uppercase">Sub-etapas necessárias</label>
                {subtasks.length > 0 && (
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {subtasks.map((text, idx) => (
                      <div key={idx} className="flex justify-between items-center gap-2 text-[11px] bg-white dark:bg-slate-900 p-1.5 rounded-lg border border-slate-100">
                        <span>{text}</span>
                        <button type="button" onClick={() => removeSubtask(idx)} className="text-red-400 hover:text-red-600">×</button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-1">
                  <input 
                    type="text"
                    value={subtaskInput}
                    onChange={e => setSubtaskInput(e.target.value)}
                    placeholder="Adicionar submeta..."
                    className="flex-1 p-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
                  />
                  <button 
                    type="button" 
                    onClick={addSubtask}
                    className="bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold px-2.5 rounded-lg dark:bg-slate-700 dark:text-slate-300"
                  >
                    +
                  </button>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md"
              >
                Criar Objetivo
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
