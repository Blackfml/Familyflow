import { useCallback, useState } from "react";
import { api } from "../services/api";
import { authService } from "../services/auth";
import { useFamilyStore } from "../stores/useFamilyStore";
import { useNotificationStore } from "../stores/useNotificationStore";
import { useAuthStore } from "../stores/useAuthStore";
import { useUIStore } from "../stores/useUIStore";

export function useFlowActions() {
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const addFloatingAlert = useCallback((
    title: string,
    body: string,
    type: "task" | "notification" | "system" | "success" = "system",
    responsible?: string,
    time?: string,
    taskId?: string
  ) => {
    useNotificationStore.getState().addFloatingAlert({ title, body, type, responsible, time, taskId });
  }, []);

  const triggerToast = useCallback((msg: string) => {
    addFloatingAlert("Mensagem do App", msg, "success");
  }, [addFloatingAlert]);

  const fetchState = useCallback(async () => {
    try {
      const data = await api.get<any>("/state");
      useFamilyStore.getState().setState(data);
      setErrorMsg(null);
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Falha na sincronização local. reconectando...");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSaveTask = useCallback(async (taskData: any) => {
    try {
      setLoading(true);
      const data = await api.post<any>("/task", taskData);
      useFamilyStore.getState().setState(data.state);
      triggerToast("Tarefa salva e sincronizada! 📲");
    } catch {
      triggerToast("Erro ao sincronizar tarefa.");
    } finally {
      setLoading(false);
    }
  }, [triggerToast]);

  const handleDeleteTask = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const data = await api.delete<any>(`/task/${id}`);
      useFamilyStore.getState().setState(data.state);
      triggerToast("Tarefa removida.");
    } catch {
      triggerToast("Erro ao excluir tarefa.");
    } finally {
      setLoading(false);
    }
  }, [triggerToast]);

  const handleAddGoal = useCallback(async (goalData: any) => {
    try {
      setLoading(true);
      const data = await api.post<any>("/goal", goalData);
      useFamilyStore.getState().setState(data.state);
      triggerToast("Objetivo financeiro cadastrado! 🎯");
    } catch {
      triggerToast("Erro ao salvar objetivo.");
    } finally {
      setLoading(false);
    }
  }, [triggerToast]);

  const handleToggleHabit = useCallback(async (id: string, dateStr: string, completed: boolean) => {
    try {
      const currentUser = useAuthStore.getState().currentUser;
      const data = await api.post<any>("/habit/toggle", { id, dateStr, completed, user: currentUser });
      useFamilyStore.getState().setState(data.state);
      if (completed) {
        triggerToast("Hábito concluído! +15 pontos 🔥");
      }
    } catch {
      triggerToast("Erro ao registrar hábito.");
    }
  }, [triggerToast]);

  const handleAddHabit = useCallback(async (habitData: any) => {
    try {
      setLoading(true);
      const currentUser = useAuthStore.getState().currentUser;
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
      useFamilyStore.getState().setState(data.state);
      triggerToast("Hábito criado com sucesso!");
    } catch {
      triggerToast("Erro ao cadastrar hábito.");
    } finally {
      setLoading(false);
    }
  }, [triggerToast]);

  const handleDeleteHabit = useCallback(async (id: string) => {
    try {
      const data = await api.delete<any>(`/habit/${id}`);
      useFamilyStore.getState().setState(data.state);
      triggerToast("Hábito removido.");
    } catch {
      triggerToast("Erro ao excluir hábito.");
    }
  }, [triggerToast]);

  const handleAddShoppingItem = useCallback(async (itemData: any) => {
    try {
      setLoading(true);
      const data = await api.post<any>("/shopping", itemData);
      useFamilyStore.getState().setState(data.state);
      triggerToast("Item adicionado à lista! 🛒");
    } catch {
      triggerToast("Erro ao adicionar item de compras.");
    } finally {
      setLoading(false);
    }
  }, [triggerToast]);

  const handleToggleShoppingItem = useCallback(async (id: string, purchased: boolean) => {
    try {
      const currentUser = useAuthStore.getState().currentUser;
      const data = await api.post<any>("/shopping", { id, purchased, createdBy: currentUser });
      useFamilyStore.getState().setState(data.state);
      if (purchased) {
        triggerToast("Comprado! +5 pontos 🎉");
      }
    } catch {
      triggerToast("Erro ao atualizar lista de compras.");
    }
  }, [triggerToast]);

  const handleDeleteShoppingItem = useCallback(async (id: string) => {
    try {
      const data = await api.delete<any>(`/shopping/${id}`);
      useFamilyStore.getState().setState(data.state);
      triggerToast("Item removido.");
    } catch {
      triggerToast("Erro ao remover item.");
    }
  }, [triggerToast]);

  const handleAddCalendarEvent = useCallback(async (eventData: any) => {
    try {
      setLoading(true);
      const data = await api.post<any>("/calendar", eventData);
      useFamilyStore.getState().setState(data.state);
      triggerToast("Evento adicionado à timeline! 📅");
    } catch {
      triggerToast("Erro ao marcar compromisso.");
    } finally {
      setLoading(false);
    }
  }, [triggerToast]);

  const handleSendChatMessage = useCallback(async (prompt: string): Promise<string> => {
    try {
      setAiLoading(true);
      const chatHistory = useFamilyStore.getState().state?.chatHistory || [];
      const data = await api.post<any>("/gemini/chat", { prompt, chatHistory });
      useFamilyStore.getState().setState(data.state);
      return data.reply;
    } catch {
      triggerToast("Erro ao conectar com Gemini API.");
      return "Erro ao consultar a IA do Gemini. Verifique se o secret GEMINI_API_KEY está configurado corretamente.";
    } finally {
      setAiLoading(false);
    }
  }, [triggerToast]);

  const handleReorganizeAI = useCallback(async (): Promise<string> => {
    try {
      setAiLoading(true);
      const data = await api.post<any>("/gemini/reorganize");
      useFamilyStore.getState().setState(data.state);
      setAiRecommendation(data.recommendation);
      triggerToast("Agenda otimizada por IA! 💡");
      return data.recommendation;
    } catch {
      triggerToast("Erro ao reorganizar agenda por IA.");
      return "Erro de conexão com o Gemini.";
    } finally {
      setAiLoading(false);
    }
  }, [triggerToast]);

  const handleAnalyzeWorkloadAI = useCallback(async (): Promise<string> => {
    try {
      setAiLoading(true);
      const data = await api.post<any>("/gemini/analyze-workload");
      useFamilyStore.getState().setState(data.state);
      return data.analysis;
    } catch {
      triggerToast("Erro ao analisar carga de trabalho.");
      return "Erro de conexão com o Gemini.";
    } finally {
      setAiLoading(false);
    }
  }, [triggerToast]);

  const handleWeeklyMeetingAI = useCallback(async (): Promise<string> => {
    try {
      setAiLoading(true);
      const data = await api.post<any>("/gemini/weekly-meeting");
      useFamilyStore.getState().setState(data.state);
      return data.summary;
    } catch {
      triggerToast("Erro ao gerar Reunião Semanal.");
      return "Erro de conexão com o Gemini.";
    } finally {
      setAiLoading(false);
    }
  }, [triggerToast]);

  const handleResetState = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.post<any>("/state/reset");
      useFamilyStore.getState().setState(data.state);
      triggerToast("Estado resetado com sucesso!");
    } catch {
      triggerToast("Erro ao resetar estado.");
    } finally {
      setLoading(false);
    }
  }, [triggerToast]);

  const handleDeleteProfile = useCallback(async (name: string) => {
    try {
      setLoading(true);
      const data = await api.delete<any>(`/auth/profile/${encodeURIComponent(name)}`);
      useFamilyStore.getState().setState(data.state);
      triggerToast(`Perfil de ${name} excluído permanentemente! 👤`);
      const currentUser = useAuthStore.getState().currentUser;
      if (currentUser === name) {
        await authService.signOut();
        useAuthStore.getState().logout();
        useUIStore.getState().setActiveTab("Home");
      }
    } catch (err: any) {
      triggerToast(err.message || "Erro ao excluir o perfil.");
    } finally {
      setLoading(false);
    }
  }, [triggerToast]);

  const handleSendGroupMessage = useCallback(async (content: string) => {
    try {
      setAiLoading(true);
      const currentUser = useAuthStore.getState().currentUser;
      const data = await api.post<any>("/chat/group", { sender: currentUser, content });
      useFamilyStore.getState().setState(data.state);
    } catch {
      triggerToast("Erro ao enviar mensagem no chat.");
    } finally {
      setAiLoading(false);
    }
  }, [triggerToast]);

  const handleToggleNotifications = useCallback(async () => {
    const notifState = useNotificationStore.getState();
    const isOpening = !notifState.showNotifications;
    notifState.setShowNotifications(isOpening);
    if (isOpening) {
      try {
        const currentUser = useAuthStore.getState().currentUser;
        const data = await api.post<any>("/notifications/read", { user: currentUser });
        useFamilyStore.getState().setState(data.state);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const getUnreadNotificationsCount = useCallback(() => {
    const state = useFamilyStore.getState().state;
    const currentUser = useAuthStore.getState().currentUser;
    if (!state) return 0;
    return state.notifications.filter(
      (n) => (n.targetUser === currentUser || n.targetUser === "Ambos") && !n.readBy.includes(currentUser)
    ).length;
  }, []);

  const toggleDarkMode = useCallback(() => {
    const uiStore = useUIStore.getState();
    const next = !uiStore.darkMode;
    try { localStorage.setItem("familyflow_darkMode", String(next)); } catch {}
    useUIStore.getState().setDarkMode(next);
  }, []);

  return {
    loading,
    aiLoading,
    aiRecommendation,
    errorMsg,
    setErrorMsg,
    fetchState,
    handleSaveTask,
    handleDeleteTask,
    handleAddGoal,
    handleToggleHabit,
    handleAddHabit,
    handleDeleteHabit,
    handleAddShoppingItem,
    handleToggleShoppingItem,
    handleDeleteShoppingItem,
    handleAddCalendarEvent,
    handleSendChatMessage,
    handleReorganizeAI,
    handleAnalyzeWorkloadAI,
    handleWeeklyMeetingAI,
    handleResetState,
    handleDeleteProfile,
    handleSendGroupMessage,
    handleToggleNotifications,
    getUnreadNotificationsCount,
    toggleDarkMode,
    addFloatingAlert,
    triggerToast,
  };
}
