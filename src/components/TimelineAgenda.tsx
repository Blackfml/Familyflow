/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { FamilyState, CalendarEvent } from "../types";

interface TimelineAgendaProps {
  state: FamilyState;
  onAddEvent: (eventData: any) => void;
  currentUser: string;
  autoOpenAddModal?: boolean;
  onAddModalOpened?: () => void;
}

export default function TimelineAgenda({ 
  state, 
  onAddEvent, 
  currentUser, 
  autoOpenAddModal, 
  onAddModalOpened 
}: TimelineAgendaProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number>(30); // Defaults to June 30 as in mockup
  const [filterUser, setFilterUser] = useState<string>("Ambos");

  // Form states for calendar event creation
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventTime, setEventTime] = useState("09:00");
  const [eventEndTime, setEventEndTime] = useState("10:00");
  const [eventResp, setEventResp] = useState<string>("Ambos");
  const [eventCategory, setEventCategory] = useState("Rotina");
  const [eventCost, setEventCost] = useState("0");

  React.useEffect(() => {
    if (autoOpenAddModal) {
      setShowAddModal(true);
      if (onAddModalOpened) {
        onAddModalOpened();
      }
    }
  }, [autoOpenAddModal]);

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle) return;

    onAddEvent({
      title: eventTitle,
      description: eventDescription,
      date: `2026-06-${selectedDay < 10 ? "0" + selectedDay : selectedDay}`,
      startTime: eventTime,
      endTime: eventEndTime,
      responsible: eventResp,
      category: eventCategory,
      cost: parseFloat(eventCost) || 0,
      createdBy: currentUser
    });

    // Reset fields
    setEventTitle("");
    setEventDescription("");
    setEventTime("09:00");
    setEventEndTime("10:00");
    setEventResp("Ambos");
    setEventCategory("Rotina");
    setEventCost("0");
    setShowAddModal(false);
  };

  // Days of the week data mimicking Notion Calendar mockup:
  const daysOfWeek = [
    { dayName: "DOM", dateNum: 28 },
    { dayName: "SEG", dateNum: 29 },
    { dayName: "TER", dateNum: 30, active: true },
    { dayName: "QUA", dateNum: 1 },
    { dayName: "QUI", dateNum: 2 },
    { dayName: "SEX", dateNum: 3 },
    { dayName: "SÁB", dateNum: 4 },
  ];

  // Helper for colors
  const getCategoryTheme = (category: string) => {
    switch (category?.toLowerCase()) {
      case "academia":
      case "esporte":
      case "saúde":
        return {
          bg: "bg-blue-600/10 border-blue-500/20 text-blue-400",
          border: "border-l-blue-500",
          icon: "fitness_center",
          pill: "bg-blue-500/15 text-blue-400"
        };
      case "trabalho":
      case "reunião":
        return {
          bg: "bg-brand-purple/10 border-brand-purple/20 text-brand-purple",
          border: "border-l-brand-purple",
          icon: "work",
          pill: "bg-brand-purple/15 text-brand-purple"
        };
      case "refeição":
      case "almoço":
      case "jantar":
        return {
          bg: "bg-brand-success/10 border-brand-success/20 text-brand-success",
          border: "border-l-brand-success",
          icon: "restaurant",
          pill: "bg-brand-success/15 text-brand-success"
        };
      case "escola":
      case "crianças":
        return {
          bg: "bg-brand-warning/10 border-brand-warning/20 text-brand-warning",
          border: "border-l-brand-warning",
          icon: "school",
          pill: "bg-brand-warning/15 text-brand-warning"
        };
      case "manutenção":
      case "chuveiro":
        return {
          bg: "bg-brand-danger/10 border-brand-danger/20 text-brand-danger",
          border: "border-l-brand-danger",
          icon: "home_repair_service",
          pill: "bg-brand-danger/15 text-brand-danger"
        };
      default:
        return {
          bg: "bg-slate-800/20 border-slate-750 text-slate-300",
          border: "border-l-brand-primary",
          icon: "calendar_today",
          pill: "bg-slate-800 text-slate-300"
        };
    }
  };

  // Hours for vertical agenda layout
  const hoursTimeline = ["08:00", "10:00", "12:00", "15:00", "18:00", "20:00"];

  const getTimelineEvent = (hour: string) => {
    // 1. Try to find real database task or event matching selectedDay and hour
    const formattedDayStr = `2026-06-${selectedDay < 10 ? "0" + selectedDay : selectedDay}`;
    
    // Look in calendar events
    const realEvent = state.calendarEvents.find(
      e => e.date === formattedDayStr && e.startTime.startsWith(hour.split(":")[0])
    );
    if (realEvent) {
      return {
        title: realEvent.title,
        responsible: realEvent.responsible,
        category: realEvent.category,
        description: realEvent.description
      };
    }

    // Look in tasks
    const realTask = state.tasks.find(
      t => t.date === formattedDayStr && t.time && t.time.startsWith(hour.split(":")[0])
    );
    if (realTask) {
      return {
        title: realTask.title,
        responsible: realTask.responsible,
        category: realTask.category,
        description: realTask.description
      };
    }

    return null;
  };

  return (
    <div className="space-y-6 pb-32 animate-in fade-in slide-in-from-bottom-3 duration-300">
      
      {/* 1. Main Premium Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Agenda</h2>
          <p className="text-xs text-slate-400 font-medium mt-1">Calendário familiar integrado</p>
        </div>
        
        {/* Dynamic Add Button */}
        <button
          onClick={() => setShowAddModal(true)}
          className="w-10 h-10 rounded-full bg-brand-primary hover:bg-brand-primary/90 text-white flex items-center justify-center cursor-pointer active:scale-95 transition-all shadow-md shadow-brand-primary/15"
          title="Novo Evento"
        >
          <span className="material-symbols-rounded text-[21px]">add</span>
        </button>
      </div>

      {/* 2. Horizontal Calendar Week view - Style: Notion Calendar */}
      <div className="bg-brand-card rounded-3xl border border-slate-800/40 p-4 shadow-sm">
        <div className="grid grid-cols-7 gap-2">
          {daysOfWeek.map((d) => {
            const isSelected = selectedDay === d.dateNum;
            return (
              <button
                key={d.dateNum}
                onClick={() => setSelectedDay(d.dateNum)}
                className={`py-2.5 rounded-2xl flex flex-col items-center justify-center gap-1 transition cursor-pointer active:scale-95 ${
                  isSelected
                    ? "bg-brand-primary text-white font-bold shadow-md shadow-brand-primary/10"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <span className="text-[11px] font-extrabold uppercase tracking-widest">{d.dayName}</span>
                <span className="text-sm font-bold font-mono">{d.dateNum < 10 ? `0${d.dateNum}` : d.dateNum}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Daily Header Title */}
      <div className="pl-1">
        <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">
          Hoje, {selectedDay} de Junho
        </h3>
      </div>

      {/* 4. Notion Calendar Timeline layout */}
      <div className="bg-brand-card rounded-3xl border border-slate-800/40 p-5 space-y-6 relative">
        {/* Vertical timeline line */}
        <div className="absolute left-16 top-8 bottom-8 w-0.5 bg-slate-800/60" />

        {hoursTimeline.map((hour) => {
          const event = getTimelineEvent(hour);
          const theme = event ? getCategoryTheme(event.category) : null;

          return (
            <div key={hour} className="flex gap-4 items-start relative z-10 group">
              {/* Hour identifier */}
              <span className="w-12 text-[11px] font-black text-slate-500 pt-1.5 text-right shrink-0 font-mono">
                {hour}
              </span>

              {/* Node Indicator circle */}
              <div className={`w-3.5 h-3.5 rounded-full bg-brand-bg border-4 shrink-0 mt-1.5 transition-all duration-300 ${
                event ? "border-brand-primary scale-110" : "border-slate-800 group-hover:border-slate-700"
              }`} />

              {/* Event block card */}
              <div className="flex-1 min-w-0">
                {event ? (
                  <div className={`p-4 rounded-2xl border border-l-4 shadow-sm transition hover:scale-[1.01] ${theme?.bg} ${theme?.border}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white truncate">{event.title}</h4>
                        <p className="text-[11px] text-slate-400 mt-1 font-medium flex items-center gap-1">
                          <span className="material-symbols-rounded text-[12px] text-slate-500">person</span>
                          {event.responsible}
                        </p>
                      </div>
                      <span className="material-symbols-rounded text-[18px] text-slate-400">
                        {theme?.icon}
                      </span>
                    </div>
                  </div>
                ) : (
                  <span className="text-[11px] text-slate-600 italic block py-2.5">Disponível</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 5. Calendar event creation bottom dialog sheet */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-brand-card w-full max-w-sm rounded-3xl p-5 space-y-4 border border-slate-800/60 animate-in fade-in zoom-in-95 duration-250">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800/60">
              <h3 className="text-sm font-extrabold text-white">Novo Evento</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="w-7 h-7 rounded-full bg-slate-900 hover:bg-slate-850 flex items-center justify-center text-slate-400 cursor-pointer"
              >
                <span className="material-symbols-rounded text-[16px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Título do Compromisso</label>
                <input 
                  type="text" 
                  value={eventTitle}
                  onChange={e => setEventTitle(e.target.value)}
                  placeholder="Ex: Reunião do condomínio"
                  className="w-full p-3 rounded-xl border border-slate-800 bg-slate-900 text-white placeholder-slate-500 focus:outline-none focus:border-brand-primary"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Início</label>
                  <input 
                    type="time" 
                    value={eventTime}
                    onChange={e => setEventTime(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-800 bg-slate-900 text-white focus:outline-none focus:border-brand-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Término</label>
                  <input 
                    type="time" 
                    value={eventEndTime}
                    onChange={e => setEventEndTime(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-800 bg-slate-900 text-white focus:outline-none focus:border-brand-primary"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Responsável</label>
                  <select 
                    value={eventResp}
                    onChange={e => setEventResp(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-800 bg-slate-900 text-white focus:outline-none focus:border-brand-primary"
                  >
                    <option value="Ambos">Ambos 👨‍👩‍👧‍👦</option>
                    {Object.values(state.users).map((user) => (
                      <option key={user.id} value={user.name}>{user.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Categoria</label>
                  <select 
                    value={eventCategory}
                    onChange={e => setEventCategory(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-800 bg-slate-900 text-white focus:outline-none focus:border-brand-primary"
                  >
                    <option value="academia">Saúde / Academia</option>
                    <option value="trabalho">Trabalho / Reunião</option>
                    <option value="almoço">Almoço / Refeição</option>
                    <option value="escola">Escola / Crianças</option>
                    <option value="manutenção">Manutenção / Casa</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-3 bg-brand-primary hover:bg-brand-primary/90 text-white font-extrabold rounded-xl cursor-pointer active:scale-95 transition-all shadow-md shadow-brand-primary/10 mt-2"
              >
                Confirmar Evento
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
