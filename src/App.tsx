/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, Suspense, lazy } from "react";
import { 
  Home, Calendar, CheckSquare, MessageSquare, User,
  Bell, Sparkles, Clock, Wifi, Battery, ShieldAlert,
  Moon, Sun, X, CheckCircle2, AlertCircle, Check
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { FamilyState, Task, Goal, Habit, ShoppingItem, CalendarEvent, ChatMessage, UserProfile } from "./types";
import { authService } from "./services/auth";
import { api } from "./services/api";
import { useUIStore } from "./stores/useUIStore";
import AuthScreen from "./components/AuthScreen";
import NotificationCenterView from "./components/NotificationCenterView";
import { SubTabBar, TASK_SUB_TABS } from "./components/ui/SubTabBar";
import { BottomNav } from "./components/layout/BottomNav";

const HomeDashboard = lazy(() => import("./components/HomeDashboard"));
const TimelineAgenda = lazy(() => import("./components/TimelineAgenda"));
const TasksView = lazy(() => import("./components/TasksView"));
const GoalsView = lazy(() => import("./components/GoalsView"));
const HabitsView = lazy(() => import("./components/HabitsView"));
const ShoppingView = lazy(() => import("./components/ShoppingView"));
const AIChatView = lazy(() => import("./components/AIChatView"));
const FamilyChatView = lazy(() => import("./components/FamilyChatView"));
const ProfileSettingsView = lazy(() => import("./components/ProfileSettingsView"));
const BadgesDisplay = lazy(() => import("./components/BadgesDisplay"));
const Leaderboard = lazy(() => import("./components/Leaderboard"));

const motionProps = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.18, ease: "easeOut" },
} as const;

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("Home");
  const [autoOpenAddModal, setAutoOpenAddModal] = useState<string | null>(null);
  const [showFabMenu, setShowFabMenu] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<string>(() => {
    try {
      return localStorage.getItem("familyflow_current_user") || "";
    } catch (e) {
      return "";
    }
  });
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try { return localStorage.getItem("familyflow_darkMode") !== "false"; }
    catch { return true; }
  });

  const handleSelectUser = (name: string) => {
    setCurrentUser(name);
    try {
      localStorage.setItem("familyflow_current_user", name);
    } catch (e) {}
  };

  const handleLogout = async () => {
    try { await authService.signOut(); } catch {}
    setCurrentUser("");
    try {
      localStorage.removeItem("familyflow_current_user");
    } catch (e) {}
    setActiveTab("Home");
  };
  const [state, setState] = useState<FamilyState | null>(null);
  
  // Loading & notification states
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [aiRecommendation, setAiRecommendation] = useState<string>("");
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showNotificationCenter, setShowNotificationCenter] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const uiStore = useUIStore();

  useEffect(() => { uiStore.setDarkMode(darkMode); }, [darkMode]);
  useEffect(() => { uiStore.setActiveTab(activeTab); }, [activeTab]);
  useEffect(() => { uiStore.setShowFabMenu(showFabMenu); }, [showFabMenu]);
  useEffect(() => { uiStore.setShowNotifications(showNotifications); }, [showNotifications]);
  useEffect(() => { uiStore.setLoading(loading); }, [loading]);

  // Floating messaging-app style alerts state
  const [systemNotificationPermission, setSystemNotificationPermission] = useState<string>(() => {
    try {
      const emulated = localStorage.getItem("familyflow_emulated_permission");
      if (emulated) return emulated;
      return typeof Notification !== "undefined" ? Notification.permission : "default";
    } catch (e) {
      return "default";
    }
  });

  const [showNotificationPromptBanner, setShowNotificationPromptBanner] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("familyflow_dismiss_perm_banner");
      const emulated = localStorage.getItem("familyflow_emulated_permission");
      const isGranted = emulated === "granted" || (typeof Notification !== "undefined" && Notification.permission === "granted");
      return saved !== "true" && !isGranted;
    } catch (e) {
      return true;
    }
  });

  const enableEmulatedNotifications = () => {
    try { localStorage.setItem("familyflow_emulated_permission", "granted"); } catch {}
    setSystemNotificationPermission("granted");
    addFloatingAlert(
      "Ativação de Notificações",
      "Notificações registradas no aplicativo de forma segura!",
      "success"
    );
    triggerToast("Notificações ativadas com sucesso!");
  };

  const requestSystemPermission = async () => {
    if (typeof Notification === "undefined") {
      enableEmulatedNotifications();
      return;
    }

    try {
      const result = await Notification.requestPermission();
      setSystemNotificationPermission(result);
      try {
        localStorage.setItem("familyflow_emulated_permission", result);
      } catch (e) {}
      
      if (result === "granted") {
        if (navigator.serviceWorker && navigator.serviceWorker.controller) {
          navigator.serviceWorker.ready.then((reg) => {
            reg.showNotification("🔔 Notificações Ativadas!", {
              body: "Parabéns! Agora você receberá lembretes e alertas mesmo fora do app!",
              icon: "https://cdn-icons-png.flaticon.com/512/3119/3119338.png",
              badge: "https://cdn-icons-png.flaticon.com/512/3119/3119338.png",
              tag: `alert-${Date.now()}`
            });
          });
        } else {
          new Notification("🔔 Notificações Ativadas!", {
            body: "Parabéns! Agora você receberá lembretes e alertas mesmo fora do app!",
            icon: "https://cdn-icons-png.flaticon.com/512/3119/3119338.png"
          });
        }
        triggerToast("Notificações ativadas com sucesso!");
      } else {
        enableEmulatedNotifications();
      }
    } catch (err) {
      console.error("Erro ao pedir permissão de notificações nativas:", err);
      enableEmulatedNotifications();
    }
  };

  const [floatingAlerts, setFloatingAlerts] = useState<Array<{
    id: string;
    title: string;
    body: string;
    type: "task" | "notification" | "system" | "success";
    responsible?: string;
    time?: string;
    taskId?: string;
  }>>([]);

  // Already reminded tasks persistent storage to prevent repeated notifications
  const [remindedTasks, setRemindedTasks] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("familyflow_reminded_tasks");
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });

  // Track last seen notification to sync notifications in real-time
  const lastSeenNotificationId = React.useRef<string | null>(null);

  // Function to add a floating alert with sound feedback
  const addFloatingAlert = (
    title: string, 
    body: string, 
    type: "task" | "notification" | "system" | "success" = "system",
    responsible?: string,
    time?: string,
    taskId?: string
  ) => {
    const newAlert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title,
      body,
      type,
      responsible,
      time,
      taskId
    };
    setFloatingAlerts(prev => [newAlert, ...prev].slice(0, 5));

    // Auto dismiss after 7 seconds
    setTimeout(() => {
      setFloatingAlerts(prev => prev.filter(a => a.id !== newAlert.id));
    }, 7000);

    // Trigger Native OS/System notification (so the user gets it outside the app, when minimized, or screen locked!)
    if (typeof Notification !== "undefined" && (Notification.permission === "granted" || systemNotificationPermission === "granted")) {
      try {
        const cleanBody = body.replace(/[""]/g, '');
        if (navigator.serviceWorker && navigator.serviceWorker.controller) {
          navigator.serviceWorker.ready.then((reg) => {
            reg.showNotification(title, {
              body: cleanBody,
              icon: "https://cdn-icons-png.flaticon.com/512/3119/3119338.png",
              badge: "https://cdn-icons-png.flaticon.com/512/3119/3119338.png",
              tag: taskId || newAlert.id,
              renotify: true,
              silent: false,
              vibrate: [100, 50, 100],
              data: {
                taskId: taskId
              },
              actions: [
                { action: 'complete', title: '✔ Marcar Concluída' },
                { action: 'snooze', title: '⏰ Adiar 10 min' },
                { action: 'explore', title: '👀 Abrir App' }
              ]
            } as any);
          });
        } else {
          new Notification(title, {
            body: cleanBody,
            icon: "https://cdn-icons-png.flaticon.com/512/3119/3119338.png"
          });
        }
      } catch (err) {
        console.error("Erro ao disparar notificação nativa do sistema:", err);
      }
    }

    // Audio chime using browser Web Audio API
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        const audioCtx = new AudioContextClass();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.type = "sine";
        if (type === "task") {
          oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
          oscillator.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
          oscillator.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2); // G5
        } else {
          oscillator.frequency.setValueAtTime(440.00, audioCtx.currentTime); // A4
          oscillator.frequency.setValueAtTime(554.37, audioCtx.currentTime + 0.08); // C#5
          oscillator.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.16); // E5
        }
        
        gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
        
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.6);
      }
    } catch (e) {
      console.log("Audio feedback blocked:", e);
    }
  };

  const markAsReminded = (taskId: string) => {
    setRemindedTasks(prev => {
      const updated = [...prev, taskId];
      try {
        localStorage.setItem("familyflow_reminded_tasks", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  // Sync state with server on mount and every user toggle
  const fetchState = async () => {
    try {
      const data = await api.get<any>("/state");
      setState(data);
      setErrorMsg(null);
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Falha na sincronização local. reconectando...");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchState();
    let interval: ReturnType<typeof setInterval>;
    const poll = () => {
      if (document.visibilityState === "visible") {
        fetchState();
      }
    };
    interval = setInterval(poll, 15000);
    return () => clearInterval(interval);
  }, []);

  // Sync current user state if it becomes invalid
  useEffect(() => {
    if (state && Object.keys(state.users).length > 0) {
      if (currentUser && !state.users[currentUser]) {
        setCurrentUser("");
        try {
          localStorage.removeItem("familyflow_current_user");
        } catch (e) {}
      }
    }
  }, [state, currentUser]);

  // 1. Monitor scheduled times for pending tasks (reminds when task time arrives)
  useEffect(() => {
    if (!state || !state.tasks) return;

    const checkDueTasks = () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const todayStr = `${year}-${month}-${day}`;
      
      const currentHourStr = String(now.getHours()).padStart(2, '0');
      const currentMinStr = String(now.getMinutes()).padStart(2, '0');
      const currentMinutesSinceMidnight = now.getHours() * 60 + now.getMinutes();

      state.tasks.forEach((task: Task) => {
        // Requirements for notification:
        // 1. Task belongs to today
        // 2. Task status is not completed or canceled
        // 3. Task has a time specified (e.g. "18:00" or "09:30")
        // 4. Task has not been reminded yet
        if (
          task.date === todayStr &&
          task.status !== "Concluído" &&
          task.status !== "Cancelado" &&
          task.time &&
          !remindedTasks.includes(task.id)
        ) {
          const [taskHour, taskMin] = task.time.split(":").map(Number);
          if (!isNaN(taskHour) && !isNaN(taskMin)) {
            const taskMinutesSinceMidnight = taskHour * 60 + taskMin;
            
            // Trigger notification if the time has arrived (or we're within 15 minutes of it)
            const diff = currentMinutesSinceMidnight - taskMinutesSinceMidnight;
            if (diff >= 0 && diff <= 15) {
              const timeStr = task.time;
              addFloatingAlert(
                "⏰ Lembrete de Tarefa",
                `Às ${timeStr} é hora de realizar: "${task.title}"`,
                "task",
                task.responsible,
                task.time,
                task.id
              );
              
              // Mark as reminded so it doesn't fire again
              markAsReminded(task.id);
            }
          }
        }
      });
    };

    // Run immediately once state is loaded
    checkDueTasks();

    const interval = setInterval(checkDueTasks, 15000); // Check every 15 seconds
    return () => clearInterval(interval);
  }, [state, remindedTasks]);

  // 2. Real-time background notifications syncing
  useEffect(() => {
    if (!state || !state.notifications || state.notifications.length === 0) return;
    
    const newest = state.notifications[0];
    
    // Initialize the ref on first load so we don't trigger alerts for past history
    if (lastSeenNotificationId.current === null) {
      lastSeenNotificationId.current = newest.id;
      return;
    }
    
    if (newest.id !== lastSeenNotificationId.current) {
      lastSeenNotificationId.current = newest.id;
      
      // Notify if target matches "Ambos" or current user
      const isOurAlert = newest.targetUser === "Ambos" || newest.targetUser === currentUser;
      if (isOurAlert) {
        addFloatingAlert(
          newest.title,
          newest.body,
          newest.type === "ai" ? "system" : "notification"
        );
      }
    }
  }, [state, currentUser]);

  const triggerToast = (msg: string) => {
    // Redirect triggerToast to the premium floating alerts system
    addFloatingAlert("Mensagem do App", msg, "success");
  };

  // 1. SAVE TASK
  const handleSaveTask = async (taskData: any) => {
    try {
      setLoading(true);
      const data = await api.post<any>("/task", taskData);
      setState(data.state);
      triggerToast("Tarefa salva e sincronizada! 📲");
    } catch (err: any) {
      triggerToast("Erro ao sincronizar tarefa.");
    } finally {
      setLoading(false);
    }
  };

  // 2. DELETE TASK
  const handleDeleteTask = async (id: string) => {
    try {
      setLoading(true);
      const data = await api.delete<any>(`/task/${id}`);
      setState(data.state);
      triggerToast("Tarefa removida.");
    } catch (err: any) {
      triggerToast("Erro ao excluir tarefa.");
    } finally {
      setLoading(false);
    }
  };

  // 3. ADD GOAL
  const handleAddGoal = async (goalData: any) => {
    try {
      setLoading(true);
      const data = await api.post<any>("/goal", goalData);
      setState(data.state);
      triggerToast("Objetivo financeiro cadastrado! 🎯");
    } catch (err: any) {
      triggerToast("Erro ao salvar objetivo.");
    } finally {
      setLoading(false);
    }
  };

  // 4. TOGGLE HABIT
  const handleToggleHabit = async (id: string, dateStr: string, completed: boolean) => {
    try {
      const data = await api.post<any>("/habit/toggle", { id, dateStr, completed, user: currentUser });
      setState(data.state);
      if (completed) {
        triggerToast("Hábito concluído! +15 pontos 🔥");
      }
    } catch (err: any) {
      triggerToast("Erro ao registrar hábito.");
    }
  };

  // 5. ADD HABIT
  const handleAddHabit = async (habitData: any) => {
    try {
      setLoading(true);
      const data = await api.post<any>("/task", {
        title: habitData.title,
        description: habitData.description || "",
        responsible: habitData.responsible || "Ambos",
        createdBy: currentUser,
        priority: "Média",
        status: "A Fazer",
        category: "Hábito",
        date: new Date().toISOString().split("T")[0],
      });
      setState(data.state);
      triggerToast("Hábito criado com sucesso!");
    } catch (err: any) {
      triggerToast("Erro ao cadastrar hábito.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHabit = async (id: string) => {
    try {
      const data = await api.delete<any>(`/habit/${id}`);
      setState(data.state);
      triggerToast("Hábito removido.");
    } catch (err) {
      triggerToast("Erro ao excluir hábito.");
    }
  };

  // 6. SHOPPING LIST ADD
  const handleAddShoppingItem = async (itemData: any) => {
    try {
      setLoading(true);
      const data = await api.post<any>("/shopping", itemData);
      setState(data.state);
      triggerToast("Item adicionado à lista! 🛒");
    } catch (err: any) {
      triggerToast("Erro ao adicionar item de compras.");
    } finally {
      setLoading(false);
    }
  };

  // 7. SHOPPING LIST TOGGLE
  const handleToggleShoppingItem = async (id: string, purchased: boolean) => {
    try {
      const data = await api.post<any>("/shopping", { id, purchased, createdBy: currentUser });
      setState(data.state);
      if (purchased) {
        triggerToast("Comprado! +5 pontos 🎉");
      }
    } catch (err: any) {
      triggerToast("Erro ao atualizar lista de compras.");
    }
  };

  // 8. SHOPPING LIST DELETE
  const handleDeleteShoppingItem = async (id: string) => {
    try {
      const data = await api.delete<any>(`/shopping/${id}`);
      setState(data.state);
      triggerToast("Item removido.");
    } catch (err) {
      triggerToast("Erro ao remover item.");
    }
  };

  // 9. CALENDAR EVENT ADD
  const handleAddCalendarEvent = async (eventData: any) => {
    try {
      setLoading(true);
      const data = await api.post<any>("/calendar", eventData);
      setState(data.state);
      triggerToast("Evento adicionado à timeline! 📅");
    } catch (err) {
      triggerToast("Erro ao marcar compromisso.");
    } finally {
      setLoading(false);
    }
  };

  // 10. AI ASSISTANT CHAT SEND
  const handleSendChatMessage = async (prompt: string): Promise<string> => {
    try {
      setAiLoading(true);
      const data = await api.post<any>("/gemini/chat", { prompt, chatHistory: state?.chatHistory || [] });
      setState(data.state);
      return data.reply;
    } catch (err) {
      triggerToast("Erro ao conectar com Gemini API.");
      return "Erro ao consultar a IA do Gemini. Verifique se o secret GEMINI_API_KEY está configurado corretamente.";
    } finally {
      setAiLoading(false);
    }
  };

  // 11. AI REORGANIZE AGENDA
  const handleReorganizeAI = async (): Promise<string> => {
    try {
      setAiLoading(true);
      const data = await api.post<any>("/gemini/reorganize");
      setState(data.state);
      setAiRecommendation(data.recommendation);
      setActiveTab("Home");
      triggerToast("Agenda otimizada por IA! 💡");
      return data.recommendation;
    } catch (err) {
      triggerToast("Erro ao reorganizar agenda por IA.");
      return "Erro de conexão com o Gemini.";
    } finally {
      setAiLoading(false);
    }
  };

  // 12. AI ANALYZE WORKLOAD
  const handleAnalyzeWorkloadAI = async (): Promise<string> => {
    try {
      setAiLoading(true);
      const data = await api.post<any>("/gemini/analyze-workload");
      setState(data.state);
      return data.analysis;
    } catch (err) {
      triggerToast("Erro ao analisar carga de trabalho.");
      return "Erro de conexão com o Gemini.";
    } finally {
      setAiLoading(false);
    }
  };

  // 13. AI WEEKLY MEETING REVIEW
  const handleWeeklyMeetingAI = async (): Promise<string> => {
    try {
      setAiLoading(true);
      const data = await api.post<any>("/gemini/weekly-meeting");
      setState(data.state);
      return data.summary;
    } catch (err) {
      triggerToast("Erro ao gerar Reunião Semanal.");
      return "Erro de conexão com o Gemini.";
    } finally {
      setAiLoading(false);
    }
  };

  // RESET DATABASE STATE
  const handleResetState = async () => {
    try {
      setLoading(true);
      const data = await api.post<any>("/state/reset");
      setState(data.state);
      triggerToast("Estado resetado com sucesso!");
    } catch (err: any) {
      triggerToast("Erro ao resetar estado.");
    } finally {
      setLoading(false);
    }
  };

  // DELETE PROFILE
  const handleDeleteProfile = async (name: string) => {
    try {
      setLoading(true);
      const data = await api.delete<any>(`/auth/profile/${encodeURIComponent(name)}`);
      setState(data.state);
      triggerToast(`Perfil de ${name} excluído permanentemente! 👤`);
      if (currentUser === name) {
        handleLogout();
      }
    } catch (err: any) {
      triggerToast(err.message || "Erro ao excluir o perfil.");
    } finally {
      setLoading(false);
    }
  };

  // SEND GROUP/FAMILY MESSAGE HANDLER
  const handleSendGroupMessage = async (content: string) => {
    try {
      setAiLoading(true); // show a light chat load/submitting state
      const data = await api.post<any>("/chat/group", { sender: currentUser, content });
      setState(data.state);
    } catch (err) {
      triggerToast("Erro ao enviar mensagem no chat.");
    } finally {
      setAiLoading(false);
    }
  };

  // Clear unread count when reading notifications
  const handleToggleNotifications = async () => {
    const isOpening = !showNotifications;
    setShowNotifications(isOpening);
    if (isOpening && state) {
      try {
        const data = await api.post<any>("/notifications/read", { user: currentUser });
        setState(data.state);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const getUnreadNotificationsCount = () => {
    if (!state) return 0;
    return state.notifications.filter(n => 
      (n.targetUser === currentUser || n.targetUser === "Ambos") && 
      !n.readBy.includes(currentUser)
    ).length;
  };

  // Toggle Dark theme visuals
  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const next = !prev;
      try { localStorage.setItem("familyflow_darkMode", String(next)); } catch {}
      return next;
    });
  };

  if (state && (!currentUser || !state.users[currentUser])) {
    return (
      <AuthScreen 
        state={state}
        onRegisterSuccess={(newUser, updatedState) => {
          setState(updatedState);
          handleSelectUser(newUser.name);
        }}
        onSelectUser={(name) => {
          handleSelectUser(name);
        }}
        onDeleteProfile={handleDeleteProfile}
      />
    );
  }

  return (
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${darkMode ? "bg-[#090B14] text-slate-100 dark" : "bg-slate-50 text-slate-900"}`}>
      
      {/* BACKGROUND GRAPHICS FOR PREMIUM FEEL ON DESKTOP */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* COMPACT FLOATING ERROR BAR */}
      {errorMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white font-bold text-xs px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-bounce">
          <ShieldAlert className="w-4 h-4" /> {errorMsg}
        </div>
      )}

      {/* QUICK FLOATING TOAST NOTIFIER */}
      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white font-bold text-xs px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-slate-800 backdrop-blur animate-in fade-in slide-in-from-bottom-4 duration-350">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {toastMessage}
        </div>
      )}

      {/* APPLICATION CORE LAYOUT */}
      <div className="w-full max-w-md h-screen max-h-[880px] bg-[#090B14] md:rounded-[42px] md:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] border border-slate-800/80 flex flex-col overflow-hidden relative">
        
        {/* PREMIUM FLOATING NOTIFICATIONS STACK (Messaging-app style) */}
        <div className="absolute top-14 left-4 right-4 z-[99] flex flex-col gap-2 pointer-events-none">
          <AnimatePresence>
            {showNotificationPromptBanner && (
              <motion.div
                key="notification-permission-prompt"
                initial={{ opacity: 0, y: -40, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className="w-full pointer-events-auto bg-[#0d1527] border border-blue-500/30 rounded-2xl shadow-[0_15px_30px_rgba(0,0,0,0.5)] p-4 flex flex-col gap-3 relative select-none"
              >
                {/* Close Button */}
                <button
                  onClick={() => {
                    setShowNotificationPromptBanner(false);
                    try {
                      localStorage.setItem("familyflow_dismiss_perm_banner", "true");
                    } catch (e) {}
                  }}
                  className="absolute top-2.5 right-2.5 text-slate-400 hover:text-white transition p-1 rounded-lg cursor-pointer text-xs"
                >
                  ✕
                </button>

                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-blue-400 animate-bounce" />
                  </div>
                  <div className="flex-1 space-y-0.5 pr-4">
                    <h4 className="font-extrabold text-[11px] text-white tracking-tight">
                      🔔 Ativar Notificações Flutuantes?
                    </h4>
                    <p className="text-[11px] text-slate-350 leading-relaxed font-semibold">
                      Receba alertas de novas tarefas e avisos em tempo real diretamente no seu dispositivo!
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      setShowNotificationPromptBanner(false);
                      try {
                        localStorage.setItem("familyflow_dismiss_perm_banner", "true");
                      } catch (e) {}
                      await requestSystemPermission();
                    }}
                    className="flex-1 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-black text-[11px] uppercase tracking-wider rounded-xl cursor-pointer transition shadow-lg shadow-blue-500/10 text-center"
                  >
                    Sim, Ativar
                  </button>
                  <button
                    onClick={() => {
                      setShowNotificationPromptBanner(false);
                      try {
                        localStorage.setItem("familyflow_dismiss_perm_banner", "true");
                      } catch (e) {}
                      triggerToast("Você pode ativar os alertas a qualquer momento no seu perfil!");
                    }}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 font-extrabold text-[11px] uppercase tracking-wider rounded-xl cursor-pointer transition text-center"
                  >
                    Depois
                  </button>
                </div>
              </motion.div>
            )}

            {floatingAlerts.map(alert => {
              const isTask = alert.type === "task";
              const isSuccess = alert.type === "success";
              const isNotification = alert.type === "notification";
              
              // Find avatar if responsible is specified
              const responsibleUser = alert.responsible && state?.users[alert.responsible];
              const avatarUrl = responsibleUser ? responsibleUser.avatar : null;
              
              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: -40, scale: 0.92 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  className="w-full pointer-events-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/60 dark:border-slate-800/80 rounded-2xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.12),0_8px_16px_-6px_rgba(0,0,0,0.1)] p-3 flex items-start gap-3 relative select-none"
                >
                  {/* Indicator Line Left */}
                  <span className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-md ${
                    isTask ? "bg-amber-500" :
                    isSuccess ? "bg-emerald-500" :
                    isNotification ? "bg-blue-600" : "bg-slate-400"
                  }`} />
                  
                  {/* Avatar or Icon Bubble */}
                  <div className="shrink-0 mt-0.5">
                    {avatarUrl ? (
                      <div className="relative">
                        <img 
                          src={avatarUrl} 
                          alt={alert.responsible} 
                          className="w-8 h-8 rounded-full object-cover border border-slate-100 dark:border-slate-800"
                          referrerPolicy="no-referrer"
                        />
                        <span className="absolute -bottom-1 -right-1 bg-amber-500 text-[8px] p-0.5 rounded-full text-white">⏰</span>
                      </div>
                    ) : (
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                        isTask ? "bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400" :
                        isSuccess ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400" :
                        isNotification ? "bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400" :
                        "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                      }`}>
                        {isTask ? <Clock className="w-4.5 h-4.5" /> : 
                         isSuccess ? <CheckCircle2 className="w-4.5 h-4.5" /> : 
                         <Bell className="w-4.5 h-4.5" />}
                      </div>
                    )}
                  </div>
                  
                  {/* Text Contents */}
                  <div className="flex-1 space-y-1 pr-6 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-[11px] text-slate-900 dark:text-slate-100 tracking-tight block truncate">
                        {alert.title}
                      </span>
                      {alert.time && (
                        <span className="text-[8px] bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 font-black px-1.5 py-0.5 rounded-md font-mono">
                          {alert.time}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-[11px] text-slate-600 dark:text-slate-350 leading-relaxed font-medium">
                      {alert.body}
                    </p>
                    
                    {/* Interactive Quick action button for Tasks */}
                    {isTask && alert.taskId && (
                      <div className="flex gap-1.5 pt-1">
                        <button
                          onClick={async () => {
                            const task = state?.tasks.find(t => t.id === alert.taskId);
                            if (task) {
                              await handleSaveTask({ ...task, status: "Concluído" });
                            }
                            setFloatingAlerts(prev => prev.filter(a => a.id !== alert.id));
                          }}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[11px] px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all shadow-sm active:scale-95 cursor-pointer"
                        >
                          <Check className="w-3 h-3 stroke-[3]" /> Concluir
                        </button>
                        <button
                          onClick={() => {
                            setFloatingAlerts(prev => prev.filter(a => a.id !== alert.id));
                          }}
                          className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 font-extrabold text-[11px] px-2 py-1 rounded-lg transition"
                        >
                          Mais tarde
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* Dismiss Button */}
                  <button
                    onClick={() => {
                      setFloatingAlerts(prev => prev.filter(a => a.id !== alert.id));
                    }}
                    className="absolute right-2 top-2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
        
        {/* PHONE NOTCH HEADER SIMULATOR (Visually premium) */}
        <div className="bg-[#090B14] p-3 px-6 flex justify-between items-center border-b border-slate-800/60 shrink-0 select-none z-30">
          <span className="text-xs font-bold font-mono tracking-tight text-slate-400">09:41</span>
          
          {/* Mock Notch */}
          <div className="hidden md:block w-28 h-4.5 bg-black rounded-full absolute left-1/2 -translate-x-1/2 top-1" />

          {/* Core branding title in header */}
          <div className="flex items-center gap-1">
            <span className="font-extrabold text-xs tracking-tight bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">FamilyFlow</span>
            <span className="text-[7px] bg-slate-800 text-slate-400 font-extrabold px-1 rounded">PRO</span>
          </div>

          {/* Right Status Bars */}
          <div className="flex items-center gap-2 text-slate-400">
            <Wifi className="w-3.5 h-3.5" />
            <Battery className="w-4 h-4" />
          </div>
        </div>

        {/* PRIMARY SUB-HEADER: FamilyFlow Brand & Quick Menu actions */}
        <div className="p-4 px-5 bg-[#090B14] border-b border-slate-800/60 flex justify-between items-center shrink-0 z-20">
          <div className="flex items-center gap-1.5">
            <div className="p-1.5 rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-500/10">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-tight text-white">Organização Familiar</h1>
              <p className="text-[11px] text-slate-400">Ambiente Compartilhado</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Dark Mode Icon */}
            <button 
              onClick={toggleDarkMode}
              className="p-2 hover:bg-slate-900 rounded-xl transition text-slate-400 border border-transparent hover:border-slate-800"
              title="Alternar Tema"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-blue-600" />}
            </button>

            {/* Notification Bell Trigger */}
            <button 
              id="open-notifications-btn"
              onClick={handleToggleNotifications}
              className="p-2 hover:bg-slate-900 rounded-xl transition relative text-slate-400 border border-transparent hover:border-slate-800"
              title="Notificações em tempo real"
            >
              <Bell className="w-4.5 h-4.5" />
              {getUnreadNotificationsCount() > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[8px] font-bold flex items-center justify-center border border-white dark:border-slate-900 animate-pulse">
                  {getUnreadNotificationsCount()}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* NOTIFICATIONS DRAWER OVERLAY */}
        {showNotifications && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-all duration-350">
            <div className="absolute right-0 top-0 bottom-0 w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl p-5 flex flex-col animate-in slide-in-from-right duration-300">
              <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Bell className="w-4 h-4 text-blue-600" /> Central de Alertas
                </h3>
                <button 
                  onClick={() => setShowNotifications(false)}
                  className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                </button>
              </div>

              {/* List of Alerts */}
              <div className="flex-1 overflow-y-auto py-3 space-y-3">
                {state && state.notifications.length > 0 ? (
                  state.notifications.map(n => {
                    const isUnread = !n.readBy.includes(currentUser);
                    return (
                      <div 
                        key={n.id} 
                        className={`p-3 rounded-2xl border text-xs leading-relaxed space-y-1 relative ${isUnread ? "bg-blue-50/60 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900 text-slate-900 dark:text-slate-100" : "bg-slate-50 border-slate-100 dark:bg-slate-850/40 dark:border-slate-800 text-slate-700 dark:text-slate-300"}`}
                      >
                        <div className="flex justify-between items-start gap-1">
                          <span className="font-extrabold text-[11px] text-slate-900 dark:text-white">{n.title}</span>
                          {isUnread && <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping mt-1 shrink-0" />}
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 text-[11px]">{n.body}</p>
                        <span className="text-[8px] text-slate-400 block pt-1">
                          {new Date(n.timestamp).toLocaleDateString('pt-BR')} às {new Date(n.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-400 italic text-center py-10">Tudo limpo por aqui! Nenhuma notificação.</p>
                )}
              </div>

              <button 
                onClick={() => setShowNotifications(false)}
                className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs"
              >
                Voltar ao App
              </button>
            </div>
          </div>
        )}

        {/* ACTIVE MAIN SCREEN CONTENT WINDOW */}
        <div className="flex-1 overflow-y-auto p-4 px-5 pb-32">
          {loading && !state ? (
            <div className="space-y-4 p-2 animate-pulse">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-slate-800 rounded-2xl" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-slate-800 rounded w-1/3" />
                  <div className="h-3 bg-slate-800 rounded w-1/4" />
                </div>
              </div>
              <div className="flex gap-2 mb-6">
                <div className="h-10 bg-slate-800 rounded-2xl flex-1" />
                <div className="h-10 bg-slate-800 rounded-2xl flex-1" />
                <div className="h-10 bg-slate-800 rounded-2xl flex-1" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="h-28 bg-slate-800 rounded-3xl" />
                <div className="h-28 bg-slate-800 rounded-3xl" />
              </div>
              <div className="h-20 bg-slate-800 rounded-3xl" />
              <div className="h-40 bg-slate-800 rounded-3xl" />
              <div className="flex items-center justify-center mt-6 space-x-2">
                <span className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Sincronizando...</p>
              </div>
            </div>
          ) : state ? (
            <>
              {activeTab !== "Home" && (
                <div className="flex items-center gap-1.5 mb-4 text-[11px] text-slate-500 font-semibold">
                  <span className="text-slate-600 cursor-pointer hover:text-slate-300" onClick={() => setActiveTab("Home")}>Home</span>
                  <span className="text-slate-700">/</span>
                  <span className="text-slate-300">{activeTab}</span>
                </div>
              )}
            <AnimatePresence mode="wait">
              {activeTab === "Home" && (
                <motion.div key="Home" {...motionProps}>
                  <Suspense fallback={null}>
                    <HomeDashboard 
                    state={state}
                    currentUser={currentUser}
                    onSwitchUser={handleSelectUser}
                    onAddTaskClick={() => setActiveTab("Tarefas")}
                    onNavigate={setActiveTab}
                    onQuickToggleHabit={(habitId) => {
                      const todayStr = new Date().toISOString().split("T")[0];
                      const habit = state.habits.find(h => h.id === habitId);
                      const wasCompleted = habit?.history && habit.history[todayStr] === true;
                      handleToggleHabit(habitId, todayStr, !wasCompleted);
                    }}
                    onQuickCompleteTask={(taskId) => {
                      const task = state.tasks.find(t => t.id === taskId);
                      if (task) {
                        handleSaveTask({ ...task, status: "Concluído" });
                      }
                    }}
                    onReorganizeAI={handleReorganizeAI}
                    aiLoading={aiLoading}
                    aiRecommendation={aiRecommendation}
                  />
                    </Suspense>
                  </motion.div>
                )}

                {activeTab === "Agenda" && (
                  <motion.div key="Agenda" {...motionProps}>
                    <Suspense fallback={null}>
                      <TimelineAgenda 
                        state={state}
                        onAddEvent={handleAddCalendarEvent}
                        currentUser={currentUser}
                        autoOpenAddModal={autoOpenAddModal === "Agenda"}
                        onAddModalOpened={() => setAutoOpenAddModal(null)}
                      />
                    </Suspense>
                  </motion.div>
                )}

                {["Tarefas", "Objetivos", "Hábitos", "Compras"].includes(activeTab) && (
                  <motion.div key={activeTab} {...motionProps} className="space-y-6">
                    <SubTabBar tabs={TASK_SUB_TABS} activeTab={activeTab} onTabChange={setActiveTab} />

                  {activeTab === "Tarefas" && (
                    <Suspense fallback={null}>
                      <TasksView 
                        state={state}
                        onSaveTask={handleSaveTask}
                        onDeleteTask={handleDeleteTask}
                        currentUser={currentUser}
                        autoOpenAddModal={autoOpenAddModal === "Tarefas"}
                        onAddModalOpened={() => setAutoOpenAddModal(null)}
                      />
                    </Suspense>
                  )}
                  {activeTab === "Objetivos" && (
                    <Suspense fallback={null}>
                      <GoalsView 
                        state={state}
                        onAddGoal={handleAddGoal}
                        currentUser={currentUser}
                        autoOpenAddModal={autoOpenAddModal === "Objetivos"}
                        onAddModalOpened={() => setAutoOpenAddModal(null)}
                      />
                    </Suspense>
                  )}
                  {activeTab === "Hábitos" && (
                    <Suspense fallback={null}>
                      <HabitsView 
                        state={state}
                        onToggleHabit={handleToggleHabit}
                        onAddHabit={handleAddHabit}
                        onDeleteHabit={handleDeleteHabit}
                        currentUser={currentUser}
                        autoOpenAddModal={autoOpenAddModal === "Hábitos"}
                        onAddModalOpened={() => setAutoOpenAddModal(null)}
                      />
                    </Suspense>
                  )}
                  {activeTab === "Compras" && (
                    <Suspense fallback={null}>
                      <ShoppingView 
                        state={state}
                        onAddShoppingItem={handleAddShoppingItem}
                        onToggleShoppingItem={handleToggleShoppingItem}
                        onDeleteShoppingItem={handleDeleteShoppingItem}
                        currentUser={currentUser}
                        autoOpenAddModal={autoOpenAddModal === "Compras"}
                        onAddModalOpened={() => setAutoOpenAddModal(null)}
                      />
                    </Suspense>
                  )}
                </motion.div>
              )}

              {activeTab === "IA" && (
                <motion.div key="IA" {...motionProps}>
                  <Suspense fallback={null}>
                    <AIChatView 
                      state={state}
                      onSendChatMessage={handleSendChatMessage}
                      onReorganizeAI={handleReorganizeAI}
                      onAnalyzeWorkloadAI={handleAnalyzeWorkloadAI}
                      onWeeklyMeetingAI={handleWeeklyMeetingAI}
                      chatLoading={aiLoading}
                    />
                  </Suspense>
                </motion.div>
              )}

              {activeTab === "Chat" && (
                <motion.div key="Chat" {...motionProps}>
                  <Suspense fallback={null}>
                    <FamilyChatView 
                      state={state}
                      currentUser={currentUser}
                      onSendGroupMessage={handleSendGroupMessage}
                      chatLoading={aiLoading}
                    />
                  </Suspense>
                </motion.div>
              )}

              {activeTab === "Conquistas" && (
                <motion.div key="Conquistas" {...motionProps} className="space-y-6">
                  <Suspense fallback={null}>
                    <BadgesDisplay userId={currentUser} />
                  </Suspense>
                  <Suspense fallback={null}>
                    <Leaderboard currentUserId={currentUser} />
                  </Suspense>
                </motion.div>
              )}

              {activeTab === "Perfil" && (
                <motion.div key="Perfil" {...motionProps}>
                  <Suspense fallback={null}>
                    <ProfileSettingsView 
                    state={state}
                    currentUser={currentUser}
                    onSwitchUser={handleSelectUser}
                    onResetState={handleResetState}
                    darkMode={darkMode}
                    onToggleDarkMode={toggleDarkMode}
                    systemNotificationPermission={systemNotificationPermission}
                    onRequestSystemPermission={requestSystemPermission}
                    onLogout={handleLogout}
                    onDeleteProfile={handleDeleteProfile}
                    onOpenNotificationCenter={() => setShowNotificationCenter(true)}
                    onTestNotification={(type) => {
                      if (type === "task") {
                        addFloatingAlert(
                          "⏰ Lembrete de Tarefa (Teste)",
                          `Às 18:00 é hora de realizar: "Preparar jantar & organizar cozinha"`,
                          "task",
                          "Brenda",
                          "18:00",
                          "test-task-id"
                        );
                      } else if (type === "notification") {
                        addFloatingAlert(
                          "💬 Nova Mensagem de Alessandro",
                          `"Brenda, comprei o leite e o pão que faltavam! 🍞🥛"`,
                          "notification",
                          "Alessandro"
                        );
                      } else {
                        addFloatingAlert(
                          "🎉 Parabéns Casal!",
                          "Vocês completaram todos os hábitos de hoje! +50 pontos de sintonia.",
                          "success"
                        );
                      }
                    }}
                  />
                    </Suspense>
                </motion.div>
              )}
            </AnimatePresence>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-3">
              <AlertCircle className="w-12 h-12 text-red-500 animate-pulse" />
              <h3 className="font-bold text-slate-900 dark:text-white">Conexão Interrompida</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Não foi possível carregar os dados de FamilyFlow do servidor Express local.</p>
              <button onClick={fetchState} className="bg-blue-600 text-white font-bold text-xs px-4 py-2 rounded-xl shadow shadow-blue-250">Tentar Novamente</button>
            </div>
          )}
        </div>

        {/* Backdrop overlay for Bottom Sheet / FAB Menu */}
        {currentUser && showFabMenu && (
          <div 
            className="absolute inset-0 bg-black/65 backdrop-blur-[2px] z-40 md:rounded-[42px]"
            onClick={() => setShowFabMenu(false)}
          />
        )}

        {/* BOTTOM SHEET FOR RAPID FAMILIAL CREATION (Replaces the floating overlapping FAB) */}
        {currentUser && showFabMenu && (
          <div className="absolute bottom-0 left-0 right-0 bg-[#151B2C] border-t border-slate-800 rounded-t-[32px] p-6 pb-8 z-50 animate-in slide-in-from-bottom duration-300 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800/60 mb-5">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Criar Novo Item</h3>
              <button 
                onClick={() => setShowFabMenu(false)}
                className="w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-850 flex items-center justify-center text-slate-400 cursor-pointer"
              >
                <span className="material-symbols-rounded text-[18px]">close</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Option: Nova Tarefa */}
              <button
                onClick={() => {
                  setActiveTab("Tarefas");
                  setAutoOpenAddModal("Tarefas");
                  setShowFabMenu(false);
                }}
                className="p-4 bg-slate-900 hover:bg-slate-850 rounded-2xl border border-slate-800 flex flex-col items-start gap-2.5 transition active:scale-95 text-left cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-115 transition">
                  <span className="material-symbols-rounded text-[20px]">check_box</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-blue-400 transition">Nova Tarefa</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Pendências do dia</p>
                </div>
              </button>

              {/* Option: Novo Evento */}
              <button
                onClick={() => {
                  setActiveTab("Agenda");
                  setAutoOpenAddModal("Agenda");
                  setShowFabMenu(false);
                }}
                className="p-4 bg-slate-900 hover:bg-slate-850 rounded-2xl border border-slate-800 flex flex-col items-start gap-2.5 transition active:scale-95 text-left cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-115 transition">
                  <span className="material-symbols-rounded text-[20px]">calendar_month</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-emerald-400 transition">Novo Evento</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Timeline e agenda</p>
                </div>
              </button>

              {/* Option: Novo Objetivo */}
              <button
                onClick={() => {
                  setActiveTab("Objetivos");
                  setAutoOpenAddModal("Objetivos");
                  setShowFabMenu(false);
                }}
                className="p-4 bg-slate-900 hover:bg-slate-850 rounded-2xl border border-slate-800 flex flex-col items-start gap-2.5 transition active:scale-95 text-left cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-115 transition">
                  <span className="material-symbols-rounded text-[20px]">ads_click</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-indigo-400 transition">Novo Objetivo</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Metas de casal</p>
                </div>
              </button>

              {/* Option: Novo Hábito */}
              <button
                onClick={() => {
                  setActiveTab("Hábitos");
                  setAutoOpenAddModal("Hábitos");
                  setShowFabMenu(false);
                }}
                className="p-4 bg-slate-900 hover:bg-slate-850 rounded-2xl border border-slate-800 flex flex-col items-start gap-2.5 transition active:scale-95 text-left cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400 group-hover:scale-115 transition">
                  <span className="material-symbols-rounded text-[20px]">local_fire_department</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-orange-400 transition">Novo Hábito</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Rotinas diárias</p>
                </div>
              </button>

              {/* Option: Nova Compra */}
              <button
                onClick={() => {
                  setActiveTab("Compras");
                  setAutoOpenAddModal("Compras");
                  setShowFabMenu(false);
                }}
                className="p-4 bg-slate-900 hover:bg-slate-850 rounded-2xl border border-slate-800 flex flex-col items-start gap-2.5 transition active:scale-95 text-left cursor-pointer group col-span-2"
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="w-9 h-9 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400 group-hover:scale-115 transition shrink-0">
                    <span className="material-symbols-rounded text-[20px]">shopping_basket</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-sky-400 transition">Nova Compra</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Lista de supermercado familiar</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Sleek Floating Action Button (FAB) at the bottom right */}
        {currentUser && !showFabMenu && (
          <button 
            id="fab-add-btn"
            onClick={() => setShowFabMenu(true)}
            className="absolute bottom-24 right-5 w-12 h-12 rounded-2xl bg-brand-primary hover:bg-brand-primary/90 text-white flex items-center justify-center cursor-pointer transition active:scale-95 shadow-lg shadow-brand-primary/20 z-40"
            title="Adicionar Novo Item"
          >
            <span className="material-symbols-rounded text-[24px]">add</span>
          </button>
        )}

        <BottomNav
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            setShowFabMenu(false);
          }}
        />

        {/* NOTIFICATION CENTER PORTAL OVERLAY */}
        <AnimatePresence>
          {showNotificationCenter && (
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="absolute inset-0 z-[100]"
            >
              <NotificationCenterView 
                state={state}
                currentUser={currentUser}
                onClose={() => setShowNotificationCenter(false)}
                onSaveTask={handleSaveTask}
                onTriggerToast={triggerToast}
                systemNotificationPermission={systemNotificationPermission}
                onRequestSystemPermission={requestSystemPermission}
              />
            </motion.div>
          )}
        </AnimatePresence>

      </div>

    </div>
  );
}
