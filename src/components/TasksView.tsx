/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import VirtualList from "./ui/VirtualList";
import { 
  CheckSquare, 
  Plus, 
  Trash2, 
  Search, 
  Tag, 
  Clock, 
  DollarSign, 
  Paperclip, 
  User, 
  ChevronRight, 
  X,
  AlertCircle,
  Folder,
  Wrench,
  HeartPulse,
  Car,
  Apple
} from "lucide-react";
import { FamilyState, Task, TaskStatus, TaskPriority, UserRole, TaskChecklistItem } from "../types";

interface TasksViewProps {
  state: FamilyState;
  onSaveTask: (taskData: any) => void;
  onDeleteTask: (id: string) => void;
  currentUser: string;
  autoOpenAddModal?: boolean;
  onAddModalOpened?: () => void;
}

export default function TasksView({ state, onSaveTask, onDeleteTask, currentUser, autoOpenAddModal, onAddModalOpened }: TasksViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterResp, setFilterResp] = useState<string>("Todos");
  const [filterStatus, setFilterStatus] = useState<"Todos" | TaskStatus>("Todos");
  const [showAddModal, setShowAddModal] = useState(false);

  React.useEffect(() => {
    if (autoOpenAddModal) {
      setShowAddModal(true);
      if (onAddModalOpened) {
        onAddModalOpened();
      }
    }
  }, [autoOpenAddModal]);

  // Form states for creating a task
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [responsible, setResponsible] = useState<string>("Ambos");
  const [category, setCategory] = useState("Casa & Manutenção");
  const [priority, setPriority] = useState<TaskPriority>("Média");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState("");
  const [cost, setCost] = useState("0");
  const [durationEstimate, setDurationEstimate] = useState("30");
  const [recurrence, setRecurrence] = useState<"Nenhuma" | "Diária" | "Semanal" | "Mensal">("Nenhuma");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [checklistItems, setChecklistItems] = useState<{ text: string; completed: boolean }[]>([]);
  const [newCheckItemText, setNewCheckItemText] = useState("");
  const [color, setColor] = useState("#3B82F6");
  const [icon, setIcon] = useState("CheckSquare");

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (indexToRemove: number) => {
    setTags(tags.filter((_, idx) => idx !== indexToRemove));
  };

  const addChecklistItem = () => {
    if (newCheckItemText.trim()) {
      setChecklistItems([...checklistItems, { text: newCheckItemText.trim(), completed: false }]);
      setNewCheckItemText("");
    }
  };

  const removeChecklistItem = (idx: number) => {
    setChecklistItems(checklistItems.filter((_, i) => i !== idx));
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    // Build checklist structured items
    const checklist: TaskChecklistItem[] = checklistItems.map((item, index) => ({
      id: `check-${Date.now()}-${index}`,
      text: item.text,
      completed: item.completed
    }));

    onSaveTask({
      title,
      description,
      responsible,
      category,
      priority,
      date,
      time: time || undefined,
      cost: parseFloat(cost) || 0,
      durationEstimate: parseInt(durationEstimate) || 30,
      recurrence,
      tags,
      checklist,
      color,
      icon,
      status: "A Fazer",
      createdBy: currentUser,
    });

    // Reset Form
    setTitle("");
    setDescription("");
    setResponsible("Ambos");
    setCategory("Casa & Manutenção");
    setPriority("Média");
    setDate(new Date().toISOString().split("T")[0]);
    setTime("");
    setCost("0");
    setDurationEstimate("30");
    setRecurrence("Nenhuma");
    setTags([]);
    setChecklistItems([]);
    setShowAddModal(false);
  };

  // Helper to map category/icon to Lucide Component
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "Wrench": return <Wrench className="w-5 h-5 text-red-500" />;
      case "HeartPulse": return <HeartPulse className="w-5 h-5 text-blue-500" />;
      case "Car": return <Car className="w-5 h-5 text-amber-500" />;
      case "Apple": return <Apple className="w-5 h-5 text-emerald-500" />;
      default: return <CheckSquare className="w-5 h-5 text-blue-500" />;
    }
  };

  // Filter tasks
  const filteredTasks = state.tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesResp = filterResp === "Todos" ? true : task.responsible === filterResp || task.responsible === "Ambos";
    const matchesStatus = filterStatus === "Todos" ? true : task.status === filterStatus;
    return matchesSearch && matchesResp && matchesStatus;
  });

  const getPriorityBadgeColor = (p: TaskPriority) => {
    switch (p) {
      case "Urgente": return "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/55 dark:text-red-400 dark:border-red-900";
      case "Alta": return "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950/55 dark:text-orange-400 dark:border-orange-900";
      case "Média": return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/55 dark:text-blue-400 dark:border-blue-900";
      default: return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700";
    }
  };

  // Financial summary related to listed tasks
  const totalFinancialCost = filteredTasks.reduce((sum, t) => sum + (t.cost || 0), 0);

  const toggleChecklistItemInline = (task: Task, checkItemId: string) => {
    const updatedChecklist = task.checklist.map(item => {
      if (item.id === checkItemId) {
        return { ...item, completed: !item.completed };
      }
      return item;
    });

    // Calculate percent completed
    const completedCount = updatedChecklist.filter(i => i.completed).length;
    const totalCount = updatedChecklist.length;
    const percentCompleted = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    onSaveTask({
      ...task,
      checklist: updatedChecklist,
      percentCompleted
    });
  };

  const toggleTaskStatusInline = (task: Task) => {
    const newStatus: TaskStatus = task.status === "Concluído" ? "A Fazer" : "Concluído";
    onSaveTask({
      ...task,
      status: newStatus
    });
  };

  return (
    <div id="tasks-section" className="space-y-6 pb-20">
      
      {/* Top Section Header */}
      <div className="flex flex-col gap-3.5 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-blue-600" /> Tarefas Compartilhadas
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Divida e resolva as rotinas de forma organizada</p>
          </div>
          <button 
            id="add-task-floating-btn"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition duration-200 shadow-sm shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" /> Nova Tarefa
          </button>
        </div>

        {/* Financial info block */}
        <div className="bg-blue-50/50 dark:bg-blue-950/20 p-3 rounded-2xl flex justify-between items-center text-xs border border-blue-100 dark:border-blue-900/40">
          <span className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">Total Financeiro Filtrado</span>
          <span className="font-extrabold text-blue-650 dark:text-blue-300 flex items-center gap-0.5 font-mono">
            <DollarSign className="w-3.5 h-3.5" /> R$ {totalFinancialCost.toFixed(2)}
          </span>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Pesquisar tarefas..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-2 gap-2.5 text-[11px]">
          <div>
            <label className="block font-bold text-slate-400 dark:text-slate-500 mb-1 uppercase tracking-wider">Responsável</label>
            <select 
              value={filterResp}
              onChange={e => setFilterResp(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-bold"
            >
              <option value="Todos">Todos do Casal</option>
              {Object.values(state.users).map((user) => (
                <option key={user.id} value={user.name}>{user.name}</option>
              ))}
              <option value="Ambos">Ambos</option>
            </select>
          </div>
          <div>
            <label className="block font-bold text-slate-400 dark:text-slate-500 mb-1 uppercase tracking-wider">Status</label>
            <select 
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as any)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-bold"
            >
              <option value="Todos">Todos os Status</option>
              <option value="A Fazer">A Fazer</option>
              <option value="Em andamento">Em andamento</option>
              <option value="Concluído">Concluído</option>
              <option value="Cancelado">Cancelado</option>
              <option value="Aguardando">Aguardando</option>
            </select>
          </div>
        </div>
      </div>

      {/* TASKS LIST */}
      <div className="space-y-3.5">
        {filteredTasks.length > 0 ? (
          <VirtualList
            items={filteredTasks}
            itemHeight={260}
            overscan={2}
            className="max-h-[600px]"
            emptyMessage="Nenhuma tarefa encontrada"
            renderItem={(task: Task) => {
            const hasChecklist = task.checklist && task.checklist.length > 0;
            const completedPercent = task.percentCompleted || 0;

            return (
              <div 
                key={task.id} 
                className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition duration-200 hover:shadow-md mb-3.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    {/* Checked Circle to toggle state */}
                    <button 
                      id={`check-task-${task.id}`}
                      onClick={() => toggleTaskStatusInline(task)}
                      className={`p-1 mt-0.5 rounded-lg border transition duration-250 ${task.status === "Concluído" ? "bg-emerald-650 border-emerald-650 text-white" : "border-slate-300 hover:border-blue-500 text-transparent hover:bg-slate-50 dark:hover:bg-slate-800"}`}
                    >
                      <CheckSquare className="w-4 h-4 text-current" />
                    </button>

                    <div>
                      <h3 className={`text-sm font-extrabold text-slate-900 dark:text-white ${task.status === "Concluído" ? "line-through opacity-50 text-slate-400 dark:text-slate-500" : ""}`}>
                        {task.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                        {task.description}
                      </p>
                    </div>
                  </div>

                  {/* Right: Category Icon */}
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-100 dark:border-slate-700/60">
                    {getIconComponent(task.icon)}
                  </div>
                </div>

                {/* Subtasks checklist inline inside cards */}
                {hasChecklist && (
                  <div className="bg-slate-50/50 dark:bg-slate-800/20 p-3 rounded-2xl space-y-2.5 border border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between items-center text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">
                      <span>CHECKLIST INTERNO ({completedPercent}%)</span>
                      <span>{task.checklist.filter(i => i.completed).length}/{task.checklist.length}</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${completedPercent}%` }} />
                    </div>
                    {/* Checklist items list */}
                    <div className="space-y-1.5 pt-1">
                      {task.checklist.map(item => (
                        <div key={item.id} className="flex items-center gap-2 text-[11px]">
                          <input 
                            type="checkbox" 
                            checked={item.completed}
                            onChange={() => toggleChecklistItemInline(task, item.id)}
                            className="rounded text-blue-600 focus:ring-0 w-3.5 h-3.5 border-slate-300 bg-transparent"
                          />
                          <span className={`text-slate-700 dark:text-slate-300 font-medium ${item.completed ? "line-through opacity-50 text-slate-400" : ""}`}>{item.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer specs */}
                <div className="flex flex-wrap items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-3 text-[11px] text-slate-400 gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2 py-0.5 rounded border text-[11px] font-bold uppercase tracking-wider ${getPriorityBadgeColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded flex items-center gap-0.5 font-bold text-[11px] text-slate-600 dark:text-slate-300 uppercase">
                      👤 {task.responsible}
                    </span>
                    {task.cost && task.cost > 0 ? (
                      <span className="bg-amber-100 text-amber-850 dark:bg-amber-950/40 dark:text-amber-300 px-2 py-0.5 rounded font-bold flex items-center font-mono">
                        <DollarSign className="w-2.5 h-2.5" /> R$ {task.cost}
                      </span>
                    ) : null}
                    {task.recurrence && task.recurrence !== "Nenhuma" && (
                      <span className="bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300 px-2 py-0.5 rounded font-bold uppercase text-[11px] tracking-wider">
                        🔄 {task.recurrence}
                      </span>
                    )}
                  </div>

                  {/* Actions: delete */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 font-mono">⏰ {task.time || "S/ Horário"}</span>
                    <button 
                      id={`delete-task-${task.id}`}
                      onClick={() => onDeleteTask(task.id)}
                      className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
                      title="Deletar tarefa"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          }}
          />
        ) : (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-350">Nenhuma tarefa encontrada</h4>
            <p className="text-xs text-slate-400 mt-1">Experimente mudar o filtro ou adicione uma nova tarefa rápida.</p>
          </div>
        )}
      </div>


      {/* TASK CREATION MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-5 space-y-4 border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200 my-8">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Criar Nova Tarefa</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                Fechar
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Título</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Ex: Trocar lâmpada do quarto"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-800 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Descrição</label>
                <textarea 
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Instruções adicionais..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-800 dark:text-white h-14"
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
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Prioridade</label>
                  <select 
                    value={priority}
                    onChange={e => setPriority(e.target.value as TaskPriority)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 font-bold"
                  >
                    <option value="Baixa">Baixa</option>
                    <option value="Média">Média</option>
                    <option value="Alta">Alta ⚠️</option>
                    <option value="Urgente">Urgente 🔥</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Custo Financeiro (R$)</label>
                  <input 
                    type="number" 
                    value={cost}
                    onChange={e => setCost(e.target.value)}
                    placeholder="0"
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Tempo Estimado (min)</label>
                  <input 
                    type="number" 
                    value={durationEstimate}
                    onChange={e => setDurationEstimate(e.target.value)}
                    placeholder="30"
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Data</label>
                  <input 
                    type="date" 
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Horário (Opcional)</label>
                  <input 
                    type="time" 
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Ícone</label>
                  <select 
                    value={icon}
                    onChange={e => setIcon(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300"
                  >
                    <option value="CheckSquare">Geral 📋</option>
                    <option value="Wrench">Manutenção 🔧</option>
                    <option value="HeartPulse">Saúde ❤️</option>
                    <option value="Car">Transporte / Carro 🚗</option>
                    <option value="Apple">Alimentação 🍏</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Recorrência</label>
                  <select 
                    value={recurrence}
                    onChange={e => setRecurrence(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300"
                  >
                    <option value="Nenhuma">Nenhuma</option>
                    <option value="Diária">Diária</option>
                    <option value="Semanal">Semanal</option>
                    <option value="Mensal">Mensal</option>
                  </select>
                </div>
              </div>

              {/* Subtasks inside modal */}
              <div className="border border-slate-150 dark:border-slate-800 p-2.5 rounded-xl space-y-2 bg-slate-50/50 dark:bg-slate-800/40">
                <label className="block text-[11px] font-bold text-slate-400 uppercase">Checklist Interno</label>
                {checklistItems.length > 0 && (
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {checklistItems.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center gap-2 text-[11px] bg-white dark:bg-slate-900 p-1.5 rounded-lg border border-slate-100">
                        <span>{item.text}</span>
                        <button type="button" onClick={() => removeChecklistItem(idx)} className="text-red-400 hover:text-red-600">×</button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-1">
                  <input 
                    type="text"
                    value={newCheckItemText}
                    onChange={e => setNewCheckItemText(e.target.value)}
                    placeholder="Adicionar subitem..."
                    className="flex-1 p-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
                  />
                  <button 
                    type="button" 
                    onClick={addChecklistItem}
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
                Salvar Tarefa
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
